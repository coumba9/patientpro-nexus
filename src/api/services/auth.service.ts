
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  first_name: string;
  last_name: string;
  role: 'doctor' | 'patient' | 'admin';
  // Champs spécifiques au médecin
  specialty_id?: string;
  license_number?: string;
  years_of_experience?: number;
}

class AuthService {
  async login({ email, password }: LoginCredentials): Promise<{ user: User | null; session: Session | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Login error:', error);
      throw error;
    }

    const user = data.user;
    const session = data.session;

    // Empêcher la connexion des médecins non approuvés
    if (user) {
      try {
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (!rolesError) {
          const isDoctor = roles?.some((r: { role: string }) => r.role === 'doctor');

          if (isDoctor) {
            const { data: applications, error: appError } = await supabase
              .from('doctor_applications')
              .select('status, email')
              .eq('email', user.email)
              .order('created_at', { ascending: false })
              .limit(1);

            if (!appError) {
              const application = applications && applications[0];

              if (!application || application.status !== 'approved') {
                await supabase.auth.signOut();
                throw new Error("Votre compte médecin n'a pas encore été approuvé par un administrateur.");
              }
            }
          }
        }
      } catch (checkError) {
        console.error('Error while checking doctor approval status:', checkError);
        throw checkError;
      }
    }

    return { user, session };
  }

  async register(userData: RegisterData): Promise<{ user: User | null; session: Session | null }> {
    const { email, password, first_name, last_name, role, specialty_id, license_number, years_of_experience } = userData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          role,
          speciality: specialty_id,
          licenseNumber: license_number,
          yearsOfExperience: years_of_experience
        }
      }
    });

    if (error) {
      console.error('Registration error:', error);
      throw error;
    }

    return { user: data.user, session: data.session };
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Get session error:', error);
      throw error;
    }
    return data.session;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Get user error:', error);
      throw error;
    }
    return data.user;
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
