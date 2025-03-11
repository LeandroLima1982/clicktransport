import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../../integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to update driver login status
export const updateDriverLoginStatus = async (email: string, companyId: string) => {
  try {
    // Safely check if the driver exists and can be updated
    const { data: driverData, error: driverFetchError } = await supabase
      .from('drivers')
      .select('id, status')
      .eq('email', email)
      .eq('company_id', companyId)
      .maybeSingle();
      
    if (!driverFetchError && driverData) {
      // Update the driver using status as a safe field
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ 
          last_login: new Date().toISOString(),
          status: driverData.status === 'inactive' ? 'active' : driverData.status 
        })
        .eq('id', driverData.id);
        
      if (updateError) {
        console.error('Error updating driver login status:', updateError);
      }
    }
  } catch (updateErr) {
    console.error('Exception updating login status:', updateErr);
  }
};

// Helper function to check if driver needs to change password
export const checkDriverPasswordChange = async (userId: string) => {
  try {
    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (!driverError && driverData) {
      // Safely check if property exists before accessing
      const passwordChanged = driverData.is_password_changed !== undefined ? 
        driverData.is_password_changed : null;
        
      if (passwordChanged === false) {
        console.log('Driver needs to change password on first login');
        toast.info('Você precisa alterar sua senha no primeiro acesso', {
          description: 'Por favor, acesse seu perfil para definir uma nova senha.'
        });
      }
    }
  } catch (err) {
    console.error('Error checking password change status:', err);
  }
};

// Validate if a driver is associated with a specific company
export const validateDriverCompanyAssociation = async (email: string, companyId: string) => {
  try {
    // First check if the driver exists and is active in this company
    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      .select('id, status')
      .eq('email', email)
      .eq('company_id', companyId)
      .maybeSingle();
    
    if (driverError) {
      console.error('Error checking driver status:', driverError);
      return { isValid: false, error: driverError, message: 'Erro ao verificar motorista' };
    }
    
    if (!driverData) {
      console.error('Driver not found or not associated with this company');
      return { 
        isValid: false, 
        error: new Error('Driver not found'),
        message: 'Você não está registrado como motorista nesta empresa' 
      };
    }
    
    if (driverData.status === 'inactive') {
      console.error('Driver account is inactive');
      return { 
        isValid: false, 
        error: new Error('Inactive driver'),
        message: 'Sua conta de motorista está inativa. Entre em contato com a empresa.' 
      };
    }
    
    // Fix the RPC function call with proper parameter types
    const { data, error: validationError } = await supabase
      .rpc('validate_driver_company_association', {
        _email: email,
        _company_id: companyId as string
      });
    
    if (validationError) {
      return { 
        isValid: false, 
        error: validationError,
        message: 'Falha na validação de motorista' 
      };
    }
    
    if (!data) {
      return { 
        isValid: false, 
        error: new Error('Association validation failed'),
        message: 'Você não está associado a esta empresa' 
      };
    }
    
    return { isValid: data as boolean, error: null, message: null };
  } catch (err) {
    console.error('Error validating driver company association:', err);
    return { 
      isValid: false, 
      error: err as Error,
      message: 'Erro ao validar associação com a empresa' 
    };
  }
};

// Get company data for the driver session
export const getDriverCompanyData = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, status')
      .eq('id', companyId)
      .maybeSingle();
      
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching company data:', err);
    return { data: null, error: err as Error };
  }
};
