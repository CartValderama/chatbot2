import { create } from "zustand";
import { adminService, type AdminUser } from "@/services/adminService";
import { useAuthStore } from './authStore';
import type {
  Medicine,
  Prescription,
  HealthRecord,
  Doctor,
  Reminder,
} from "@/types/database";

interface AdminState {
  // Data
  prescribedMedicines: Medicine[];
  medicines: Medicine[];
  prescriptions: Prescription[];
  users: AdminUser[];
  doctors: Doctor[];
  usersHealthRecords: HealthRecord[];
  reminders: Reminder[];

  // Loading states
  isLoading: boolean;
  prescribedMedicinesLoading: boolean;
  medicinesLoading: boolean;
  prescriptionsLoading: boolean;
  usersLoading: boolean;
  doctorsLoading: boolean;
  usersHealthRecordsLoading: boolean;
  remindersLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchAllAdminData: () => Promise<void>;
  fetchPrescribedMedicines: () => Promise<void>;
  fetchMedicines: () => Promise<void>;
  fetchPrescriptions: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchDoctors: () => Promise<void>;
  fetchUsersHealthRecords: () => Promise<void>;
  fetchReminders: () => Promise<void>;
  clearAdminData: () => void;
  setError: (error: string | null) => void;

  // CRUD operations
  createMedicine: (
    medicine: Omit<Medicine, "medicine_id" | "created_date">
  ) => Promise<{ success: boolean; data?: Medicine; error?: string }>;
  updateMedicine: (
    medicineId: number,
    updates: Partial<Omit<Medicine, "medicine_id" | "created_date">>
  ) => Promise<{ success: boolean; data?: Medicine; error?: string }>;
  deleteMedicine: (
    medicineId: number
  ) => Promise<{ success: boolean; error?: string }>;

  createPrescription: (
    prescription: Omit<
      Prescription,
      "prescription_id" | "created_date" | "medicine"
    >
  ) => Promise<{ success: boolean; data?: Prescription; error?: string }>;
  updatePrescription: (
    prescriptionId: number,
    updates: Partial<
      Omit<Prescription, "prescription_id" | "created_date" | "medicine">
    >
  ) => Promise<{ success: boolean; data?: Prescription; error?: string }>;
  deletePrescription: (
    prescriptionId: number
  ) => Promise<{ success: boolean; error?: string }>;

  createHealthRecord: (
    record: Omit<HealthRecord, "record_id" | "created_date">
  ) => Promise<{ success: boolean; data?: HealthRecord; error?: string }>;
  updateHealthRecord: (
    recordId: number,
    updates: Partial<
      Omit<HealthRecord, "record_id" | "date_time" | "created_date">
    >
  ) => Promise<{ success: boolean; data?: HealthRecord; error?: string }>;
  deleteHealthRecord: (
    recordId: number
  ) => Promise<{ success: boolean; error?: string }>;

  createDoctor: (
    doctor: Omit<Doctor, "doctor_id" | "created_date">
  ) => Promise<{ success: boolean; data?: Doctor; error?: string }>;
  updateDoctor: (
    doctorId: number,
    updates: Partial<Omit<Doctor, "doctor_id" | "created_date">>
  ) => Promise<{ success: boolean; data?: Doctor; error?: string }>;
  deleteDoctor: (
    doctorId: number
  ) => Promise<{ success: boolean; error?: string }>;

  createReminder: (
    reminder: Omit<Reminder, "reminder_id" | "created_date">
  ) => Promise<{ success: boolean; data?: Reminder; error?: string }>;
  updateReminder: (
    reminderId: number,
    updates: Partial<Omit<Reminder, "reminder_id" | "created_date">>
  ) => Promise<{ success: boolean; data?: Reminder; error?: string }>;
  deleteReminder: (
    reminderId: number
  ) => Promise<{ success: boolean; error?: string }>;
}

export const useAdminStore = create<AdminState>((set) => ({
  // Initial state
  prescribedMedicines: [],
  medicines: [],
  prescriptions: [],
  users: [],
  doctors: [],
  usersHealthRecords: [],
  reminders: [],

  isLoading: false,
  prescribedMedicinesLoading: false,
  medicinesLoading: false,
  prescriptionsLoading: false,
  usersLoading: false,
  doctorsLoading: false,
  usersHealthRecordsLoading: false,
  remindersLoading: false,

  error: null,

  // Fetch all admin data at once
  fetchAllAdminData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get valid session before making API calls
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        console.warn('[AdminStore] No valid session available');
        set({
          isLoading: false,
          error: 'Please log in to view admin data',
        });
        return;
      }

      const [
        prescribedMedicinesData,
        prescriptionsData,
        usersData,
        doctorsData,
        usersHealthRecordsData,
      ] = await Promise.all([
        adminService.getAllPrescribedMedicines(),
        adminService.getPrescriptions(),
        adminService.getAllPatients(),
        adminService.getAllDoctors(),
        adminService.getAllHealthRecords(),
      ]);

      set({
        prescribedMedicines: prescribedMedicinesData,
        prescriptions: prescriptionsData,
        users: usersData,
        doctors: doctorsData,
        usersHealthRecords: usersHealthRecordsData,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Critical error in fetchAllAdminData:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch admin data";
      set({ error: errorMessage, isLoading: false });
    }
  },

  // Fetch individual entities
  fetchPrescribedMedicines: async () => {
    set({ prescribedMedicinesLoading: true, error: null });
    try {
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        set({ prescribedMedicinesLoading: false, error: 'Please log in' });
        return;
      }
      const data = await adminService.getAllPrescribedMedicines();
      set({ prescribedMedicines: data, prescribedMedicinesLoading: false });
    } catch (error) {
      console.error("Failed to fetch prescribed medicines:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch prescribed medicines",
        prescribedMedicinesLoading: false,
      });
    }
  },

  fetchMedicines: async () => {
    set({ medicinesLoading: true, error: null });
    try {
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        set({ medicinesLoading: false, error: 'Please log in' });
        return;
      }
      const data = await adminService.getAllMedicines();
      set({ medicines: data, medicinesLoading: false });
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch medicines",
        medicinesLoading: false,
      });
    }
  },

  fetchPrescriptions: async () => {
    set({ prescriptionsLoading: true, error: null });
    try {
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        set({ prescriptionsLoading: false, error: 'Please log in' });
        return;
      }
      const data = await adminService.getPrescriptions();
      set({ prescriptions: data, prescriptionsLoading: false });
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch prescriptions",
        prescriptionsLoading: false,
      });
    }
  },

  fetchUsers: async () => {
    set({ usersLoading: true, error: null });
    try {
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        set({ usersLoading: false, error: 'Please log in' });
        return;
      }
      const data = await adminService.getAllPatients();
      set({ users: data, usersLoading: false });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to fetch users",
        usersLoading: false,
      });
    }
  },

  fetchDoctors: async () => {
    set({ doctorsLoading: true, error: null });
    try {
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        set({ doctorsLoading: false, error: 'Please log in' });
        return;
      }
      const data = await adminService.getAllDoctors();
      set({ doctors: data, doctorsLoading: false });
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch doctors",
        doctorsLoading: false,
      });
    }
  },

  fetchUsersHealthRecords: async () => {
    set({ usersHealthRecordsLoading: true, error: null });
    try {
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        set({ usersHealthRecordsLoading: false, error: 'Please log in' });
        return;
      }
      const data = await adminService.getAllHealthRecords();
      set({ usersHealthRecords: data, usersHealthRecordsLoading: false });
    } catch (error) {
      console.error("Failed to fetch health records:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch health records",
        usersHealthRecordsLoading: false,
      });
    }
  },

  fetchReminders: async () => {
    set({ remindersLoading: true, error: null });
    try {
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        set({ remindersLoading: false, error: 'Please log in' });
        return;
      }
      const data = await adminService.getAllReminders();
      set({ reminders: data, remindersLoading: false });
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch reminders",
        remindersLoading: false,
      });
    }
  },

  // Clear all data
  clearAdminData: () => {
    set({
      prescribedMedicines: [],
      medicines: [],
      prescriptions: [],
      users: [],
      doctors: [],
      usersHealthRecords: [],
      reminders: [],
      isLoading: false,
      prescribedMedicinesLoading: false,
      medicinesLoading: false,
      prescriptionsLoading: false,
      usersLoading: false,
      doctorsLoading: false,
      usersHealthRecordsLoading: false,
      remindersLoading: false,
      error: null,
    });
  },

  setError: (error) => set({ error }),

  // CRUD operations remain the same
  createMedicine: async (medicine) => adminService.createMedicine(medicine),
  updateMedicine: async (id, updates) =>
    adminService.updateMedicine(id, updates),
  deleteMedicine: async (id) => adminService.deleteMedicine(id),

  createPrescription: async (prescription) =>
    adminService.createPrescription(prescription),
  updatePrescription: async (id, updates) =>
    adminService.updatePrescription(id, updates),
  deletePrescription: async (id) => adminService.deletePrescription(id),

  createHealthRecord: async (record) => adminService.createHealthRecord(record),
  updateHealthRecord: async (id, updates) =>
    adminService.updateHealthRecord(id, updates),
  deleteHealthRecord: async (id) => adminService.deleteHealthRecord(id),

  createDoctor: async (doctor) => adminService.createDoctor(doctor),
  updateDoctor: async (id, updates) => adminService.updateDoctor(id, updates),
  deleteDoctor: async (id) => adminService.deleteDoctor(id),

  createReminder: async (reminder) => adminService.createReminder(reminder),
  updateReminder: async (id, updates) =>
    adminService.updateReminder(id, updates),
  deleteReminder: async (id) => adminService.deleteReminder(id),
}));
