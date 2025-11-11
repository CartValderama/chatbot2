/**
 * Automatic Reminder Sender
 *
 * Checks for due reminders and sends them as chatbot messages
 * Updates reminder status to "Sent" after sending
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/api/supabaseServerClient";

export async function GET() {
  try {
    const supabase = createServerClient();
    const now = new Date().toISOString();

    // 1. Find all pending reminders that are due
    const { data: dueReminders, error: fetchError } = await supabase
      .from("reminders")
      .select(`
        *,
        prescriptions(
          medicine_id,
          dosage,
          frequency,
          medicines(name)
        )
      `)
      .eq("status", "Pending")
      .lte("reminder_datetime", now);

    if (fetchError) {
      console.error("[Send Reminders] Error fetching reminders:", fetchError);
      return NextResponse.json({
        success: false,
        error: fetchError.message,
      }, { status: 500 });
    }

    if (!dueReminders || dueReminders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No reminders due",
        sent: 0,
      });
    }

    console.log(`[Send Reminders] Found ${dueReminders.length} due reminder(s)`);

    // 2. Send each reminder as a chat message
    const results = await Promise.all(
      dueReminders.map(async (reminder: any) => {
        try {
          // Create reminder message
          const medicineName = reminder.prescriptions?.medicines?.name || "your medicine";
          const dosage = reminder.prescriptions?.dosage || "";
          const frequency = reminder.prescriptions?.frequency || "";

          const messageText = `🔔 Påminnelse: Det er på tide å ta ${medicineName}${dosage ? ` (${dosage})` : ""}${frequency ? ` - ${frequency}` : ""}. Husk å ta medisinen din!`;

          // Insert chat message from bot
          const { error: messageError } = await supabase
            .from("chat_messages")
            // @ts-ignore - Supabase type inference issue with Database schema
            .insert([{
              user_id: reminder.user_id,
              message_text: messageText,
              sender_type: "Bot" as const,
              timestamp: new Date().toISOString(),
              intent: "reminder"
            }]);

          if (messageError) {
            console.error(`[Send Reminders] Error sending message for reminder ${reminder.reminder_id}:`, messageError);
            return { reminder_id: reminder.reminder_id, success: false, error: messageError.message };
          }

          // Update reminder status to "Sent"
          const { error: updateError } = await supabase
            .from("reminders")
            // @ts-ignore - Supabase type inference issue with Database schema
            .update({ status: "Sent" })
            .eq("reminder_id", reminder.reminder_id);

          if (updateError) {
            console.error(`[Send Reminders] Error updating reminder ${reminder.reminder_id}:`, updateError);
            return { reminder_id: reminder.reminder_id, success: false, error: updateError.message };
          }

          console.log(`[Send Reminders] Successfully sent reminder ${reminder.reminder_id} to user ${reminder.user_id}`);
          return { reminder_id: reminder.reminder_id, success: true };

        } catch (error) {
          console.error(`[Send Reminders] Unexpected error for reminder ${reminder.reminder_id}:`, error);
          return {
            reminder_id: reminder.reminder_id,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failCount,
      results,
    });

  } catch (error: unknown) {
    console.error("[Send Reminders] Fatal error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
