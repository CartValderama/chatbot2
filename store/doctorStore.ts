import { create } from 'zustand';
import { doctorService, type DoctorPatient } from '@/services/doctorService';
import type {
  Medicine,
  Prescription,
  HealthRecord,
} from '@/types/patient';

interface DoctorState {
  // Data
  prescribedMedicines: Medicine[];
  medicines: Medicine[];
  prescriptions: Prescription[];
  patients: DoctorPatient[];
  patientsHealthRecords: HealthRecord[];

  // Loading states
  isLoading: boolean;
  prescribedMedicinesLoading: boolean;
  medicinesLoading: boolean;
  prescriptionsLoading: boolean;
  patientsLoading: boolean;
  patientsHealthRecordsLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchAllDoctorData: (doctorId: string) => Promise<void>;
  fetchPrescribedMedicines: (doctorId: string) => Promise<void>;
  fetchMedicines: () => Promise<void>;
  fetchPrescriptions: (doctorId: string) => Promise<void>;
  fetchPatients: (doctorId: string) => Promise<void>;
  fetchPatientsHealthRecords: (doctorId: string) => Promise<void>;
  clearDoctorData: () => void;
  setError: (error: string | null) => void;

  // Medicine CRUD
  createMedicine: (medicine: Omit<Medicine, "medicine_id">) => Promise<{ success: boolean; data?: Medicine; error?: string }>;
  updateMedicine: (medicineId: string, updates: Partial<Omit<Medicine, "medicine_id">>) => Promise<{ success: boolean; data?: Medicine; error?: string }>;
  deleteMedicine: (medicineId: string) => Promise<{ success: boolean; error?: string }>;

  // Prescription CRUD
  createPrescription: (prescription: Omit<Prescription, "prescription_id" | "created_at" | "medicine">) => Promise<{ success: boolean; data?: Prescription; error?: string }>;
  updatePrescription: (prescriptionId: string, updates: Partial<Omit<Prescription, "prescription_id" | "created_at" | "medicine">>) => Promise<{ success: boolean; data?: Prescription; error?: string }>;
  deletePrescription: (prescriptionId: string) => Promise<{ success: boolean; error?: string }>;

  // Health Record CRUD
  createHealthRecord: (healthRecord: Omit<HealthRecord, "record_id" | "datetime" | "created_at">) => Promise<{ success: boolean; data?: HealthRecord; error?: string }>;
  updateHealthRecord: (recordId: string, updates: Partial<Omit<HealthRecord, "record_id" | "datetime" | "created_at">>) => Promise<{ success: boolean; data?: HealthRecord; error?: string }>;
  deleteHealthRecord: (recordId: string) => Promise<{ success: boolean; error?: string }>;
}

export const useDoctorStore = create<DoctorState>((set) => ({
  // Initial state
  prescribedMedicines: [],
  medicines: [],
  prescriptions: [],
  patients: [],
  patientsHealthRecords: [],

  isLoading: false,
  prescribedMedicinesLoading: false,
  medicinesLoading: false,
  prescriptionsLoading: false,
  patientsLoading: false,
  patientsHealthRecordsLoading: false,

  error: null,

  // Fetch all doctor data at once
  fetchAllDoctorData: async (doctorId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all data - service layer handles errors gracefully
      // Empty arrays are normal for new doctors, not errors
      const [
        prescribedMedicinesData,
        prescriptionsData,
        patientsData,
        patientsHealthRecordsData,
      ] = await Promise.all([
        doctorService.getAllPrescribedMedicines(doctorId),
        doctorService.getPrescriptions(doctorId),
        doctorService.getPatients(doctorId),
        doctorService.getPatientsHealthRecords(doctorId),
      ]);

      set({
        prescribedMedicines: prescribedMedicinesData,
        prescriptions: prescriptionsData,
        patients: patientsData,
        patientsHealthRecords: patientsHealthRecordsData,
        isLoading: false,
        error: null, // Clear any previous errors
      });
    } catch (error) {
      // Only catch critical/unexpected errors
      // Service layer already handles data fetching errors
      console.error('Critical error in fetchAllDoctorData:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch doctor data';
      set({
        error: errorMessage,
        isLoading: false,
        // Keep existing data even on error
      });
    }
  },

  // Fetch prescribed medicines only
  fetchPrescribedMedicines: async (doctorId: string) => {
    set({ prescribedMedicinesLoading: true, error: null });
    try {
      const data = await doctorService.getAllPrescribedMedicines(doctorId);
      set({ prescribedMedicines: data, prescribedMedicinesLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchPrescribedMedicines:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch prescribed medicines';
      set({ error: errorMessage, prescribedMedicinesLoading: false });
    }
  },

  // Fetch all medicines
  fetchMedicines: async () => {
    set({ medicinesLoading: true, error: null });
    try {
      const data = await doctorService.getAllMedicines();
      set({ medicines: data, medicinesLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchMedicines:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch medicines';
      set({ error: errorMessage, medicinesLoading: false });
    }
  },

  // Fetch prescriptions only
  fetchPrescriptions: async (doctorId: string) => {
    set({ prescriptionsLoading: true, error: null });
    try {
      const data = await doctorService.getPrescriptions(doctorId);
      set({ prescriptions: data, prescriptionsLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchPrescriptions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch prescriptions';
      set({ error: errorMessage, prescriptionsLoading: false });
    }
  },

  // Fetch patients only
  fetchPatients: async (doctorId: string) => {
    set({ patientsLoading: true, error: null });
    try {
      const data = await doctorService.getPatients(doctorId);
      set({ patients: data, patientsLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchPatients:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch patients';
      set({ error: errorMessage, patientsLoading: false });
    }
  },

  // Fetch patients' health records only
  fetchPatientsHealthRecords: async (doctorId: string) => {
    set({ patientsHealthRecordsLoading: true, error: null });
    try {
      const data = await doctorService.getPatientsHealthRecords(doctorId);
      set({ patientsHealthRecords: data, patientsHealthRecordsLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchPatientsHealthRecords:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch patients health records';
      set({ error: errorMessage, patientsHealthRecordsLoading: false });
    }
  },

  // Clear all doctor data (useful for logout)
  clearDoctorData: () => {
    set({
      prescribedMedicines: [],
      medicines: [],
      prescriptions: [],
      patients: [],
      patientsHealthRecords: [],
      isLoading: false,
      prescribedMedicinesLoading: false,
      medicinesLoading: false,
      prescriptionsLoading: false,
      patientsLoading: false,
      patientsHealthRecordsLoading: false,
      error: null,
    });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },

  // Medicine CRUD operations
  createMedicine: async (medicine) => {
    try {
      const result = await doctorService.createMedicine(medicine);
      if (result.success && result.data) {
        // Add the new medicine to the store
        set((state) => ({
          medicines: [result.data!, ...state.medicines],
        }));
      }
      return result;
    } catch (error) {
      console.error('Error creating medicine:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create medicine',
      };
    }
  },

  updateMedicine: async (medicineId, updates) => {
    try {
      const result = await doctorService.updateMedicine(medicineId, updates);
      if (result.success && result.data) {
        // Update the medicine in the store
        set((state) => ({
          medicines: state.medicines.map((m) =>
            m.medicine_id === medicineId ? result.data! : m
          ),
        }));
      }
      return result;
    } catch (error) {
      console.error('Error updating medicine:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update medicine',
      };
    }
  },

  deleteMedicine: async (medicineId) => {
    try {
      const result = await doctorService.deleteMedicine(medicineId);
      if (result.success) {
        // Remove the medicine from the store
        set((state) => ({
          medicines: state.medicines.filter(
            (m) => m.medicine_id !== medicineId
          ),
        }));
      }
      return result;
    } catch (error) {
      console.error('Error deleting medicine:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete medicine',
      };
    }
  },

  // Prescription CRUD operations
  createPrescription: async (prescription) => {
    try {
      const result = await doctorService.createPrescription(prescription);
      if (result.success && result.data) {
        // Add the new prescription to the store
        set((state) => ({
          prescriptions: [result.data!, ...state.prescriptions],
        }));
      }
      return result;
    } catch (error) {
      console.error('Error creating prescription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create prescription',
      };
    }
  },

  updatePrescription: async (prescriptionId, updates) => {
    try {
      const result = await doctorService.updatePrescription(prescriptionId, updates);
      if (result.success && result.data) {
        // Update the prescription in the store
        set((state) => ({
          prescriptions: state.prescriptions.map((p) =>
            p.prescription_id === prescriptionId ? result.data! : p
          ),
        }));
      }
      return result;
    } catch (error) {
      console.error('Error updating prescription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update prescription',
      };
    }
  },

  deletePrescription: async (prescriptionId) => {
    try {
      const result = await doctorService.deletePrescription(prescriptionId);
      if (result.success) {
        // Remove the prescription from the store
        set((state) => ({
          prescriptions: state.prescriptions.filter(
            (p) => p.prescription_id !== prescriptionId
          ),
        }));
      }
      return result;
    } catch (error) {
      console.error('Error deleting prescription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete prescription',
      };
    }
  },

  // Health Record CRUD operations
  createHealthRecord: async (healthRecord) => {
    try {
      const result = await doctorService.createHealthRecord(healthRecord);
      if (result.success && result.data) {
        // Add the new health record to the store
        set((state) => ({
          patientsHealthRecords: [result.data!, ...state.patientsHealthRecords],
        }));
      }
      return result;
    } catch (error) {
      console.error('Error creating health record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create health record',
      };
    }
  },

  updateHealthRecord: async (recordId, updates) => {
    try {
      const result = await doctorService.updateHealthRecord(recordId, updates);
      if (result.success && result.data) {
        // Update the health record in the store
        set((state) => ({
          patientsHealthRecords: state.patientsHealthRecords.map((r) =>
            r.record_id === recordId ? result.data! : r
          ),
        }));
      }
      return result;
    } catch (error) {
      console.error('Error updating health record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update health record',
      };
    }
  },

  deleteHealthRecord: async (recordId) => {
    try {
      const result = await doctorService.deleteHealthRecord(recordId);
      if (result.success) {
        // Remove the health record from the store
        set((state) => ({
          patientsHealthRecords: state.patientsHealthRecords.filter(
            (r) => r.record_id !== recordId
          ),
        }));
      }
      return result;
    } catch (error) {
      console.error('Error deleting health record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete health record',
      };
    }
  },
}));
