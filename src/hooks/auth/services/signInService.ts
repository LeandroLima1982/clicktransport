
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';
import { updateDriverLoginStatus, checkDriverPasswordChange, validateDriverCompanyAssociation, getDriverCompanyData } from './driver/driverAuthService';
import { verifyAdminRole } from './admin/adminAuthService';
import { verifyCompanyAdmin } from './company/companyAuthService';
import { verifyUserRole } from './user/userRoleService';

// Sign in with email and password
export const signIn = async (email: string, password: string, companyId?: string) => {
  try {
    console.log('Signing in user:', email, companyId ? `with company ID: ${companyId}` : '');
    
    // Special handling for admin login
    const isAdminLogin = email.toLowerCase() === 'admin@clicktransfer.com';
    
    // For driver login, validate company association before attempting to sign in
    if (companyId && !isAdminLogin) {
      // Check if this is likely a driver and validate company association
      const { isValid, error: validationError, message } = 
        await validateDriverCompanyAssociation(email, companyId);
      
      if (validationError || !isValid) {
        console.error('Company association validation failed:', validationError || 'Validation returned false');
        
        return { 
          error: {
            message: message || 'Você não está registrado como motorista para esta empresa',
            name: 'invalid_company_association',
          } as AuthError 
        };
      }
      
      // Get company data to store in session
      const { data: companyData } = await getDriverCompanyData(companyId);
      if (!companyData || companyData.status !== 'active') {
        return { 
          error: {
            message: 'A empresa selecionada está inativa ou não existe',
            name: 'invalid_company',
          } as AuthError 
        };
      }
      
      console.log('Driver company association validated successfully');
    }
    
    // Check if the user exists before attempting to sign in
    if (isAdminLogin) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email)
        .single();
      
      if (profileData && profileData.role === 'admin') {
        console.log('Admin user found in profiles:', profileData);
      } else {
        console.warn('Admin user not found in profiles or does not have admin role');
      }
    }
    
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (result.error) {
      console.error('Error signing in:', result.error);
      toast.error('Error signing in', {
        description: result.error.message
      });
      return { error: result.error };
    } 
    
    console.log('Sign in successful');
    
    // Store company ID in local storage for driver sessions
    if (companyId && result.data.user) {
      localStorage.setItem('driverCompanyId', companyId);
      
      // Get company name to display in UI
      const { data: companyData } = await getDriverCompanyData(companyId);
      if (companyData) {
        localStorage.setItem('driverCompanyName', companyData.name);
      }
    }
    
    // If admin login, verify admin role
    if (isAdminLogin && result.data.user) {
      const { isAdmin, error: adminError } = await verifyAdminRole(result.data.user.id);
      
      if (adminError || !isAdmin) {
        await supabase.auth.signOut();
        return { error: adminError };
      }
      
      console.log('Admin login verified successfully');
      return { error: null };
    }
    
    // For all users, verify their role from profiles
    if (result.data.user) {
      const { role: userRole, error: roleError } = await verifyUserRole(result.data.user.id);
      
      if (roleError) {
        await supabase.auth.signOut();
        return { error: roleError };
      }
      
      // If company ID is provided, verify the association
      if (companyId && typeof companyId === 'string') {
        // For driver role, verify driver-company association
        if (userRole === 'driver') {
          // Update the driver's last login time
          await updateDriverLoginStatus(email, companyId);
          
          console.log('Driver company association verified');
        }
        // For company role, verify user is a company admin
        else if (userRole === 'company') {
          const { isCompanyAdmin, error: companyError } = 
            await verifyCompanyAdmin(result.data.user.id, companyId);
          
          if (companyError || !isCompanyAdmin) {
            await supabase.auth.signOut();
            return { error: companyError };
          }
          
          console.log('Company admin association verified');
        }
        // If user is not driver or company but trying to use company ID, reject
        else {
          console.error('User role does not match login type');
          await supabase.auth.signOut();
          
          return { 
            error: {
              message: 'Your account type does not match the selected login method',
              name: 'role_mismatch',
            } as AuthError 
          };
        }
      } else {
        // If no company ID provided but user is a driver, reject login
        if (userRole === 'driver') {
          console.error('Driver attempting to log in without company ID');
          await supabase.auth.signOut();
          
          return { 
            error: {
              message: 'Drivers must select a company to log in',
              name: 'missing_company_id',
            } as AuthError 
          };
        }
      }

      // Check if driver needs to change password
      if (userRole === 'driver') {
        await checkDriverPasswordChange(result.data.user.id);
      }
    }
    
    return { error: null };
  } catch (err) {
    console.error('Error signing in:', err);
    return { error: err as AuthError };
  }
};

// Sign in with Google OAuth
export const signInWithGoogle = async () => {
  try {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    return { error: result.error };
  } catch (err) {
    console.error('Error signing in with Google:', err);
    return { error: err as AuthError };
  }
};
