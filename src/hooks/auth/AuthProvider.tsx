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
  
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.log('Safety timeout triggered - forcing loading state to false');
        setIsLoading(false);
        setAuthInitialized(true);
      }
    }, 5000);
    
    return () => clearTimeout(safetyTimeout);
  }, [isLoading]);

  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      try {
        console.log('Initializing auth...');
        
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
          
          try {
            console.log('Fetching initial user role...');
            const role = await fetchUserRole(session.user.id);
            if (!mounted) return;
            
            console.log('Initial user role fetched:', role);
            setUserRole(role);
          } catch (roleError) {
            console.error('Error fetching initial user role:', roleError);
            if (!mounted) return;
            setUserRole(null);
          }
        } else {
          setSession(null);
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (!mounted) return;
        
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
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN' && currentSession?.user) {
          setIsLoading(true);
          
          try {
            console.log('Fetching user role after sign in...');
            const role = await fetchUserRole(currentSession.user.id);
            
            if (!mounted) return;
            
            console.log('User role updated on auth change:', role);
            setUserRole(role);
            toast.success('Login realizado com sucesso!');
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
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      setLogoutInProgress(true);
      console.log('Logout initiated...');
      
      const timeoutId = setTimeout(() => {
        console.log('Logout timeout triggered - forcing reset of loading state');
        setLogoutInProgress(false);
        setUser(null);
        setSession(null);
        setUserRole(null);
      }, 5000);
      
      const result = await signOut();
      
      clearTimeout(timeoutId);
      
      if (result.error) {
        console.error('Error signing out:', result.error);
        toast.error('Erro ao fazer logout', {
          description: 'Ocorreu um erro ao encerrar sua sessão. Tente novamente.'
        });
        setLogoutInProgress(false);
        return result;
      }
      
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
