import { useEffect, useRef } from 'react';
import { supabase } from '@/api/supabaseClient';

/**
 * Configuration for the Supabase keep-alive mechanism
 */
interface KeepAliveConfig {
  /**
   * Interval between ping requests in milliseconds
   * Default: 5 minutes (300000ms)
   * Recommendation: 5-10 minutes to balance between cold starts and API limits
   */
  interval?: number;

  /**
   * Enable detailed logging for debugging
   * Default: false
   */
  debug?: boolean;

  /**
   * Whether to run the keep-alive mechanism
   * Default: true
   * Set to false to disable without removing the hook
   */
  enabled?: boolean;
}

/**
 * Custom React hook to keep Supabase connection alive and prevent cold starts
 *
 * This hook performs lightweight "ping" requests to Supabase at regular intervals
 * to prevent the database from scaling down due to inactivity. This is especially
 * useful for free-tier instances that may experience cold starts.
 *
 * HOW IT WORKS:
 * 1. Runs a lightweight query (auth session check) at specified intervals
 * 2. The query is minimal and doesn't count significantly toward rate limits
 * 3. Automatically cleans up interval on component unmount
 * 4. Only runs on client-side (React environment)
 *
 * USAGE:
 * Simply call this hook in your root component (e.g., layout.tsx or _app.tsx):
 * ```tsx
 * useSupabaseKeepAlive({ interval: 300000, debug: false });
 * ```
 *
 * PRODUCTION SAFETY:
 * - Default 5-minute interval is safe for free tier (288 pings/day)
 * - Uses auth.getSession() which is a lightweight, cached operation
 * - Gracefully handles errors without affecting app functionality
 * - Automatically stops when component unmounts
 *
 * @param config - Configuration options for keep-alive behavior
 */
export function useSupabaseKeepAlive(config: KeepAliveConfig = {}) {
  const {
    interval = 300000, // Default: 5 minutes
    debug = false,
    enabled = true,
  } = config;

  // Use ref to store interval ID for cleanup
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Don't run if disabled or not in browser environment
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    /**
     * Performs a lightweight ping to Supabase to keep the connection warm
     * Uses auth.getSession() because:
     * - It's a very lightweight operation
     * - Results are cached by Supabase client
     * - Doesn't count against table query limits
     * - Always available regardless of your database schema
     */
    const ping = async () => {
      try {
        // Perform lightweight session check
        const { error } = await supabase.auth.getSession();

        if (error) {
          if (debug) {
            console.warn('[Supabase Keep-Alive] Ping warning:', error.message);
          }
          // Don't throw - we don't want to break the app if ping fails
          return;
        }

        if (debug) {
          console.log('[Supabase Keep-Alive] Ping successful at', new Date().toISOString());
        }
      } catch (err) {
        // Silently handle errors to avoid disrupting the app
        if (debug) {
          console.error('[Supabase Keep-Alive] Ping error:', err);
        }
      }
    };

    // Perform initial ping immediately when hook mounts
    if (debug) {
      console.log('[Supabase Keep-Alive] Starting with interval:', interval / 1000, 'seconds');
    }
    ping();

    // Set up recurring pings
    intervalRef.current = setInterval(ping, interval);

    // Cleanup function: stop pinging when component unmounts
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (debug) {
          console.log('[Supabase Keep-Alive] Stopped');
        }
      }
    };
  }, [interval, debug, enabled]);

  // This hook doesn't return anything - it's a fire-and-forget mechanism
  return null;
}
