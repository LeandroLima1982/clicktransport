
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../main';
import { toast } from 'sonner';

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
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
    }
    
    return { error: result.error };
  } catch (err) {
    console.error('Error signing in:', err);
    return { error: err as AuthError };
  }
};

// Sign in with Google OAuth
export const signInWithGoogle = async () => {
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
export const signUp = async (email: string, password: string, userData?: any) => {
  try {
    console.log('Signing up user:', email);
    // Always default to client role if not specified - this prevents accidental registration as company/driver
    const userRole = userData?.accountType || 'client'; 
    
    console.log('User role for registration:', userRole);
    
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email: email,
          role: userRole,
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
    if (userRole === 'company' && result.data.user) {
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
    if (userRole === 'driver' && result.data.user) {
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
    
    return { error: null };
  } catch (err) {
    console.error('Error creating account:', err);
    return { error: err as AuthError };
  }
};

// Enhanced Sign out with better feedback
export const signOut = async () => {
  console.log('Attempting to sign out user');
  
  try {
    const result = await supabase.auth.signOut();
    if (result.error) {
      console.error('Error signing out:', result.error);
      toast.error('Erro ao fazer logout', {
        description: result.error.message
      });
    } else {
      console.log('User signed out successfully');
    }
    return { error: result.error };
  } catch (err) {
    console.error('Exception during sign out:', err);
    toast.error('Erro inesperado ao fazer logout');
    return { error: err as AuthError };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
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
