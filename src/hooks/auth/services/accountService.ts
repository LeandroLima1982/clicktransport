
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced Sign out with better feedback and error handling
export const signOut = async () => {
  console.log('Attempting to sign out user');
  
  try {
    // Clear any local storage or session storage if needed
    // localStorage.removeItem('yourAuthItem');
    
    // Perform the actual sign out
    const result = await supabase.auth.signOut();
    
    if (result.error) {
      console.error('Error signing out from Supabase:', result.error);
      toast.error('Erro ao sair', {
        description: result.error.message
      });
      throw result.error;
    }
    
    console.log('User signed out successfully from Supabase');
    toast.success('Você saiu com sucesso');
    return { error: null };
  } catch (err) {
    console.error('Exception during sign out:', err);
    toast.error('Erro ao sair', {
      description: 'Ocorreu um erro ao tentar sair. Tente novamente.'
    });
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
      toast.success('Email de redefinição de senha enviado', {
        description: 'Por favor, verifique seu email para redefinir sua senha.'
      });
    } else {
      toast.error('Erro ao enviar email de redefinição', {
        description: result.error.message
      });
    }
    
    return { error: result.error };
  } catch (err) {
    console.error('Error resetting password:', err);
    toast.error('Erro ao solicitar redefinição de senha', {
      description: 'Ocorreu um erro ao processar sua solicitação.'
    });
    return { error: err as AuthError };
  }
};
