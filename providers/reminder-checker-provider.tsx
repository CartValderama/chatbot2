"use client";

import { useEffect } from "react";

/**
 * Reminder Checker Provider
 *
 * Automatically checks for due reminders every minute
 * Works in development and as a fallback if Vercel Cron isn't set up
 */
export function ReminderCheckerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Function to check reminders
    const checkReminders = async () => {
      try {
        const response = await fetch("/api/send-reminders");
        const data = await response.json();

        if (data.sent > 0) {
          console.log(`[Reminder Checker] Sent ${data.sent} reminder(s)`);
        }
      } catch (error) {
        console.error("[Reminder Checker] Error checking reminders:", error);
      }
    };

    // Check immediately on mount
    checkReminders();

    // Check every minute (60000ms)
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}
