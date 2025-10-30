import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Persist session in localStorage
    autoRefreshToken: true, // Automatically refresh token before expiry
    detectSessionInUrl: true, // Detect OAuth sessions in URL
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
