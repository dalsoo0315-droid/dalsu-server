export interface User {
  id: string;
  role: 'customer' | 'technician' | 'admin' | 'b2b';
  phone: string;
  name: string;
  location?: string;
  profile?: TechnicianProfile;
  subscription?: {
    type: string;
    status: string;
    end_date: string;
  };
}

export interface DiagnosisResult {
  id: string;
  possibleCauses: { cause: string; probability: number }[];
  estimatedPriceRange: { min: number; max: number };
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendedService: string;
  advice: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  customer_name?: string;
  category: string;
  media_url?: string;
  location: string;
  urgency: string;
  status: string;
  diagnosis_id?: string;
  created_at: string;
}

export interface TechnicianProfile {
  id: string;
  user_id: string;
  service_area: string;
  badges: string[];
  equipment: string[];
  rating: number;
  is_verified: boolean;
}
