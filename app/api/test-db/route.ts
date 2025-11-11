/**
 * TEST API ROUTE - Kan slettes etter testing
 *
 * Verifiserer at server-side Supabase client fungerer
 * og at chat_messages-tabellen eksisterer.
 *
 * Åpne: http://localhost:3000/api/test-db
 */

import { NextResponse } from "next/server";
import { createServerClient } from "@/api/supabaseServerClient";

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    success: true,
  };

  try {
    const supabase = createServerClient();

    // Test 1: Hent brukere
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("user_id, first_name, last_name, role")
      .limit(3);

    results.tests.push({
      name: "Test 1: Hent brukere",
      success: !usersError,
      error: usersError?.message,
      data: users ? `${users.length} bruker(e) funnet` : null,
    });

    if (usersError) results.success = false;

    // Test 2: Sjekk chat_messages tabell
    const { data: messages, error: messagesError, count } = await supabase
      .from("chat_messages")
      .select("*", { count: "exact" })
      .limit(1);

    results.tests.push({
      name: "Test 2: chat_messages tabell",
      success: !messagesError,
      error: messagesError?.message,
      data: messagesError ? null : `Tabell eksisterer, ${count || 0} meldinger totalt`,
      table_structure_ok: !messagesError,
    });

    if (messagesError) results.success = false;

    // Test 3: Sjekk prescriptions med join
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from("prescriptions")
      .select(`
        prescription_id,
        medicine:medicines(name, dosage)
      `)
      .limit(1);

    results.tests.push({
      name: "Test 3: Join query (prescriptions + medicines)",
      success: !prescriptionsError,
      error: prescriptionsError?.message,
      data: prescriptions?.length ? "Join fungerer" : "Ingen data, men query OK",
    });

    if (prescriptionsError) results.success = false;

    // Test 4: Verifiser chat_messages struktur
    if (!messagesError && messages) {
      const expectedColumns = [
        "message_id",
        "user_id",
        "message_text",
        "sender_type",
        "timestamp",
        "intent",
      ];

      const sampleMessage = messages[0];
      const hasAllColumns = sampleMessage
        ? expectedColumns.every((col) => col in sampleMessage)
        : true; // OK hvis tom tabell

      results.tests.push({
        name: "Test 4: chat_messages struktur",
        success: hasAllColumns,
        data: hasAllColumns
          ? "Alle påkrevde kolonner finnes"
          : "Mangler kolonner",
        columns_verified: expectedColumns,
      });

      if (!hasAllColumns) results.success = false;
    }

    // Konklusjon
    if (results.success) {
      results.message = "✅ Alle tester bestått! Database er klar for Groq-integrasjon.";
    } else {
      results.message = "❌ Noen tester feilet. Sjekk detaljer nedenfor.";
    }

    return NextResponse.json(results, { status: results.success ? 200 : 500 });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Fatal error",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
