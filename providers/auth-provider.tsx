"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useSessionManager } from "@/hooks/useSessionManager";

/**
 * Authentication Provider with Session Management
 *
 * This provider:
 * 1. Initializes the user session on mount
 * 2. Sets up automatic session refresh (every 25 seconds)
 * 3. Listens to auth state changes from Supabase
 * 4. Ensures all stores have a valid session at all times
 *
 * The session refresh prevents idle-state issues where:
 * - API calls fail after periods of inactivity
 * - Tokens expire during user sessions
 * - Delete/update operations don't work after idle time
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { getCurrentUser } = useAuthStore();
  const initialized = useRef(false);

  // Initialize session manager with automatic refresh every 25 seconds
  // This ensures the session stays fresh even when the app is idle
  useSessionManager({
    refreshInterval: 25000, // 25 seconds - prevents idle issues
    debug: process.env.NODE_ENV === 'development',
    enableAutoRefresh: true,
  });

  useEffect(() => {
    // Initialize user data on mount
    if (!initialized.current) {
      initialized.current = true;
      getCurrentUser();
    }
  }, [getCurrentUser]);

  return <>{children}</>;
}
