import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService, type SignupData, type LoginData, type UserProfile } from '@/services/authService';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/api/supabaseClient';

/**
 * Authentication Store with Session Management
 *
 * This store manages the complete authentication state including:
 * - User information and profile
 * - Active Supabase session with access tokens
 * - Session validity tracking
 * - Automatic session refresh
 *
 * IMPORTANT: All other stores should call `getValidSession()` before making API calls
 * to ensure they're using a fresh, valid access token.
 */

interface AuthState {
  // User data
  user: User | null;
  profile: UserProfile | null;

  // Session data (includes access_token, refresh_token, expires_at)
  session: Session | null;

  // Session tracking
  lastSessionCheck: number | null;
  sessionExpiresAt: number | null;

  // UI states
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Session management
  setSession: (session: Session | null) => void;
  getValidSession: () => Promise<Session | null>;
  refreshSession: () => Promise<void>;
  checkSessionValidity: () => boolean;

  // Existing methods
  setHasHydrated: (state: boolean) => void;
  signup: (data: SignupData) => Promise<boolean>;
  login: (data: LoginData) => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      session: null,
      lastSessionCheck: null,
      sessionExpiresAt: null,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      /**
       * Set the current session
       * Updates session, user, and expiration tracking
       */
      setSession: (session) => {
        if (session) {
          set({
            session,
            user: session.user,
            sessionExpiresAt: session.expires_at ? session.expires_at * 1000 : null,
            lastSessionCheck: Date.now(),
          });
        } else {
          set({
            session: null,
            user: null,
            sessionExpiresAt: null,
            lastSessionCheck: null,
          });
        }
      },

      /**
       * Check if the current session is still valid
       * Returns true if session exists and hasn't expired
       */
      checkSessionValidity: () => {
        const { session, sessionExpiresAt } = get();

        if (!session || !sessionExpiresAt) {
          return false;
        }

        // Check if session expires in the next 30 seconds
        const now = Date.now();
        const bufferTime = 30 * 1000; // 30 seconds buffer

        return now < (sessionExpiresAt - bufferTime);
      },

      /**
       * Get a valid session, refreshing if necessary
       *
       * This is the KEY method that all stores should call before making API requests.
       * It ensures the session is valid and returns a fresh access token.
       *
       * @returns Valid session or null if user is not authenticated
       */
      getValidSession: async () => {
        const { session, checkSessionValidity, refreshSession } = get();

        // No session at all
        if (!session) {
          console.warn('[AuthStore] No session available');
          return null;
        }

        // Session is valid, return it
        if (checkSessionValidity()) {
          set({ lastSessionCheck: Date.now() });
          return session;
        }

        // Session is invalid or about to expire, refresh it
        console.log('[AuthStore] Session invalid or expiring soon, refreshing...');
        await refreshSession();

        // Return the newly refreshed session
        return get().session;
      },

      /**
       * Refresh the current session
       * Fetches a new access token using the refresh token
       */
      refreshSession: async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession();

          if (error) {
            console.error('[AuthStore] Session refresh failed:', error.message);
            // Clear invalid session
            set({
              session: null,
              user: null,
              sessionExpiresAt: null,
              error: 'Session expired. Please log in again.',
            });
            return;
          }

          if (data.session) {
            console.log('[AuthStore] Session refreshed successfully');
            get().setSession(data.session);
          }
        } catch (error) {
          console.error('[AuthStore] Unexpected error refreshing session:', error);
          set({
            session: null,
            user: null,
            error: 'Failed to refresh session'
          });
        }
      },

      /**
       * Sign up a new user
       */
      signup: async (data) => {
        set({ isLoading: true, error: null });
        const { user, error } = await authService.signup(data);

        if (error) {
          set({ isLoading: false, error: error.message });
          return false;
        }

        // Get session after signup
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          get().setSession(sessionData.session);
        }

        set({ user, isLoading: false });
        return true;
      },

      /**
       * Log in a user
       */
      login: async (data) => {
        set({ isLoading: true, error: null });
        const { user, profile, error } = await authService.login(data);

        if (error) {
          set({ isLoading: false, error: error.message });
          return false;
        }

        // Get session after login
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          get().setSession(sessionData.session);
        }

        set({ user, profile, isLoading: false });
        return true;
      },

      /**
       * Log out the current user
       */
      logout: async () => {
        set({ isLoading: true, error: null });
        const { error } = await authService.logout();

        if (error) {
          set({ isLoading: false, error: error.message });
          return;
        }

        // Clear all session data
        set({
          user: null,
          profile: null,
          session: null,
          sessionExpiresAt: null,
          lastSessionCheck: null,
          isLoading: false
        });
      },

      /**
       * Get the current user and session
       */
      getCurrentUser: async () => {
        set({ isLoading: true, error: null });

        try {
          // Get both user and session
          const { user, profile, error } = await authService.getCurrentUser();
          const { data: sessionData } = await supabase.auth.getSession();

          if (error) {
            // Clear user data on error (session might be invalid)
            set({
              user: null,
              profile: null,
              session: null,
              isLoading: false,
              error: error.message
            });
            return;
          }

          // If no user returned (logged out), clear the store
          if (!user) {
            set({
              user: null,
              profile: null,
              session: null,
              isLoading: false
            });
            return;
          }

          // Update session
          if (sessionData.session) {
            get().setSession(sessionData.session);
          }

          set({ user, profile, isLoading: false });
        } catch (error) {
          console.error('[AuthStore] Error getting current user:', error);
          set({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            error: 'Failed to get current user',
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
        sessionExpiresAt: state.sessionExpiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
