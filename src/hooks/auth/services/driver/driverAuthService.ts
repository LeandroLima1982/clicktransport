
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../../integrations/supabase/client';
import { ValidateDriverCompanyParams } from '../../databaseFunctions';
import { toast } from 'sonner';

// Helper function to update driver login status
export const updateDriverLoginStatus = async (email: string, companyId: string) => {
  try {
    // Safely check if the driver exists and can be updated
    const { data: driverData, error: driverFetchError } = await supabase
      .from('drivers')
      .select('id')
      .eq('email', email)
      .eq('company_id', companyId)
      .maybeSingle();
      
    if (!driverFetchError && driverData) {
      // Update the driver using status as a safe field
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ last_login: new Date().toISOString() })
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
    // Create properly typed parameters
    const params: ValidateDriverCompanyParams = {
      _email: email,
      _company_id: companyId
    };
    
    // Call the RPC function with the correct parameters
    const { data: isValid, error: validationError } = await supabase
      .rpc('validate_driver_company_association', params);
    
    return { isValid, error: validationError };
  } catch (err) {
    console.error('Error validating driver company association:', err);
    return { isValid: false, error: err as Error };
  }
};
