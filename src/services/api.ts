import { User, DiagnosisResult, ServiceRequest } from '../types';

const API_BASE_URL = '';

export const api = {
  login: async (phone: string, role: string = 'customer'): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, role }),
    });
    return res.json();
  },

  saveDiagnosis: async (data: { userId: number; category: string; result: DiagnosisResult }): Promise<DiagnosisResult> => {
    const res = await fetch(`${API_BASE_URL}/api/diagnosis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  createRequest: async (data: Partial<ServiceRequest>): Promise<{ id: number }> => {
    console.log("api.createRequest calling with:", data);
    const res = await fetch(`${API_BASE_URL}/api/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${res.status}`);
    }
    return res.json();
  },

  getPendingRequests: async (): Promise<ServiceRequest[]> => {
    const res = await fetch(`${API_BASE_URL}/api/requests/pending`);
    return res.json();
  },

  getUserRequests: async (userId: number): Promise<ServiceRequest[]> => {
    const res = await fetch(`${API_BASE_URL}/api/requests/user/${userId}`);
    return res.json();
  },

  getRequestQuotes: async (requestId: number): Promise<any[]> => {
    const res = await fetch(`${API_BASE_URL}/api/requests/${requestId}/quotes`);
    return res.json();
  },

  getAdminStats: async () => {
    const res = await fetch(`${API_BASE_URL}/api/admin/stats`);
    return res.json();
  },

  getB2BStats: async () => {
    const res = await fetch(`${API_BASE_URL}/api/b2b/stats`);
    return res.json();
  },

  getTechnicianProfile: async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/technicians/${userId}/profile`);
    return res.json();
  },

  subscribe: async (userId: number, type: 'MONTHLY' | 'YEARLY'): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/api/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type }),
    });
    return res.json();
  },

  sendMessage: async (message: string, history: any[] = []): Promise<string> => {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    const data = await res.json();
    return data.response;
  },
  
  sendSMS: async (to: string, message: string): Promise<any> => {
    const res = await fetch(`${API_BASE_URL}/api/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    });
    return res.json();
  }
};
