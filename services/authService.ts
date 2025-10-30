import { supabase } from "@/api/supabaseClient";
import { User, AuthError } from "@supabase/supabase-js";
import type { UserRole } from "@/types/database";

export interface SignupData {
  first_name: string;
  last_name: string;
  birth_date: string; // e.g., "YYYY-MM-DD"
  gender: "Male" | "Female" | "Other";
  phone?: string;
  email: string;
  address?: string;
  password: string;
  role: "user" | "admin";
  primary_doctor_id?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  primary_doctor_id?: number;
  role: UserRole;
  registration_date: string;
}

interface AuthResponse {
  user: User | null;
  error: AuthError | Error | null;
}

interface LoginResponse extends AuthResponse {
  profile: UserProfile | null;
}

export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      // 1️⃣ Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No user returned from signup");

      // 2️⃣ Insert into `users` table with role
      const { error: userError } = await supabase
        .from("users")
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          birth_date: data.birth_date,
          address: data.address,
          role: data.role, // <-- set user/admin here
          primary_doctor_id: data.primary_doctor_id ?? null,
        })
        .select()
        .single();
      if (userError) throw userError;

      return { user: authData.user, error: null };
    } catch (error) {
      console.error("Signup error:", error);
      return { user: null, error: error as Error };
    }
  },
  async login(data: LoginData): Promise<LoginResponse> {
    try {
      // 1. Log in using Supabase Auth
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      if (!authData.user) throw new Error("No user returned from login");

      // 2. Fetch user profile from your `users` table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", authData.user.email)
        .single();

      if (userError) {
        if (userError.code === "PGRST116") {
          throw new Error(
            "User profile not found. Please sign up first or contact support."
          );
        }
        throw userError;
      }

      // 3. Role is now part of userData
      const profile: UserProfile = {
        ...userData,
        role: userData.role,
      };

      return { user: authData.user, profile, error: null };
    } catch (error) {
      console.error("Login error:", error);
      return { user: null, profile: null, error: error as Error };
    }
  },
  async logout(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Logout error:", error);
      return { error: error as Error };
    }
  },

  async getCurrentUser(): Promise<LoginResponse> {
    try {
      // Check if session exists first
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // No session, user is logged out - this is normal, not an error
        return { user: null, profile: null, error: null };
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        // Handle session missing error gracefully
        if (
          error.message.includes("session_not_found") ||
          error.message.includes("AuthSessionMissingError")
        ) {
          return { user: null, profile: null, error: null };
        }
        throw error;
      }

      if (!user) return { user: null, profile: null, error: null };

      // Fetch user profile by email (since user_id is integer in DB, not UUID)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", user.email)
        .single();

      if (userError) {
        // Handle PGRST116 gracefully (user profile not yet available)
        if (userError.code === "PGRST116") {
          console.warn("User profile not found yet, this may happen right after signup");
          return { user: null, profile: null, error: null };
        }
        throw userError;
      }

      // Role is now directly in the users table
      const profile: UserProfile = {
        ...userData,
        role: userData.role,
      };

      return { user, profile, error: null };
    } catch (error) {
      console.error("Get current user error:", error);
      return { user: null, profile: null, error: error as Error };
    }
  },
};
