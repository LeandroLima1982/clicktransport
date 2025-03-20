
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../../integrations/supabase/client';

// Verify if a user is a company admin
export const verifyCompanyAdmin = async (userId: string, companyId?: string) => {
  try {
    // If no companyId is provided, check if the user is associated with any company
    if (!companyId) {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();
      
      if (companyError) {
        console.error('Error checking company association:', companyError);
        return { 
          isCompanyAdmin: false, 
          error: {
            message: 'Erro ao verificar associação com empresa',
            name: 'company_verification_error',
          } as AuthError 
        };
      }
      
      if (!companyData) {
        console.error('User not associated with any company as admin');
        return { 
          isCompanyAdmin: false, 
          error: {
            message: 'Você não está registrado como administrador de nenhuma empresa',
            name: 'invalid_company_admin',
          } as AuthError 
        };
      }
      
      console.log('Company admin association verified for any company');
      return { isCompanyAdmin: true, error: null, companyData };
    }
    
    // If companyId is provided, check for that specific company
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (companyError) {
      console.error('Error verifying company admin:', companyError);
      return { 
        isCompanyAdmin: false, 
        error: {
          message: 'Erro ao verificar associação com empresa',
          name: 'company_verification_error',
        } as AuthError 
      };
    }
    
    if (!companyData) {
      console.error('User not associated with this company as admin');
      return { 
        isCompanyAdmin: false, 
        error: {
          message: 'Você não está registrado como administrador desta empresa',
          name: 'invalid_company_admin',
        } as AuthError 
      };
    }
    
    console.log('Company admin association verified for specific company');
    return { isCompanyAdmin: true, error: null, companyData };
  } catch (err) {
    console.error('Error verifying company admin:', err);
    return { 
      isCompanyAdmin: false, 
      error: {
        message: 'Erro inesperado ao verificar associação com empresa',
        name: 'company_verification_error',
      } as AuthError
    };
  }
};
