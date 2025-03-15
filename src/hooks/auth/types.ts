
import { 
  Session, 
  User, 
  AuthError
} from '@supabase/supabase-js';

export type UserRole = 'admin' | 'company' | 'driver' | 'client' | null;

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  userRole: UserRole;
  companyContext?: {
    id: string;
    name: string;
  } | null;
};
