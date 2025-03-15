
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../../integrations/supabase/client';
import { toast } from 'sonner';

// Helper function to update driver login status
export const updateDriverLoginStatus = async (email: string) => {
  try {
    // Safely check if the driver exists and can be updated
    const { data: driverData, error: driverFetchError } = await supabase
      .from('drivers')
      .select('id, status')
      .eq('email', email)
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

// Validate if a driver exists in the system
export const validateDriverAssociation = async (email: string) => {
  try {
    console.log('Validating driver association for:', email);
    
    // Check if the driver exists and is active
    const { data: driverData, error: driverError } = await supabase
      .from('drivers')
      .select('id, status, company_id, email')
      .eq('email', email)
      .maybeSingle();
    
    if (driverError) {
      console.error('Error checking driver status:', driverError);
      return { isValid: false, error: driverError, message: 'Erro ao verificar motorista' };
    }
    
    if (!driverData) {
      console.error('Driver not found');
      return { 
        isValid: false, 
        error: new Error('Driver not found'),
        message: 'Usuário não encontrado como motorista no sistema' 
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

    // If we get here, store the company ID for the session
    if (driverData.company_id) {
      localStorage.setItem('driverCompanyId', driverData.company_id);
      
      // Get company name to display in UI
      const { data: companyData } = await supabase
        .from('companies')
        .select('name')
        .eq('id', driverData.company_id)
        .single();
        
      if (companyData) {
        localStorage.setItem('driverCompanyName', companyData.name);
      }
    }
    
    // Driver exists and is active
    console.log('Driver is valid and active');
    return { isValid: true, error: null, message: null };
  } catch (err) {
    console.error('Error validating driver:', err);
    return { 
      isValid: false, 
      error: err as Error,
      message: 'Erro ao validar motorista' 
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
