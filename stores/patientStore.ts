import { create } from 'zustand';
import { patientService } from '@/services/patientService';
import { useAuthStore } from './authStore';
import type {
  Prescription,
  Reminder,
  ChatMessage,
  HealthRecord,
} from '@/types/database';

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
  fetchAllPatientData: (userId: number) => Promise<void>;
  fetchPrescriptions: (patientId: number) => Promise<void>;
  fetchReminders: (userId: number) => Promise<void>;
  fetchChatMessages: (userId: number) => Promise<void>;
  fetchHealthRecords: (patientId: number) => Promise<void>;
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
  fetchAllPatientData: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      // Get valid session before making API calls
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        console.warn('[PatientStore] No valid session available');
        set({
          isLoading: false,
          error: 'Please log in to view your data',
        });
        return;
      }

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
  fetchPrescriptions: async (patientId: number) => {
    set({ prescriptionsLoading: true, error: null });
    try {
      // Get valid session before making API call
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        set({ prescriptionsLoading: false, error: 'Please log in to view prescriptions' });
        return;
      }

      const data = await patientService.getPrescriptions(patientId);
      set({ prescriptions: data, prescriptionsLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchPrescriptions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch prescriptions';
      set({ error: errorMessage, prescriptionsLoading: false });
    }
  },

  // Fetch reminders only
  fetchReminders: async (userId: number) => {
    set({ remindersLoading: true, error: null });
    try {
      // Get valid session before making API call
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        set({ remindersLoading: false, error: 'Please log in to view reminders' });
        return;
      }

      const data = await patientService.getReminders(userId);
      set({ reminders: data, remindersLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchReminders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reminders';
      set({ error: errorMessage, remindersLoading: false });
    }
  },

  // Fetch chat messages only
  fetchChatMessages: async (userId: number) => {
    set({ chatMessagesLoading: true, error: null });
    try {
      // Get valid session before making API call
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        set({ chatMessagesLoading: false, error: 'Please log in to view chat messages' });
        return;
      }

      const data = await patientService.getChatMessages(userId);
      set({ chatMessages: data, chatMessagesLoading: false, error: null });
    } catch (error) {
      console.error('Critical error in fetchChatMessages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch chat messages';
      set({ error: errorMessage, chatMessagesLoading: false });
    }
  },

  // Fetch health records only
  fetchHealthRecords: async (patientId: number) => {
    set({ healthRecordsLoading: true, error: null });
    try {
      // Get valid session before making API call
      const session = await useAuthStore.getState().getValidSession();
      if (!session) {
        set({ healthRecordsLoading: false, error: 'Please log in to view health records' });
        return;
      }

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
