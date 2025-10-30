import { useEffect, useRef } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useAuthStore } from '@/stores/authStore';

/**
 * Session Manager Hook
 *
 * This hook manages the Supabase authentication session lifecycle:
 * 1. Listens to auth state changes from Supabase
 * 2. Automatically refreshes the session every 25 seconds
 * 3. Updates the authStore with the latest session
 * 4. Ensures all stores always have a valid, fresh session
 *
 * USAGE:
 * Add this hook to your root provider/layout component:
 *
 * ```tsx
 * import { useSessionManager } from '@/hooks/useSessionManager';
 *
 * function AuthProvider({ children }) {
 *   useSessionManager();
 *   return <>{children}</>;
 * }
 * ```
 *
 * This hook runs in the background and ensures:
 * - Session is always fresh (refreshed every 25 seconds)
 * - Auth state changes are captured (login, logout, token refresh)
 * - All stores can safely make API calls without session expiration
 */

interface UseSessionManagerOptions {
  /**
   * Interval for automatic session refresh in milliseconds
   * Default: 25000 (25 seconds)
   *
   * Why 25 seconds?
   * - Supabase tokens typically expire after 60 minutes
   * - Frequent refresh ensures we never hit expiration
   * - Short interval prevents idle state issues
   * - Minimal network overhead (tiny refresh request)
   */
  refreshInterval?: number;

  /**
   * Enable debug logging
   * Default: false in production, true in development
   */
  debug?: boolean;

  /**
   * Enable automatic session refresh
   * Default: true
   */
  enableAutoRefresh?: boolean;
}

export function useSessionManager(options: UseSessionManagerOptions = {}) {
  const {
    refreshInterval = 25000, // 25 seconds
    debug = process.env.NODE_ENV === 'development',
    enableAutoRefresh = true,
  } = options;

  const { setSession, getValidSession } = useAuthStore();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    // Initialize session on mount
    const initializeSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session && isMountedRef.current) {
          setSession(data.session);
          if (debug) {
            console.log('[SessionManager] Initial session loaded');
          }
        }
      } catch (error) {
        console.error('[SessionManager] Failed to initialize session:', error);
      }
    };

    initializeSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      if (debug) {
        console.log('[SessionManager] Auth state changed:', event);
      }

      // Update session in store
      setSession(session);

      // Handle specific events
      if (event === 'SIGNED_IN') {
        if (debug) console.log('[SessionManager] User signed in');
      } else if (event === 'SIGNED_OUT') {
        if (debug) console.log('[SessionManager] User signed out');
        // Clear any refresh timers
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      } else if (event === 'TOKEN_REFRESHED') {
        if (debug) console.log('[SessionManager] Token refreshed by Supabase');
      }
    });

    // Set up automatic session refresh
    if (enableAutoRefresh) {
      const startAutoRefresh = () => {
        // Clear any existing interval
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }

        // Start new interval
        refreshIntervalRef.current = setInterval(async () => {
          if (!isMountedRef.current) return;

          try {
            if (debug) {
              console.log('[SessionManager] Auto-refreshing session...');
            }

            // Use getValidSession which will refresh if needed
            const session = await getValidSession();

            if (session) {
              if (debug) {
                console.log('[SessionManager] Session refreshed successfully');
              }
            } else {
              if (debug) {
                console.log('[SessionManager] No session to refresh (user logged out)');
              }
              // Stop auto-refresh if no session
              if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
                refreshIntervalRef.current = null;
              }
            }
          } catch (error) {
            console.error('[SessionManager] Auto-refresh error:', error);
          }
        }, refreshInterval);

        if (debug) {
          console.log(`[SessionManager] Auto-refresh enabled (every ${refreshInterval / 1000}s)`);
        }
      };

      startAutoRefresh();
    }

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();

      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }

      if (debug) {
        console.log('[SessionManager] Cleaned up');
      }
    };
  }, [refreshInterval, debug, enableAutoRefresh, setSession, getValidSession]);

  // This hook doesn't return anything - it runs in the background
  return null;
}

/**
 * CONFIGURATION EXAMPLES:
 *
 * 1. Default usage (recommended):
 * ```tsx
 * useSessionManager();
 * ```
 *
 * 2. Custom refresh interval (30 seconds):
 * ```tsx
 * useSessionManager({ refreshInterval: 30000 });
 * ```
 *
 * 3. Disable auto-refresh (rely only on auth state changes):
 * ```tsx
 * useSessionManager({ enableAutoRefresh: false });
 * ```
 *
 * 4. Debug mode in production:
 * ```tsx
 * useSessionManager({ debug: true });
 * ```
 *
 * 5. Aggressive refresh for critical apps (10 seconds):
 * ```tsx
 * useSessionManager({ refreshInterval: 10000 });
 * ```
 */
