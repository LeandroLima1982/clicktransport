
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
      toast.success('Welcome back!');
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
export const signOut = async () => {
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
