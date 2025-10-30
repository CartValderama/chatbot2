import { supabase } from "@/api/supabaseClient";
import type {
  Medicine,
  Prescription,
  HealthRecord,
  User,
  Doctor,
  Reminder,
} from "@/types/database";

/**
 * User profile interface for admin dashboard
 * Represents users that can be managed by admins
 */
export type AdminUser = User;

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

export const adminService = {
  async getAllPrescribedMedicines(): Promise<Medicine[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase
        .from("prescriptions")
        .select(`medicine:medicines(*)`);

      if (error || !data) return [];

      const medicinesMap = new Map<number, Medicine>();

      // Type the response properly for Supabase joined data
      type PrescriptionWithMedicine = {
        medicine: Medicine | null;
      };

      const prescriptions = data as unknown as PrescriptionWithMedicine[];

      prescriptions.forEach((p) => {
        if (p.medicine) medicinesMap.set(p.medicine.medicine_id, p.medicine);
      });

      return Array.from(medicinesMap.values());
    } catch {
      return [];
    }
  },

  async getPrescriptions(): Promise<Prescription[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase
        .from("prescriptions")
        .select(`*, medicine:medicines(*)`)
        .order("created_date", { ascending: false });

      if (error) return [];
      return data as Prescription[];
    } catch {
      return [];
    }
  },

  async getAllPatients(): Promise<AdminUser[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase.from("users").select("*");

      if (error) return [];
      return data as AdminUser[];
    } catch {
      return [];
    }
  },

  async getAllHealthRecords(): Promise<HealthRecord[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .order("date_time", { ascending: false });

      if (error) return [];
      return data as HealthRecord[];
    } catch {
      return [];
    }
  },

  async getAllMedicines(): Promise<Medicine[]> {
    const { data } = await supabase.from("medicines").select("*");
    return (data as Medicine[]) || [];
  },

  async getAllDoctors(): Promise<Doctor[]> {
    const { data } = await supabase.from("doctors").select("*");
    return (data as Doctor[]) || [];
  },

  // CRUD operations remain unchanged
  createMedicine: async (medicine: Omit<Medicine, "medicine_id" | "created_date">) => {
    try {
      const { data, error } = await supabase
        .from("medicines")
        .insert([medicine])
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Medicine };
    } catch (error) {
      console.error("Error creating medicine:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create medicine",
      };
    }
  },

  updateMedicine: async (
    medicineId: number,
    updates: Partial<Omit<Medicine, "medicine_id" | "created_date">>
  ) => {
    try {
      const { data, error } = await supabase
        .from("medicines")
        .update(updates)
        .eq("medicine_id", medicineId)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Medicine };
    } catch (error) {
      console.error("Error updating medicine:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update medicine",
      };
    }
  },

  deleteMedicine: async (medicineId: number) => {
    const { error } = await supabase
      .from("medicines")
      .delete()
      .eq("medicine_id", medicineId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  createPrescription: async (
    prescription: Omit<
      Prescription,
      "prescription_id" | "created_date" | "medicine"
    >
  ) => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .insert([prescription])
        .select(`*, medicine:medicines(*)`)
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Prescription };
    } catch (error) {
      console.error("Error creating prescription:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create prescription",
      };
    }
  },

  updatePrescription: async (
    prescriptionId: number,
    updates: Partial<
      Omit<Prescription, "prescription_id" | "created_date" | "medicine">
    >
  ) => {
    try {
      const { data, error } = await supabase
        .from("prescriptions")
        .update(updates)
        .eq("prescription_id", prescriptionId)
        .select(`*, medicine:medicines(*)`)
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Prescription };
    } catch (error) {
      console.error("Error updating prescription:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update prescription",
      };
    }
  },

  deletePrescription: async (prescriptionId: number) => {
    const { error } = await supabase
      .from("prescriptions")
      .delete()
      .eq("prescription_id", prescriptionId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  createHealthRecord: async (
    record: Omit<HealthRecord, "record_id" | "created_date">
  ) => {
    try {
      const { data, error } = await supabase
        .from("health_records")
        .insert(record)
        .select("*")
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as HealthRecord };
    } catch (error) {
      console.error("Error creating health record:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create health record",
      };
    }
  },

  updateHealthRecord: async (
    recordId: number,
    updates: Partial<
      Omit<HealthRecord, "record_id" | "date_time" | "created_date">
    >
  ) => {
    try {
      const { data, error } = await supabase
        .from("health_records")
        .update(updates)
        .eq("record_id", recordId)
        .select("*")
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as HealthRecord };
    } catch (error) {
      console.error("Error updating health record:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update health record",
      };
    }
  },

  deleteHealthRecord: async (recordId: number) => {
    const { error } = await supabase
      .from("health_records")
      .delete()
      .eq("record_id", recordId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  createDoctor: async (doctor: Omit<Doctor, "doctor_id" | "created_date">) => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .insert([doctor])
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Doctor };
    } catch (error) {
      console.error("Error creating doctor:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create doctor",
      };
    }
  },

  updateDoctor: async (
    doctorId: number,
    updates: Partial<Omit<Doctor, "doctor_id" | "created_date">>
  ) => {
    try {
      const { data, error } = await supabase
        .from("doctors")
        .update(updates)
        .eq("doctor_id", doctorId)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Doctor };
    } catch (error) {
      console.error("Error updating doctor:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update doctor",
      };
    }
  },

  deleteDoctor: async (doctorId: number) => {
    const { error } = await supabase
      .from("doctors")
      .delete()
      .eq("doctor_id", doctorId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  async getAllReminders(): Promise<Reminder[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .order("reminder_datetime", { ascending: false });

      if (error) return [];
      return data as Reminder[];
    } catch {
      return [];
    }
  },

  createReminder: async (
    reminder: Omit<Reminder, "reminder_id" | "created_date">
  ) => {
    try {
      const { data, error } = await supabase
        .from("reminders")
        .insert([reminder])
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Reminder };
    } catch (error) {
      console.error("Error creating reminder:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create reminder",
      };
    }
  },

  updateReminder: async (
    reminderId: number,
    updates: Partial<Omit<Reminder, "reminder_id" | "created_date">>
  ) => {
    try {
      const { data, error } = await supabase
        .from("reminders")
        .update(updates)
        .eq("reminder_id", reminderId)
        .select()
        .single();
      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Reminder };
    } catch (error) {
      console.error("Error updating reminder:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update reminder",
      };
    }
  },

  deleteReminder: async (reminderId: number) => {
    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("reminder_id", reminderId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
