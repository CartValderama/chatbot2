/**
 * Server-side Supabase Client
 *
 * For bruk i Next.js API routes og server components.
 * IKKE bruk window.localStorage (finnes ikke på server).
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables mangler. Sjekk NEXT_PUBLIC_SUPABASE_URL og NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

/**
 * Oppretter en server-side Supabase client
 *
 * Denne bruker IKKE localStorage for persistence.
 * For authentication i API routes, bruk headers/cookies fra request.
 */
export function createServerClient() {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false, // VIKTIG: Ikke persist på server
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Oppretter en Supabase client med authorization fra request headers
 *
 * Bruk denne når du trenger å gjøre authenticated queries i API routes.
 *
 * @param authToken - Access token fra Authorization header
 */
export function createServerClientWithAuth(authToken: string) {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
