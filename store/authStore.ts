import { create } from 'zustand';
import { authService, type SignupData, type LoginData, type UserProfile } from '@/services/authService';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  signup: (data: SignupData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: false,
  error: null,

  signup: async (data) => {
    set({ isLoading: true, error: null });
    const { user, error } = await authService.signup(data);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    set({ user, isLoading: false });
    return true;
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    const { user, profile, error } = await authService.login(data);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    set({ user, profile, isLoading: false });
    return true;
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    const { error } = await authService.logout();

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set({ user: null, profile: null, isLoading: false });
  },

  getCurrentUser: async () => {
    set({ isLoading: true, error: null });
    const { user, profile, error } = await authService.getCurrentUser();

    if (error) {
      // Clear user data on error (session might be invalid)
      set({ user: null, profile: null, isLoading: false, error: error.message });
      return;
    }

    // If no user returned (logged out), clear the store
    if (!user) {
      set({ user: null, profile: null, isLoading: false });
      return;
    }

    set({ user, profile, isLoading: false });
  },

  clearError: () => set({ error: null }),
}));
