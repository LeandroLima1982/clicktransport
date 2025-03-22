
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced Sign out with better feedback and error handling
export const signOut = async () => {
  console.log('Attempting to sign out user');
  
  try {
    // Clear any local storage or session storage if needed
    localStorage.removeItem('driverCompanyId');
    localStorage.removeItem('driverCompanyName');
    
    // Perform the actual sign out
    const result = await supabase.auth.signOut();
    
    if (result.error) {
      console.error('Error signing out from Supabase:', result.error);
      throw result.error;
    }
    
    console.log('User signed out successfully from Supabase');
    toast.success('Logout realizado com sucesso');
    return { error: null };
  } catch (err) {
    console.error('Exception during sign out:', err);
    toast.error('Erro ao fazer logout');
    return { error: err as AuthError | Error };
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
