
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { AuthContextType, UserRole } from './types';

// Create the auth context with default values
export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticating: false,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  userRole: null,
  companyContext: null
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [companyContext, setCompanyContext] = useState<{id: string, name: string} | null>(null);

  // Fetch the user's role from the profiles table
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      console.log(`User role set: ${data?.role}`);
      return data?.role as UserRole || null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
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
        return null;
      }
      
      if (data?.companies) {
        const company = data.companies as {id: string, name: string};
        
        // Store in localStorage for persistence
        localStorage.setItem('driverCompanyId', company.id);
        localStorage.setItem('driverCompanyName', company.name);
        
        return {
          id: company.id,
          name: company.name
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching driver company context:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          const role = await fetchUserRole(currentSession.user.id);
          setUserRole(role);
          
          if (role === 'driver') {
            const companyData = await fetchDriverCompanyContext(currentSession.user.id);
            setCompanyContext(companyData);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, updatedSession) => {
        console.log('Auth state changed:', event);
        
        if (!isMounted) return;
        
        setSession(updatedSession);
        setUser(updatedSession?.user || null);
        
        if (event === 'SIGNED_IN' && updatedSession?.user) {
          const role = await fetchUserRole(updatedSession.user.id);
          setUserRole(role);
          
          if (role === 'driver') {
            const companyData = await fetchDriverCompanyContext(updatedSession.user.id);
            setCompanyContext(companyData);
          }
        } else if (event === 'SIGNED_OUT') {
          setUserRole(null);
          setCompanyContext(null);
          localStorage.removeItem('driverCompanyId');
          localStorage.removeItem('driverCompanyName');
        }
        
        setIsLoading(false);
      }
    );
    
    initializeAuth();
    
    // Cleanup
    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

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
  const signUp = async (email: string, password: string, userData?: any) => {
    setIsAuthenticating(true);
    try {
      // Get the role from userData if available
      const role = userData?.accountType || 'client';
      
      // Include the role in the user metadata for the trigger function
      const metadataWithRole = {
        ...userData,
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
