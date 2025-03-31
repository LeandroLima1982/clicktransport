
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

interface SignUpResult {
  error: AuthError | null;
  data?: any;
  requiresEmailConfirmation?: boolean;
  companyError?: any; // Added property to fix TypeScript error
}

// Sign up with email and password
export const signUp = async (email: string, password: string, userData?: UserData): Promise<SignUpResult> => {
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
        } as AuthError,
        requiresEmailConfirmation: false
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
          } as AuthError,
          requiresEmailConfirmation: false
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
        } as AuthError,
        requiresEmailConfirmation: false
      };
    }
    
    // Validate required fields
    if (!userData?.firstName || !userData?.lastName) {
      toast.error('Nome e sobrenome são obrigatórios');
      return {
        error: {
          message: 'First name and last name are required',
          name: 'validation_error'
        } as AuthError,
        requiresEmailConfirmation: false
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
      console.error('Sign up error:', result.error);
      toast.error('Erro ao criar conta', {
        description: result.error.message
      });
      return { 
        error: result.error,
        requiresEmailConfirmation: false
      };
    }
    
    console.log('Sign up result:', result);
    
    // Check if email confirmation is required (this will be true for Supabase projects with email confirmation enabled)
    const requiresEmailConfirmation = result.data?.user?.identities?.[0]?.identity_data?.email_verified === false;
    
    // Create company record if user is signing up as company
    // NOTE: We now add manual_creation=true flag to prevent duplication with database trigger
    if (userRole === 'company' && result.data.user) {
      try {
        const { error: companyError } = await supabase
          .from('companies')
          .insert({
            user_id: result.data.user.id,
            name: userData.companyName || '',
            cnpj: userData.cnpj || null,
            status: 'pending', // Start as pending for admin approval
            manual_creation: true // Add flag to identify manually created companies
          });
          
        if (companyError) {
          console.error('Error creating company record:', companyError);
          toast.error('Erro ao criar registro da empresa', {
            description: companyError.message
          });
          // Even if company record creation fails, the user was created, so we still return success
          // but include the error message for debugging
          return {
            error: null,
            data: result.data,
            requiresEmailConfirmation,
            companyError 
          };
        } else {
          if (requiresEmailConfirmation) {
            toast.success('Cadastro iniciado com sucesso!', {
              description: 'Verifique seu email para confirmar o cadastro. Após confirmar, seu cadastro será analisado pela administração.'
            });
          } else {
            toast.success('Empresa registrada com sucesso', {
              description: 'Seu cadastro será analisado pela administração. Você receberá um e-mail quando for aprovado.'
            });
          }
        }
      } catch (companyInsertError: any) {
        console.error('Exception creating company record:', companyInsertError);
        toast.error('Erro inesperado ao criar registro da empresa');
        // Return partial success as the user was created even if company record failed
        return {
          error: null,
          data: result.data,
          requiresEmailConfirmation,
          companyError: companyInsertError
        };
      }
    } else if (requiresEmailConfirmation) {
      // For non-company users with email confirmation required
      toast.success('Cadastro iniciado com sucesso!', {
        description: 'Verifique seu email para confirmar o cadastro.'
      });
    } else {
      // For non-company users without email confirmation
      toast.success('Conta criada com sucesso!');
    }
    
    // Return success with user data
    return { 
      error: null, 
      data: result.data,
      requiresEmailConfirmation 
    };
  } catch (err: any) {
    console.error('Error creating account:', err);
    toast.error('Erro inesperado ao criar conta');
    return { 
      error: err as AuthError,
      requiresEmailConfirmation: false
    };
  }
};
