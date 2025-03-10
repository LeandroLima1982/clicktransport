
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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user role from profiles table if user exists
      if (session?.user) {
        fetchUserRole(session.user.id).then(role => {
          console.log('User role fetched:', role);
          setUserRole(role);
        });
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
          const role = await fetchUserRole(currentSession.user.id);
          console.log('User role updated on auth change:', role);
          setUserRole(role);
          
          if (event === 'SIGNED_IN') {
            toast.success('Login realizado com sucesso!');
          }
        } else {
          setUserRole(null);
          
          if (event === 'SIGNED_OUT') {
            toast.success('Logout realizado com sucesso!');
          }
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Enhanced signOut function that clears user state
  const handleSignOut = async () => {
    const result = await signOut();
    
    if (!result.error) {
      // Clear local state
      setUser(null);
      setSession(null);
      setUserRole(null);
    }
    
    return result;
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut: handleSignOut,
    resetPassword,
    userRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
