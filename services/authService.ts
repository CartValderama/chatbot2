import { supabase } from '@/api/supabaseClient';
import { User, AuthError } from '@supabase/supabase-js';

export interface SignupData {
  userType: 'patient' | 'doctor';
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  specialty?: string;
  hospital?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  user_type: 'patient' | 'doctor';
  specialty?: string;
  hospital?: string;
  primary_doctor_id?: string;
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
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      // 2. Insert additional profile info into `users` table
      const { error: dbError } = await supabase.from('users').insert({
        user_id: authData.user?.id,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        user_type: data.userType,
        specialty: data.userType === 'doctor' ? data.specialty : null,
        hospital: data.userType === 'doctor' ? data.hospital : null,
      });

      if (dbError) throw dbError;

      return { user: authData.user, error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { user: null, error: error as Error };
    }
  },

  async login(data: LoginData): Promise<LoginResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // Fetch user profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', authData.user?.id)
        .single();

      if (profileError) throw profileError;

      return { user: authData.user, profile: profile as UserProfile, error: null };
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, profile: null, error: error as Error };
    }
  },

  async logout(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Logout error:', error);
      return { error: error as Error };
    }
  },

  async getCurrentUser(): Promise<LoginResponse> {
    try {
      // Check if session exists first
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // No session, user is logged out - this is normal, not an error
        return { user: null, profile: null, error: null };
      }

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        // Handle session missing error gracefully
        if (error.message.includes('session_not_found') || error.message.includes('AuthSessionMissingError')) {
          return { user: null, profile: null, error: null };
        }
        throw error;
      }

      if (!user) return { user: null, profile: null, error: null };

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      return { user, profile: profile as UserProfile, error: null };
    } catch (error) {
      console.error('Get current user error:', error);
      return { user: null, profile: null, error: error as Error };
    }
  },
};
