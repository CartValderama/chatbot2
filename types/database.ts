// Database Schema Types

/**
 * User Roles
 */
export type UserRole = "user" | "admin";

/**
 * Gender Options
 */
export type Gender = "Male" | "Female" | "Other";

/**
 * Users Table
 */
export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  birth_date?: string; // SQL 'date'
  gender?: Gender;
  phone?: string;
  email?: string;
  address?: string;
  role: UserRole; // default 'user'
  primary_doctor_id?: number;
  registration_date: string; // timestamp
}

/**
 * Doctors Table
 */
export interface Doctor {
  doctor_id: number;
  name: string; // SQL has one 'name' field
  speciality?: string;
  phone?: string;
  email?: string;
  hospital?: string;
  license_number?: string;
  created_date: string; // timestamp
}

/**
 * Medicines Table
 */
export interface Medicine {
  medicine_id: number;
  name: string;
  type?: string;
  dosage?: string;
  side_effects?: string;
  instructions?: string;
  created_date: string; // timestamp
}

/**
 * Prescriptions Table
 */
export interface Prescription {
  prescription_id: number;
  user_id: number;
  doctor_id: number;
  medicine_id: number;
  start_date: string; // date
  end_date?: string; // date
  dosage?: string;
  frequency?: string;
  instructions?: string;
  created_date: string; // timestamp

  // Joined relations
  medicine?: Medicine;
  user?: User;
  doctor?: Doctor;
}

/**
 * Health Records Table
 */
export interface HealthRecord {
  record_id: number;
  user_id: number;
  date_time: string; // timestamp
  heart_rate?: number;
  blood_pressure?: string;
  blood_sugar?: number;
  temperature?: number;
  notes?: string;
  created_date: string; // timestamp

  user?: User;
}

/**
 * Reminders Table
 */
export type ReminderStatus = "Pending" | "Sent" | "Acknowledged" | "Missed";

export interface Reminder {
  reminder_id: number;
  user_id: number;
  prescription_id: number;
  reminder_datetime: string; // timestamp
  status: ReminderStatus;
  notes?: string;
  created_date: string; // timestamp
}

/**
 * Chat Messages Table
 */
export type SenderType = "User" | "Bot";

export interface ChatMessage {
  message_id: number;
  user_id: number;
  message_text: string;
  sender_type: SenderType;
  timestamp: string; // timestamp
  intent?: string;
}

/**
 * Profile Type for authenticated users
 */
export interface UserProfile extends User {
  role: UserRole;
}

// Legacy aliases
export type Patient = User;
export type { User as PatientType };

/**
 * Supabase Database Type
 * Wrapper for alle tabeller i databasen
 */
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, "user_id" | "registration_date">;
        Update: Partial<Omit<User, "user_id">>;
      };
      doctors: {
        Row: Doctor;
        Insert: Omit<Doctor, "doctor_id" | "created_date">;
        Update: Partial<Omit<Doctor, "doctor_id">>;
      };
      medicines: {
        Row: Medicine;
        Insert: Omit<Medicine, "medicine_id" | "created_date">;
        Update: Partial<Omit<Medicine, "medicine_id">>;
      };
      prescriptions: {
        Row: Prescription;
        Insert: Omit<Prescription, "prescription_id" | "created_date">;
        Update: Partial<Omit<Prescription, "prescription_id">>;
      };
      health_records: {
        Row: HealthRecord;
        Insert: Omit<HealthRecord, "record_id" | "created_date">;
        Update: Partial<Omit<HealthRecord, "record_id">>;
      };
      reminders: {
        Row: Reminder;
        Insert: Omit<Reminder, "reminder_id" | "created_date">;
        Update: Partial<Omit<Reminder, "reminder_id">>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, "message_id">;
        Update: Partial<Omit<ChatMessage, "message_id">>;
      };
    };
  };
}
