import { 
  Session, 
  User, 
  AuthError
} from '@supabase/supabase-js';

export type UserRole = 'admin' | 'company' | 'driver' | 'client' | null;

export type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  signIn: (email: string, password: string, companyId?: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  userRole: UserRole;
};

// Extended driver interface to match the database structure
export interface Driver {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  license_number: string | null;
  status: 'active' | 'inactive' | 'on_trip';
  vehicle_id: string | null;
  is_password_changed: boolean | null;
  last_login: string | null;
  company_id: string | null;
  user_id: string | null;
  created_at: string | null;
}
