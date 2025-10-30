// Patient Dashboard Types

export interface Medicine {
  medicine_id: string;
  name: string;
  description?: string;
  manufacturer?: string;
}

export interface Prescription {
  prescription_id: string;
  patient_id: string;
  doctor_id: string;
  medicine_id: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  // Joined medicine data
  medicine?: Medicine;
}

export interface Reminder {
  reminder_id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_datetime: string;
  status: "pending" | "completed" | "cancelled";
  created_at: string;
}

export interface ChatMessage {
  message_id: string;
  user_id: string;
  message_text: string;
  sender_type: "patient" | "bot";
  timestamp: string;
}

export interface HealthRecord {
  record_id: string;
  patient_id: string;
  heart_rate?: number;
  blood_pressure?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  notes?: string;
  datetime: string;
  created_at: string;
}
