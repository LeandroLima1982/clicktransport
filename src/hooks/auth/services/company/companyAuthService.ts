
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../../integrations/supabase/client';

// Verify if a user is a company admin
export const verifyCompanyAdmin = async (userId: string, companyId: string) => {
  try {
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('user_id', userId)
      .single();
    
    if (companyError || !companyData) {
      console.error('User not associated with this company as admin:', companyError || 'No company record found');
      return { 
        isCompanyAdmin: false, 
        error: {
          message: 'You are not registered as a company admin',
          name: 'invalid_company_admin',
        } as AuthError 
      };
    }
    
    console.log('Company admin association verified');
    return { isCompanyAdmin: true, error: null };
  } catch (err) {
    console.error('Error verifying company admin:', err);
    return { isCompanyAdmin: false, error: err as AuthError };
  }
};
