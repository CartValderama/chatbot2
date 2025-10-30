"use client";

import { useSupabaseKeepAlive } from "@/hooks/useSupabaseKeepAlive";

/**
 * KeepAliveProvider Component
 *
 * A simple wrapper component that activates the Supabase keep-alive mechanism.
 * Add this to your root layout to automatically keep your Supabase instance warm.
 *
 * USAGE:
 * Import and add to your layout.tsx:
 * ```tsx
 * import { KeepAliveProvider } from '@/components/providers/keep-alive-provider';
 *
 * <KeepAliveProvider>
 *   {children}
 * </KeepAliveProvider>
 * ```
 *
 * CONFIGURATION:
 * You can customize the behavior by passing props:
 * - interval: Time between pings in milliseconds (default: 300000 = 5 minutes)
 * - debug: Enable console logging (default: false, set to true in development)
 * - enabled: Toggle keep-alive on/off (default: true)
 */
interface KeepAliveProviderProps {
  children: React.ReactNode;
  /** Interval between pings in milliseconds (default: 5 minutes) */
  interval?: number;
  /** Enable debug logging (useful in development) */
  debug?: boolean;
  /** Enable/disable keep-alive (useful for testing) */
  enabled?: boolean;
}

export function KeepAliveProvider({
  children,
  interval = 600000, // 1 minute
  debug = process.env.NODE_ENV === "development",
  enabled = true,
}: KeepAliveProviderProps) {
  // Initialize keep-alive hook
  useSupabaseKeepAlive({
    interval,
    debug,
    enabled,
  });

  // This is a transparent provider - just renders children
  return <>{children}</>;
}
