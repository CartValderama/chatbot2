import { supabase } from "@/api/supabaseClient";
import type {
  Prescription,
  Reminder,
  ChatMessage,
  HealthRecord,
} from "@/types/patient";

/**
 * Check if user has an active session
 * Returns false if user is logged out
 */
async function hasActiveSession(): Promise<boolean> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session !== null;
  } catch (error) {
    console.warn("Error checking session:", error);
    return false;
  }
}

export const patientService = {
  /**
   * Fetch all prescriptions for a patient (joined with medicines table)
   */
  async getPrescriptions(patientId: string): Promise<Prescription[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase
        .from("prescriptions")
        .select(
          `
          *,
          medicine:medicines(*)
        `
        )
        .eq("patient_id", patientId) // correct column
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not fetch prescriptions:", error.message);
        return [];
      }

      return (data as Prescription[]) || [];
    } catch (error) {
      console.warn("Unexpected error fetching prescriptions:", error);
      return [];
    }
  },

  /**
   * Fetch all reminders for a patient
   */
  async getReminders(patientId: string): Promise<Reminder[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("patient_id", patientId) // corrected
        .order("reminder_datetime", { ascending: true }); // keep original column

      if (error) {
        console.warn("Could not fetch reminders:", error.message);
        return [];
      }

      return (data as Reminder[]) || [];
    } catch (error) {
      console.warn("Unexpected error fetching reminders:", error);
      return [];
    }
  },

  /**
   * Fetch all chat messages for a patient
   */
  async getChatMessages(patientId: string): Promise<ChatMessage[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("patient_id", patientId) // corrected
        .order("timestamp", { ascending: true });

      if (error) {
        console.warn("Could not fetch chat messages:", error.message);
        return [];
      }

      return (data as ChatMessage[]) || [];
    } catch (error) {
      console.warn("Unexpected error fetching chat messages:", error);
      return [];
    }
  },

  /**
   * Fetch all health records for a patient
   */
  async getHealthRecords(patientId: string): Promise<HealthRecord[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .eq("patient_id", patientId)
        .order("datetime", { ascending: false }); // corrected column

      if (error) {
        console.warn("Could not fetch health records:", error.message);
        return [];
      }

      return (data as HealthRecord[]) || [];
    } catch (error) {
      console.warn("Unexpected error fetching health records:", error);
      return [];
    }
  },
};
