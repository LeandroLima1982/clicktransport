
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';

interface UserData {
  accountType?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  companyName?: string;
  cnpj?: string;
  [key: string]: any;
}

// Sign up with email and password
export const signUp = async (email: string, password: string, userData?: UserData) => {
  try {
    console.log('Signing up user:', email);
    // Always default to client role if not specified - this prevents accidental registration as driver
    const userRole = userData?.accountType || 'client'; 
    
    console.log('User role for registration:', userRole);
    
    // Ensure 'driver' role is not allowed in public registration
    if (userRole === 'driver') {
      toast.error('Driver registration is only available through the company panel');
      return { 
        error: {
          message: 'Driver registration is not allowed here',
          name: 'registration_not_allowed'
        } as AuthError 
      };
    }
    
    // Validate company data if registering as company
    if (userRole === 'company') {
      if (!userData?.companyName) {
        toast.error('Nome da empresa é obrigatório');
        return {
          error: {
            message: 'Company name is required',
            name: 'validation_error'
          } as AuthError
        };
      }
    }
    
    // Validate that password has minimum length
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return {
        error: {
          message: 'Password must be at least 6 characters',
          name: 'validation_error'
        } as AuthError
      };
    }
    
    // Validate required fields
    if (!userData?.firstName || !userData?.lastName) {
      toast.error('Nome e sobrenome são obrigatórios');
      return {
        error: {
          message: 'First name and last name are required',
          name: 'validation_error'
        } as AuthError
      };
    }
    
    // Proceed with sign up
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
            : '',
          phone: userData?.phone || ''
        }
      }
    });
    
    if (result.error) {
      toast.error('Erro ao criar conta', {
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
          cnpj: userData.cnpj || null,
          status: 'pending', // Start as pending for admin approval
        });
        
      if (companyError) {
        console.error('Error creating company record:', companyError);
        toast.error('Erro ao criar registro da empresa', {
          description: companyError.message
        });
      } else {
        toast.success('Empresa registrada com sucesso', {
          description: 'Seu cadastro será analisado pela administração. Você receberá um e-mail quando for aprovado.'
        });
      }
    }
    
    // Driver creation is now handled only through the company panel
    
    return { error: null, data: result.data };
  } catch (err) {
    console.error('Error creating account:', err);
    toast.error('Erro inesperado ao criar conta');
    return { error: err as AuthError };
  }
};
