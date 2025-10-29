import { create } from 'zustand';
import { patientService } from '@/services/patientService';
import type {
  Prescription,
  Reminder,
  ChatMessage,
  HealthRecord,
} from '@/types/patient';

interface PatientState {
  // Data
  prescriptions: Prescription[];
  reminders: Reminder[];
  chatMessages: ChatMessage[];
  healthRecords: HealthRecord[];

  // Loading states
  isLoading: boolean;
  prescriptionsLoading: boolean;
  remindersLoading: boolean;
  chatMessagesLoading: boolean;
  healthRecordsLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  fetchAllPatientData: (userId: string) => Promise<void>;
  fetchPrescriptions: (patientId: string) => Promise<void>;
  fetchReminders: (userId: string) => Promise<void>;
  fetchChatMessages: (userId: string) => Promise<void>;
  fetchHealthRecords: (patientId: string) => Promise<void>;
  clearPatientData: () => void;
  setError: (error: string | null) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  // Initial state
  prescriptions: [],
  reminders: [],
  chatMessages: [],
  healthRecords: [],

  isLoading: false,
  prescriptionsLoading: false,
  remindersLoading: false,
  chatMessagesLoading: false,
  healthRecordsLoading: false,

  error: null,

  // Fetch all patient data at once
  fetchAllPatientData: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Fetch all data - service layer handles errors gracefully
      // Empty arrays are normal for new users, not errors
      const [prescriptionsData, remindersData, chatMessagesData, healthRecordsData] =
        await Promise.all([
          patientService.getPrescriptions(userId),
          patientService.getReminders(userId),
          patientService.getChatMessages(userId),
          patientService.getHealthRecords(userId),
        ]);

      set({
        prescriptions: prescriptionsData,
        reminders: remindersData,
        chatMessages: chatMessagesData,
        healthRecords: healthRecordsData,
        isLoading: false,
        error: null, // Clear any previous errors
      });
    } catch (error) {
      // Only catch critical/unexpected errors
      // Service layer already handles data fetching errors
      console.error('Critical error in fetchAllPatientData:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch patient data';
      set({
        error: errorMessage,
        isLoading: false,
        // Keep existing data even on error
      });
    }
  },

  // Fetch prescriptions only
  fetchPrescriptions: async (patientId: string) => {
    set({ prescriptionsLoading: true, error: null });
    try {
      const data = await patientService.getPrescriptions(patientId);
      set({ prescriptions: data, prescriptionsLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchPrescriptions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch prescriptions';
      set({ error: errorMessage, prescriptionsLoading: false });
    }
  },

  // Fetch reminders only
  fetchReminders: async (userId: string) => {
    set({ remindersLoading: true, error: null });
    try {
      const data = await patientService.getReminders(userId);
      set({ reminders: data, remindersLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchReminders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reminders';
      set({ error: errorMessage, remindersLoading: false });
    }
  },

  // Fetch chat messages only
  fetchChatMessages: async (userId: string) => {
    set({ chatMessagesLoading: true, error: null });
    try {
      const data = await patientService.getChatMessages(userId);
      set({ chatMessages: data, chatMessagesLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchChatMessages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chat messages';
      set({ error: errorMessage, chatMessagesLoading: false });
    }
  },

  // Fetch health records only
  fetchHealthRecords: async (patientId: string) => {
    set({ healthRecordsLoading: true, error: null });
    try {
      const data = await patientService.getHealthRecords(patientId);
      set({ healthRecords: data, healthRecordsLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchHealthRecords:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health records';
      set({ error: errorMessage, healthRecordsLoading: false });
    }
  },

  // Clear all patient data (useful for logout)
  clearPatientData: () => {
    set({
      prescriptions: [],
      reminders: [],
      chatMessages: [],
      healthRecords: [],
      isLoading: false,
      prescriptionsLoading: false,
      remindersLoading: false,
      chatMessagesLoading: false,
      healthRecordsLoading: false,
      error: null,
    });
  },

  // Set error
  setError: (error: string | null) => {
    set({ error });
  },
}));
