/**
 * TEST API ROUTE - Kan slettes etter testing
 *
 * Tester alle Groq function handlers individuelt
 *
 * Åpne: http://localhost:3000/api/test-functions?userId=1
 */

import { NextRequest, NextResponse } from "next/server";
import {
  handleGetPrescriptions,
  handleGetReminders,
  handleGetHealthRecords,
  handleGetTodaysSchedule,
  handleGetDoctors,
  executeFunction,
} from "@/lib/groq/handlers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      {
        error: "userId parameter påkrevd",
        example: "/api/test-functions?userId=1",
      },
      { status: 400 }
    );
  }

  const userIdNum = parseInt(userId, 10);

  if (isNaN(userIdNum)) {
    return NextResponse.json(
      { error: "userId må være et tall" },
      { status: 400 }
    );
  }

  const results: any = {
    userId: userIdNum,
    timestamp: new Date().toISOString(),
    tests: [],
    success: true,
  };

  try {
    // Test 1: get_prescriptions
    console.log("Testing get_prescriptions...");
    const prescriptionsResult = await handleGetPrescriptions(userIdNum);
    const prescriptionsData = JSON.parse(prescriptionsResult);
    results.tests.push({
      function: "get_prescriptions",
      success: !prescriptionsData.error,
      result: prescriptionsData,
    });
    if (prescriptionsData.error) results.success = false;

    // Test 2: get_reminders
    console.log("Testing get_reminders...");
    const remindersResult = await handleGetReminders(userIdNum);
    const remindersData = JSON.parse(remindersResult);
    results.tests.push({
      function: "get_reminders",
      success: !remindersData.error,
      result: remindersData,
    });
    if (remindersData.error) results.success = false;

    // Test 3: get_health_records
    console.log("Testing get_health_records...");
    const healthRecordsResult = await handleGetHealthRecords(userIdNum);
    const healthRecordsData = JSON.parse(healthRecordsResult);
    results.tests.push({
      function: "get_health_records",
      success: !healthRecordsData.error,
      result: healthRecordsData,
    });
    if (healthRecordsData.error) results.success = false;

    // Test 4: get_todays_schedule
    console.log("Testing get_todays_schedule...");
    const todaysScheduleResult = await handleGetTodaysSchedule(userIdNum);
    const todaysScheduleData = JSON.parse(todaysScheduleResult);
    results.tests.push({
      function: "get_todays_schedule",
      success: !todaysScheduleData.error,
      result: todaysScheduleData,
    });
    if (todaysScheduleData.error) results.success = false;

    // Test 5: get_doctors
    console.log("Testing get_doctors...");
    const doctorsResult = await handleGetDoctors(userIdNum);
    const doctorsData = JSON.parse(doctorsResult);
    results.tests.push({
      function: "get_doctors",
      success: !doctorsData.error,
      result: doctorsData,
    });
    if (doctorsData.error) results.success = false;

    // Test 6: executeFunction routing
    console.log("Testing executeFunction routing...");
    const routingTests = [];

    // Test routing til hver funksjon
    const functionNames = [
      "get_prescriptions",
      "get_reminders",
      "get_health_records",
      "get_todays_schedule",
      "get_doctors",
    ];

    for (const functionName of functionNames) {
      const result = await executeFunction(functionName, userIdNum);
      const data = JSON.parse(result);
      routingTests.push({
        function: functionName,
        success: !data.error,
      });
      if (data.error) results.success = false;
    }

    // Test ukjent funksjon
    const unknownResult = await executeFunction("unknown_function", userIdNum);
    const unknownData = JSON.parse(unknownResult);
    routingTests.push({
      function: "unknown_function (should fail)",
      success: unknownData.error !== undefined,
      expected_error: true,
    });

    results.tests.push({
      function: "executeFunction routing",
      success: routingTests.every((t) => t.success),
      routing_tests: routingTests,
    });

    // Konklusjon
    if (results.success) {
      results.message =
        "✅ Alle function handlers fungerer! Klar for Groq-integrasjon.";
    } else {
      results.message =
        "❌ Noen function handlers feilet. Sjekk detaljer nedenfor.";
    }

    return NextResponse.json(results, { status: results.success ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Fatal error",
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
