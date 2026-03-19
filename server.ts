import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("dalsu.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL, -- 'customer', 'technician', 'admin', 'b2b'
    phone TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS technician_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    service_area TEXT,
    badges TEXT, -- JSON array
    equipment TEXT, -- JSON array
    rating REAL DEFAULT 5.0,
    is_verified INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    media_url TEXT,
    location TEXT NOT NULL,
    urgency TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, QUOTED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
    diagnosis_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS diagnosis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT,
    data TEXT, -- JSON string from AI
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    technician_id INTEGER NOT NULL,
    price_min INTEGER NOT NULL,
    price_max INTEGER NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(request_id) REFERENCES service_requests(id),
    FOREIGN KEY(technician_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    technician_id INTEGER NOT NULL,
    quote_id INTEGER,
    status TEXT DEFAULT 'CONFIRMED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(request_id) REFERENCES service_requests(id),
    FOREIGN KEY(technician_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS job_proofs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    before_photo TEXT,
    after_photo TEXT,
    gps_lat REAL,
    gps_lng REAL,
    customer_approved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(booking_id) REFERENCES bookings(id)
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'MONTHLY', 'YEARLY'
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    status TEXT DEFAULT 'ACTIVE',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS b2b_clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company_name TEXT NOT NULL,
    properties TEXT, -- JSON array of property objects
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed some data if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  const insertUser = db.prepare("INSERT INTO users (role, phone, name, location) VALUES (?, ?, ?, ?)");
  insertUser.run("admin", "010-0000-0000", "관리자", "서울시 강남구");
  insertUser.run("technician", "010-1111-1111", "김달수 기사", "서울시 서초구");
  insertUser.run("customer", "010-2222-2222", "이영희", "서울시 마포구");
  insertUser.run("b2b", "010-3333-3333", "현대아파트 관리소", "서울시 송파구");

  db.prepare("INSERT INTO technician_profiles (user_id, service_area, badges, equipment, rating, is_verified) VALUES (?, ?, ?, ?, ?, ?)")
    .run(2, "서울 전지역", JSON.stringify(["Certified", "Top Rated"]), JSON.stringify(["Endoscope", "High Pressure"]), 4.9, 1);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { phone, role } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE phone = ?").get(phone) as any;
    if (user) {
      if (user.role === 'technician') {
        const profile = db.prepare("SELECT * FROM technician_profiles WHERE user_id = ?").get(user.id) as any;
        user.profile = profile ? { ...profile, badges: JSON.parse(profile.badges), equipment: JSON.parse(profile.equipment) } : null;
      }
      
      // Get subscription info
      const subscription = db.prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'ACTIVE'").get(user.id) as any;
      user.subscription = subscription || null;
      
      res.json(user);
    } else {
      // Auto-register with provided role or default to customer
      const finalRole = role || 'customer';
      const name = finalRole === 'technician' ? '신규 기사님' : '신규 고객님';
      const info = db.prepare("INSERT INTO users (role, phone, name) VALUES (?, ?, ?)").run(finalRole, phone, name);
      const newUser = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid) as any;
      
      if (finalRole === 'technician') {
        db.prepare("INSERT INTO technician_profiles (user_id, service_area, badges, equipment) VALUES (?, ?, ?, ?)")
          .run(newUser.id, "서울", JSON.stringify(["Certified"]), JSON.stringify([]));
        const profile = db.prepare("SELECT * FROM technician_profiles WHERE user_id = ?").get(newUser.id) as any;
        newUser.profile = { ...profile, badges: JSON.parse(profile.badges), equipment: JSON.parse(profile.equipment) };
      }
      
      res.json(newUser);
    }
  });

  app.get("/api/requests/pending", (req, res) => {
  const requests = db.prepare(`
    SELECT r.*, u.name as customer_name, u.phone as customer_phone
    FROM service_requests r
    JOIN users u ON r.user_id = u.id
    WHERE r.status = 'PENDING'
    ORDER BY r.created_at DESC
  `).all();

  res.json(requests);
});

  app.get("/api/users/:id", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
    res.json(user);
  });

  app.post("/api/diagnosis", async (req, res) => {
    const { userId, category, result } = req.body;
    const info = db.prepare("INSERT INTO diagnosis_results (user_id, category, data) VALUES (?, ?, ?)").run(userId, category, JSON.stringify(result));
    res.json({ id: info.lastInsertRowid, ...result });
  });

  app.post("/api/requests", (req, res) => {
    console.log("POST /api/requests received:", req.body);
    const { 
      userId, user_id, 
      category, 
      location, 
      urgency, 
      mediaUrl, media_url, 
      diagnosisId, diagnosis_id 
    } = req.body;
    
    const finalUserId = userId || user_id;
    const finalMediaUrl = mediaUrl || media_url;
    const finalDiagnosisId = diagnosisId || diagnosis_id;

    if (!finalUserId) {
      console.error("Missing userId in request body");
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      const info = db.prepare("INSERT INTO service_requests (user_id, category, location, urgency, media_url, diagnosis_id) VALUES (?, ?, ?, ?, ?, ?)")
        .run(finalUserId, category, location, urgency, finalMediaUrl, finalDiagnosisId);
      console.log("Request created with ID:", info.lastInsertRowid);
      res.json({ id: info.lastInsertRowid });
    } catch (error) {
      console.error("Database error creating request:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/requests/user/:userId", (req, res) => {
    const requests = db.prepare(`
      SELECT * FROM service_requests 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.params.userId);
    res.json(requests);
  });

  app.get("/api/requests/:requestId/quotes", (req, res) => {
    const quotes = db.prepare(`
      SELECT q.*, u.name as technician_name, tp.rating, tp.badges
      FROM quotes q
      JOIN users u ON q.technician_id = u.id
      JOIN technician_profiles tp ON u.id = tp.user_id
      WHERE q.request_id = ?
    `).all(req.params.requestId) as any[];
    
    const formattedQuotes = quotes.map(q => ({
      ...q,
      badges: JSON.parse(q.badges)
    }));
    
    res.json(formattedQuotes);
  });

  app.post("/api/sms/send", (req, res) => {
    const { to, message } = req.body;
    console.log(`[SMS MOCK] Sending to ${to}: ${message}`);
    // In a real app, this would call an SMS API like Twilio or Aligo
    res.json({ success: true, messageId: "mock-id-" + Date.now() });
  });

  app.get("/api/requests/pending", (req, res) => {
    const requests = db.prepare(`
      SELECT r.*, u.name as customer_name 
      FROM service_requests r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.status = 'PENDING'
      ORDER BY r.created_at DESC
    `).all();
    res.json(requests);
  });

  app.get("/api/technician/jobs/:id", (req, res) => {
    const jobs = db.prepare(`
      SELECT b.*, r.category, r.location, r.urgency, u.name as customer_name
      FROM bookings b
      JOIN service_requests r ON b.request_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE b.technician_id = ?
    `).all(req.params.id);
    res.json(jobs);
  });

  app.get("/api/b2b/stats", (req, res) => {
    // Mock stats for B2B
    res.json({
      totalInspections: 45,
      pendingRepairs: 3,
      monthlyCost: 1250000,
      nextInspection: "2026-03-15"
    });
  });

  app.get("/api/admin/stats", (req, res) => {
    const stats = {
      totalRevenue: 15400000,
      activeTechnicians: 12,
      pendingVerifications: 2,
      customerSatisfaction: 4.8
    };
    res.json(stats);
  });

  app.post("/api/subscriptions", (req, res) => {
    const { userId, type } = req.body;
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (type === 'MONTHLY' ? 1 : 12));
    
    // Deactivate old subscriptions
    db.prepare("UPDATE subscriptions SET status = 'EXPIRED' WHERE user_id = ?").run(userId);
    
    const info = db.prepare("INSERT INTO subscriptions (user_id, type, end_date, status) VALUES (?, ?, ?, ?)")
      .run(userId, type, endDate.toISOString(), 'ACTIVE');
    
    const newSub = db.prepare("SELECT * FROM subscriptions WHERE id = ?").get(info.lastInsertRowid);
    res.json(newSub);
  });

  app.get("/api/subscriptions/user/:userId", (req, res) => {
    const sub = db.prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'ACTIVE'").get(req.params.userId);
    res.json(sub || null);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
