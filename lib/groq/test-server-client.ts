/**
 * TEST FILE - Kan slettes etter testing
 *
 * Tester server-side Supabase client
 */

import { createServerClient } from "@/api/supabaseServerClient";

export async function testServerClient() {
  console.log("🧪 Testing server-side Supabase client...");

  try {
    const supabase = createServerClient();

    // Test 1: Hent en bruker (første bruker)
    console.log("Test 1: Henter brukere...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("user_id, first_name, last_name, role")
      .limit(1);

    if (usersError) {
      console.error("❌ Feil ved henting av brukere:", usersError);
      return false;
    }

    if (users && users.length > 0) {
      console.log("✅ Test 1 bestått - Bruker hentet:", users[0]);
    } else {
      console.log("⚠️ Test 1 - Ingen brukere funnet i databasen");
    }

    // Test 2: Sjekk chat_messages tabell
    console.log("\nTest 2: Sjekker chat_messages tabell...");
    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select("*")
      .limit(1);

    if (messagesError) {
      console.error("❌ Feil ved henting av chat_messages:", messagesError);
      return false;
    }

    console.log("✅ Test 2 bestått - chat_messages tabell eksisterer");
    if (messages && messages.length > 0) {
      console.log("   Funnet", messages.length, "melding(er) i tabellen");
    } else {
      console.log("   Tabellen er tom (OK for ny database)");
    }

    // Test 3: Sjekk prescriptions med join
    console.log("\nTest 3: Tester join query (prescriptions med medicines)...");
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from("prescriptions")
      .select(`
        prescription_id,
        medicine:medicines(name)
      `)
      .limit(1);

    if (prescriptionsError) {
      console.error("❌ Feil ved join query:", prescriptionsError);
      return false;
    }

    console.log("✅ Test 3 bestått - Join queries fungerer");
    if (prescriptions && prescriptions.length > 0) {
      console.log("   Resept data:", prescriptions[0]);
    }

    console.log("\n✅ Alle tester bestått! Server-side client fungerer korrekt.");
    return true;

  } catch (error) {
    console.error("❌ Uventet feil:", error);
    return false;
  }
}

// Kjør test hvis filen kjøres direkte
if (require.main === module) {
  testServerClient()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
}
