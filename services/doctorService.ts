import { supabase } from "@/api/supabaseClient";
import type { Medicine, Prescription, HealthRecord } from "@/types/patient";

/**
 * Patient profile interface for doctor dashboard
 */
export interface DoctorPatient {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  user_type: "patient";
  primary_doctor_id?: string;
}

/**
 * Prescription with medicine join result from Supabase
 * When selecting with a join, Supabase returns the joined table as an object
 */
interface PrescriptionWithMedicineJoin {
  medicine: Medicine;
}

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

export const doctorService = {
  /**
   * Fetch all unique medicines prescribed by the doctor
   * Extracts distinct medicines from all prescriptions created by this doctor
   */
  async getAllPrescribedMedicines(doctorId: string): Promise<Medicine[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase
        .from("prescriptions")
        .select(
          `
          medicine:medicines(*)
        `
        )
        .eq("doctor_id", doctorId);

      if (error) {
        console.warn("Could not fetch prescribed medicines:", error.message);
        return [];
      }

      if (!data) return [];

      // Extract unique medicines from the prescriptions
      const medicinesMap = new Map<string, Medicine>();

      // Type assertion to handle Supabase's dynamic query result
      const prescriptions = data as unknown as PrescriptionWithMedicineJoin[];

      prescriptions.forEach((prescription) => {
        if (prescription.medicine) {
          medicinesMap.set(
            prescription.medicine.medicine_id,
            prescription.medicine
          );
        }
      });

      return Array.from(medicinesMap.values());
    } catch (error) {
      console.warn("Unexpected error fetching prescribed medicines:", error);
      return [];
    }
  },

  /**
   * Fetch all prescriptions created by the doctor (joined with medicines table)
   */
  async getPrescriptions(doctorId: string): Promise<Prescription[]> {
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
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Could not fetch doctor prescriptions:", error.message);
        return [];
      }

      return (data as Prescription[]) || [];
    } catch (error) {
      console.warn("Unexpected error fetching doctor prescriptions:", error);
      return [];
    }
  },

  /**
   * Fetch all patients who have this doctor as their primary doctor
   */
  async getPatients(doctorId: string): Promise<DoctorPatient[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase
        .from("users")
        .select(
          "user_id, first_name, last_name, email, phone, user_type, primary_doctor_id"
        )
        .eq("primary_doctor_id", doctorId)
        .eq("user_type", "patient")
        .order("last_name", { ascending: true });

      if (error) {
        console.warn("Could not fetch doctor's patients:", error.message);
        return [];
      }

      return (data as DoctorPatient[]) || [];
    } catch (error) {
      console.warn("Unexpected error fetching doctor's patients:", error);
      return [];
    }
  },

  /**
   * Fetch health records of all patients who have this doctor as their primary doctor
   * Returns records ordered by most recent first
   */
  async getPatientsHealthRecords(doctorId: string): Promise<HealthRecord[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      // Get all patient IDs for this doctor
      const patients = await this.getPatients(doctorId);
      if (patients.length === 0) return [];

      const patientIds = patients.map((p) => p.user_id);

      // Fetch health records for these patients - simple select like patientService
      const { data, error } = await supabase
        .from("health_records")
        .select("*")
        .in("patient_id", patientIds)
        .order("datetime", { ascending: false });

      if (error) {
        console.warn(
          "Could not fetch patients' health records:",
          error.message
        );
        return [];
      }

      return (data as HealthRecord[]) || [];
    } catch (error) {
      console.warn(
        "Unexpected error fetching patients' health records:",
        error
      );
      return [];
    }
  },

  /**
   * Get all available medicines from the database
   */
  async getAllMedicines(): Promise<Medicine[]> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) return [];

      const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.warn("Could not fetch medicines:", error.message);
        return [];
      }

      return (data as Medicine[]) || [];
    } catch (error) {
      console.warn("Unexpected error fetching medicines:", error);
      return [];
    }
  },

  /**
   * Create a new medicine
   */
  async createMedicine(
    medicine: Omit<Medicine, "medicine_id">
  ): Promise<{ success: boolean; data?: Medicine; error?: string }> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) {
        return { success: false, error: "No active session" };
      }

      const { data, error } = await supabase
        .from("medicines")
        .insert([medicine])
        .select()
        .single();

      if (error) {
        console.error("Error creating medicine:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as Medicine };
    } catch (error) {
      console.error("Unexpected error creating medicine:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create medicine",
      };
    }
  },

  /**
   * Update an existing medicine
   */
  async updateMedicine(
    medicineId: string,
    updates: Partial<Omit<Medicine, "medicine_id">>
  ): Promise<{ success: boolean; data?: Medicine; error?: string }> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) {
        return { success: false, error: "No active session" };
      }

      const { data, error } = await supabase
        .from("medicines")
        .update(updates)
        .eq("medicine_id", medicineId)
        .select()
        .single();

      if (error) {
        console.error("Error updating medicine:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as Medicine };
    } catch (error) {
      console.error("Unexpected error updating medicine:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update medicine",
      };
    }
  },

  /**
   * Delete a medicine
   */
  async deleteMedicine(
    medicineId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) {
        return { success: false, error: "No active session" };
      }

      const { error } = await supabase
        .from("medicines")
        .delete()
        .eq("medicine_id", medicineId);

      if (error) {
        console.error("Error deleting medicine:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error deleting medicine:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete medicine",
      };
    }
  },

  /**
   * Create a new prescription
   */
  async createPrescription(
    prescription: Omit<
      Prescription,
      "prescription_id" | "created_at" | "medicine"
    >
  ): Promise<{ success: boolean; data?: Prescription; error?: string }> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) {
        return { success: false, error: "No active session" };
      }

      const { data, error } = await supabase
        .from("prescriptions")
        .insert([prescription])
        .select(
          `
          *,
          medicine:medicines(*)
        `
        )
        .single();

      if (error) {
        console.error("Error creating prescription:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as Prescription };
    } catch (error) {
      console.error("Unexpected error creating prescription:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create prescription",
      };
    }
  },

  /**
   * Update an existing prescription
   */
  async updatePrescription(
    prescriptionId: string,
    updates: Partial<Omit<Prescription, "prescription_id" | "created_at" | "medicine">>
  ): Promise<{ success: boolean; data?: Prescription; error?: string }> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) {
        return { success: false, error: "No active session" };
      }

      const { data, error } = await supabase
        .from("prescriptions")
        .update(updates)
        .eq("prescription_id", prescriptionId)
        .select(
          `
          *,
          medicine:medicines(*)
        `
        )
        .single();

      if (error) {
        console.error("Error updating prescription:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as Prescription };
    } catch (error) {
      console.error("Unexpected error updating prescription:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update prescription",
      };
    }
  },

  /**
   * Delete a prescription
   */
  async deletePrescription(
    prescriptionId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) {
        return { success: false, error: "No active session" };
      }

      const { error } = await supabase
        .from("prescriptions")
        .delete()
        .eq("prescription_id", prescriptionId);

      if (error) {
        console.error("Error deleting prescription:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error deleting prescription:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete prescription",
      };
    }
  },

  /**
   * Create a new health record for a patient
   */
  async createHealthRecord(
    healthRecord: Omit<HealthRecord, "record_id" | "datetime" | "created_at">
  ): Promise<{ success: boolean; data?: HealthRecord; error?: string }> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) {
        return { success: false, error: "No active session" };
      }

      // Simple insert - let database handle defaults and column mapping
      const { data, error } = await supabase
        .from("health_records")
        .insert(healthRecord)
        .select("*")
        .single();

      if (error) {
        console.error("Error creating health record:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as HealthRecord };
    } catch (error) {
      console.error("Unexpected error creating health record:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create health record",
      };
    }
  },

  /**
   * Update an existing health record
   */
  async updateHealthRecord(
    recordId: string,
    updates: Partial<Omit<HealthRecord, "record_id" | "datetime" | "created_at">>
  ): Promise<{ success: boolean; data?: HealthRecord; error?: string }> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) {
        return { success: false, error: "No active session" };
      }

      const { data, error } = await supabase
        .from("health_records")
        .update(updates)
        .eq("record_id", recordId)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating health record:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data: data as HealthRecord };
    } catch (error) {
      console.error("Unexpected error updating health record:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update health record",
      };
    }
  },

  /**
   * Delete a health record
   */
  async deleteHealthRecord(
    recordId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const hasSession = await hasActiveSession();
      if (!hasSession) {
        return { success: false, error: "No active session" };
      }

      const { error } = await supabase
        .from("health_records")
        .delete()
        .eq("record_id", recordId);

      if (error) {
        console.error("Error deleting health record:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Unexpected error deleting health record:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete health record",
      };
    }
  },
};
