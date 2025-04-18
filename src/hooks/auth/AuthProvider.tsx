
import React, { createContext, useEffect, useState, useCallback } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../integrations/supabase/client';
import { signIn, signInWithGoogle, signUp, signOut, resetPassword } from './authFunctions';
import { fetchUserRole } from './userProfile';
import { AuthContextType, UserRole } from './types';
import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticating: false,
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
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

  // Update driver company context from localStorage
  const updateDriverCompanyContext = useCallback(() => {
    const companyId = localStorage.getItem('driverCompanyId');
    const companyName = localStorage.getItem('driverCompanyName');
    
    if (companyId && companyName && userRole === 'driver') {
      setCompanyContext({
        id: companyId,
        name: companyName
      });
      console.log('Driver company context loaded:', companyId, companyName);
    } else {
      setCompanyContext(null);
    }
  }, [userRole]);

  // Function to get user role from database
  const getUserRole = useCallback(async (userId: string) => {
    try {
      const role = await fetchUserRole(userId);
      console.log('User role fetched:', role);
      setUserRole(role);
      
      // Update driver company context after role is set
      if (role === 'driver') {
        updateDriverCompanyContext();
      }
      
      return role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
      return null;
    }
  }, [updateDriverCompanyContext]);

  // Initialize and set up auth state listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          await getUserRole(currentSession.user.id);
        }
        
        // Subscribe to auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, updatedSession) => {
            console.log('Auth state changed:', event);
            
            setSession(updatedSession);
            setUser(updatedSession?.user || null);
            
            if (event === 'SIGNED_IN' && updatedSession?.user) {
              await getUserRole(updatedSession.user.id);
            } else if (event === 'SIGNED_OUT') {
              setUserRole(null);
              localStorage.removeItem('driverCompanyId');
              localStorage.removeItem('driverCompanyName');
              setCompanyContext(null);
            }
          }
        );
        
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, [getUserRole]);
  
  // Handle sign-in with wrapper function to manage loading state
  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsAuthenticating(true);
      const result = await signIn(email, password);
      
      if (!result.error) {
        toast.success('Login realizado com sucesso');
      }
      
      return result;
    } catch (error) {
      toast.error('Erro inesperado ao fazer login');
      return { error: error as AuthError };
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Handle sign-in with Google
  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      return await signInWithGoogle();
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Handle sign-up
  const handleSignUp = async (email: string, password: string, userData?: any) => {
    try {
      setIsAuthenticating(true);
      return await signUp(email, password, userData);
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Handle sign-out
  const handleSignOut = async () => {
    try {
      setIsAuthenticating(true);
      localStorage.removeItem('driverCompanyId');
      localStorage.removeItem('driverCompanyName');
      setCompanyContext(null);
      return await signOut();
    } catch (error) {
      return { error: error as Error };
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Handle password reset
  const handleResetPassword = async (email: string) => {
    try {
      setIsAuthenticating(true);
      return await resetPassword(email);
    } catch (error) {
      return { error: error as AuthError };
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Context value to be provided
  const contextValue: AuthContextType = {
    session,
    user,
    isLoading,
    isAuthenticating,
    signIn: handleSignIn,
    signInWithGoogle: handleGoogleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    userRole,
    companyContext
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
