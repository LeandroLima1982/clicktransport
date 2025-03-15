
import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

// Define the user role type to match the one in auth/types.ts
export type UserRole = 'admin' | 'company' | 'driver' | 'client' | null;

// Define the auth context type to include all required properties
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  isLoading: boolean;
  companyContext?: {
    id: string;
    name: string;
  } | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, role: UserRole, metadata?: any) => Promise<{ error: Error | null }>;
  isAuthenticating: boolean;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companyContext, setCompanyContext] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    // Set up the auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, sessionData) => {
        console.log(`Auth state changed: ${event}`);
        setSession(sessionData);
        setUser(sessionData?.user ?? null);
        
        if (sessionData?.user) {
          await fetchUserRole(sessionData.user.id);
        } else {
          setUserRole(null);
        }

        setIsLoading(false);
      }
    );

    // Get the initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchUserRole(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup the listener
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch the user's role from the profiles table
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setUserRole(data?.role as UserRole || null);
      console.log(`User role set: ${data?.role}`);
      
      // Check if user is a driver and has company context
      if (data?.role === 'driver') {
        await fetchDriverCompanyContext(userId);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };
  
  // Fetch driver's company context if applicable
  const fetchDriverCompanyContext = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('company_id, companies:company_id(id, name)')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching driver company context:', error);
        return;
      }
      
      if (data?.companies) {
        const company = data.companies as {id: string, name: string};
        setCompanyContext({
          id: company.id,
          name: company.name
        });
        
        // Also store in localStorage for persistence
        localStorage.setItem('driverCompanyId', company.id);
        localStorage.setItem('driverCompanyName', company.name);
      }
    } catch (error) {
      console.error('Error fetching driver company context:', error);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setSession(data.session);
      setUser(data.user);
      await fetchUserRole(data.user.id);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || 'Verifique suas credenciais e tente novamente.',
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setIsAuthenticating(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      setSession(null);
      setUser(null);
      setUserRole(null);
      setCompanyContext(null);
      
      // Clear company context from local storage
      localStorage.removeItem('driverCompanyId');
      localStorage.removeItem('driverCompanyName');
      
      toast({
        title: "Logout realizado com sucesso",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, role: UserRole, metadata: any = {}) => {
    setIsAuthenticating(true);
    try {
      // Include the role in the user metadata for the trigger function
      const metadataWithRole = {
        ...metadata,
        role
      };
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadataWithRole
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Cadastro realizado com sucesso",
        description: "Verifique seu e-mail para confirmar o cadastro.",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Password reset function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      return { error };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { error };
    }
  };

  // The auth context value
  const value: AuthContextType = {
    user,
    session,
    userRole,
    signIn,
    signOut,
    signUp,
    isAuthenticating,
    resetPassword,
    isLoading,
    companyContext
  };

  // Provide the auth context
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
