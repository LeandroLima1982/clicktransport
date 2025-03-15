
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
