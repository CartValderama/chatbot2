/**
 * Quick API to check which users have data
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/api/supabaseServerClient";

export async function GET() {
  const supabase = createServerClient();

  try {
    // Get all users
    const { data: users } = await supabase
      .from("users")
      .select("user_id, first_name, last_name, email")
      .limit(10);

    if (!users) {
      return NextResponse.json({ error: "No users found" });
    }

    // Check data for each user
    const userDataSummary = await Promise.all(
      users.map(async (user) => {
        const [prescriptions, reminders, healthRecords] = await Promise.all([
          supabase
            .from("prescriptions")
            .select("prescription_id")
            .eq("user_id", user.user_id),
          supabase
            .from("reminders")
            .select("reminder_id")
            .eq("user_id", user.user_id),
          supabase
            .from("health_records")
            .select("record_id")
            .eq("user_id", user.user_id),
        ]);

        return {
          user_id: user.user_id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          data: {
            prescriptions: prescriptions.data?.length || 0,
            reminders: reminders.data?.length || 0,
            health_records: healthRecords.data?.length || 0,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      users: userDataSummary,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
