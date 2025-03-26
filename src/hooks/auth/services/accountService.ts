
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';

// Enhanced Sign out with better feedback and error handling
export const signOut = async () => {
  console.log('Attempting to sign out user');
  
  try {
    // Clear any local storage items related to user state
    localStorage.removeItem('lastAuthRoute');
    localStorage.removeItem('userRole');
    
    // Check if there's a session first
    const { data: sessionData } = await supabase.auth.getSession();
    
    // Only attempt to sign out if there's an active session
    if (sessionData?.session) {
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
    } else {
      // If no session exists, just inform the user they're logged out
      console.log('No active session found, user is already signed out');
      toast.success('Você já está desconectado');
      
      // Force clear any remaining auth state
      localStorage.removeItem('sb-xxx-auth-token'); // Generic pattern that might catch Supabase tokens
    }
    
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

// Update company status
export const updateCompanyStatus = async (companyId: string, status: string) => {
  try {
    const { error } = await supabase
      .from('companies')
      .update({ status })
      .eq('id', companyId);
    
    if (error) throw error;
    
    toast.success(`Status da empresa atualizado para ${status}`);
    return { error: null };
  } catch (error: any) {
    console.error('Error updating company status:', error);
    toast.error('Erro ao atualizar status da empresa', {
      description: error.message
    });
    return { error };
  }
};

// Send password reset email to a specific user (admin function)
export const sendAdminPasswordReset = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) throw error;
    
    toast.success('Email de redefinição enviado com sucesso', {
      description: `Um email foi enviado para ${email}`
    });
    return { error: null };
  } catch (error: any) {
    console.error('Error sending password reset:', error);
    toast.error('Erro ao enviar email de redefinição', {
      description: error.message
    });
    return { error };
  }
};
