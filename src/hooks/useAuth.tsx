
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { 
  Session, 
  User, 
  AuthError,
  AuthChangeEvent 
} from '@supabase/supabase-js';
import { supabase } from '../main';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: AuthError | null }>;
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
      console.log('Initial session check:', session);
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
      console.log('Fetching user role for ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      if (data?.role) {
        console.log('User role found:', data.role);
        setUserRole(data.role as 'admin' | 'company' | 'driver');
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (result.error) {
        console.error('Error signing in:', result.error);
        toast.error('Error signing in', {
          description: result.error.message
        });
      } else {
        console.log('Sign in successful');
        toast.success('Welcome back!');
      }
      
      return { error: result.error };
    } catch (err) {
      console.error('Error signing in:', err);
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
      console.error('Error signing in with Google:', err);
      return { error: err as AuthError };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('Signing up user:', email);
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            email: email,
            role: userData?.accountType || 'driver',
            full_name: userData?.firstName && userData?.lastName 
              ? `${userData.firstName} ${userData.lastName}` 
              : ''
          }
        }
      });
      
      if (result.error) {
        toast.error('Error creating account', {
          description: result.error.message
        });
        return { error: result.error };
      }
      
      console.log('Sign up result:', result);
      
      // Create company record if user is signing up as company
      if (userData?.accountType === 'company' && result.data.user) {
        const { error: companyError } = await supabase
          .from('companies')
          .insert({
            user_id: result.data.user.id,
            name: userData.companyName || '',
          });
          
        if (companyError) {
          console.error('Error creating company record:', companyError);
        }
      }
      
      // Create driver record if user is signing up as driver
      if (userData?.accountType === 'driver' && result.data.user) {
        const { error: driverError } = await supabase
          .from('drivers')
          .insert({
            user_id: result.data.user.id,
            name: `${userData.firstName} ${userData.lastName}`,
            phone: userData.phone || '',
          });
          
        if (driverError) {
          console.error('Error creating driver record:', driverError);
        }
      }
      
      toast.success('Account created successfully', {
        description: 'Please check your email to verify your account.'
      });
      
      return { error: null };
    } catch (err) {
      console.error('Error creating account:', err);
      return { error: err as AuthError };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const result = await supabase.auth.signOut();
      if (!result.error) {
        toast.success('You have been signed out');
      }
      return { error: result.error };
    } catch (err) {
      console.error('Error signing out:', err);
      return { error: err as AuthError };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (!result.error) {
        toast.success('Password reset email sent', {
          description: 'Please check your email to reset your password.'
        });
      }
      
      return { error: result.error };
    } catch (err) {
      console.error('Error resetting password:', err);
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
