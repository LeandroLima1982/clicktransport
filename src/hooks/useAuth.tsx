
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  Session, 
  User, 
  AuthError,
  AuthChangeEvent 
} from '@supabase/supabase-js';
import { supabase } from '../main';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  userRole: 'admin' | 'company' | 'driver' | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'company' | 'driver' | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role from profiles table if user exists
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Update user role when auth state changes
        if (currentSession?.user) {
          fetchUserRole(currentSession.user.id);
        } else {
          setUserRole(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to fetch user role from profiles table
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar papel do usuário:', error);
        return;
      }
      
      if (data?.role) {
        setUserRole(data.role as 'admin' | 'company' | 'driver');
      }
    } catch (err) {
      console.error('Erro ao buscar papel do usuário:', err);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (result.error) {
        console.error('Erro ao fazer login:', result.error);
      } else {
        console.log('Login bem-sucedido');
      }
      
      return { error: result.error };
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      return { error: err as AuthError };
    }
  };

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    try {
      const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      return { error: result.error };
    } catch (err) {
      console.error('Erro ao fazer login com Google:', err);
      return { error: err as AuthError };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      return { error: result.error };
    } catch (err) {
      console.error('Erro ao criar conta:', err);
      return { error: err as AuthError };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const result = await supabase.auth.signOut();
      return { error: result.error };
    } catch (err) {
      console.error('Erro ao sair:', err);
      return { error: err as AuthError };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error: result.error };
    } catch (err) {
      console.error('Erro ao redefinir senha:', err);
      return { error: err as AuthError };
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
