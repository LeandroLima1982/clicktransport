
import { useState, useEffect, createContext, ReactNode } from 'react';
import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../../main';
import { AuthContextType, UserRole } from './types';
import { signIn, signInWithGoogle, signUp, signOut, resetPassword } from './authFunctions';
import { fetchUserRole } from './userProfile';
import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [logoutInProgress, setLogoutInProgress] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Add a safety timeout to prevent infinite loading state
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Safety timeout triggered - forcing loading state to false');
        setIsLoading(false);
        setAuthInitialized(true);
      }
    }, 5000); // 5 second maximum loading time
    
    return () => clearTimeout(safetyTimeout);
  }, [isLoading]);

  useEffect(() => {
    let mounted = true;
    
    // Get initial session
    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get session first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          if (mounted) {
            setIsLoading(false);
            setAuthInitialized(true);
          }
          return;
        }
        
        if (!mounted) return;
        
        console.log('Initial session check:', session ? 'Session exists' : 'No session');
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          
          // Fetch user role from profiles table
          try {
            console.log('Fetching initial user role...');
            const role = await fetchUserRole(session.user.id);
            if (!mounted) return;
            
            console.log('Initial user role fetched:', role);
            setUserRole(role);
            
            // Redirect company users based on path
            if (role === 'company' && window.location.pathname === '/') {
              window.location.href = '/company/dashboard';
            }
            
          } catch (roleError) {
            console.error('Error fetching initial user role:', roleError);
            // Don't block the app on role fetch failures
            if (!mounted) return;
            setUserRole(null);
          }
        } else {
          // No session exists
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (!mounted) return;
        
        // Reset states on error for safety
        setSession(null);
        setUser(null);
        setUserRole(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setAuthInitialized(true);
          console.log('Auth initialization complete');
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        console.log('Auth state changed:', event);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing auth state');
          setSession(null);
          setUser(null);
          setUserRole(null);
          setLogoutInProgress(false);
          toast.success('Logout realizado com sucesso!');
          setIsLoading(false);
          return;
        }
        
        // Update session and user
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // For SIGNED_IN events, fetch the user role
        if (event === 'SIGNED_IN' && currentSession?.user) {
          setIsLoading(true);
          
          try {
            console.log('Fetching user role after sign in...');
            const role = await fetchUserRole(currentSession.user.id);
            
            if (!mounted) return;
            
            console.log('User role updated on auth change:', role);
            setUserRole(role);
            toast.success('Login realizado com sucesso!');
            
            // Redirect company users to dashboard after login
            if (role === 'company' && window.location.pathname === '/') {
              window.location.href = '/company/dashboard';
            }
            
          } catch (roleError) {
            console.error('Error fetching user role on auth change:', roleError);
            if (!mounted) return;
            setUserRole(null);
          } finally {
            if (mounted) {
              setIsLoading(false);
            }
          }
        } else {
          // For other events, just update loading state
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Enhanced signOut function that clears user state and handles errors
  const handleSignOut = async () => {
    try {
      setLogoutInProgress(true);
      console.log('Logout initiated...');
      
      // Set a timeout to ensure the loading state doesn't get stuck
      const timeoutId = setTimeout(() => {
        console.log('Logout timeout triggered - forcing reset of loading state');
        setLogoutInProgress(false);
        // Clear user state as a fallback
        setUser(null);
        setSession(null);
        setUserRole(null);
      }, 5000); // 5 seconds timeout
      
      const result = await signOut();
      
      // Clear the timeout if we get a response
      clearTimeout(timeoutId);
      
      if (result.error) {
        console.error('Error signing out:', result.error);
        toast.error('Erro ao fazer logout', {
          description: 'Ocorreu um erro ao encerrar sua sessão. Tente novamente.'
        });
        setLogoutInProgress(false);
        return result;
      }
      
      // Clear local state immediately, don't wait for the auth state change event
      console.log('Logout successful, clearing user state immediately');
      setUser(null);
      setSession(null);
      setUserRole(null);
      setLogoutInProgress(false);
      
      return result;
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      toast.error('Erro ao fazer logout', {
        description: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
      setLogoutInProgress(false);
      return { error: error as Error };
    }
  };

  const value = {
    session,
    user,
    isLoading,
    isAuthenticating: logoutInProgress,
    signIn,
    signInWithGoogle,
    signUp,
    signOut: handleSignOut,
    resetPassword,
    userRole,
  };

  // Only render children once auth is initialized
  // But with a fallback to ensure we don't block the app
  if (!authInitialized && isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <div className="ml-3 text-lg font-medium">Inicializando aplicação...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
