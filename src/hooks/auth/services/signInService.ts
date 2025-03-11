import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';
import { ValidateDriverCompanyParams } from '../databaseFunctions';
import { fetchUserRole } from '../userProfile';

// Sign in with email and password
export const signIn = async (email: string, password: string, companyId?: string) => {
  try {
    console.log('Signing in user:', email);
    
    // Special handling for admin login
    const isAdminLogin = email.toLowerCase() === 'admin@clicktransfer.com';
    
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
    
    // If admin login, no need to check company association
    if (isAdminLogin && result.data.user) {
      // Verify admin role
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', result.data.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching admin profile:', profileError);
        await supabase.auth.signOut();
        return { 
          error: {
            message: 'Error fetching admin profile',
            name: 'profile_fetch_error',
          } as AuthError 
        };
      }
      
      const userRole = profileData?.role;
      console.log('Admin role verification:', userRole);
      
      if (userRole !== 'admin') {
        console.error('User is not an admin');
        await supabase.auth.signOut();
        return { 
          error: {
            message: 'You do not have administrator privileges',
            name: 'invalid_admin_role',
          } as AuthError 
        };
      }
      
      console.log('Admin login verified successfully');
      return { error: null };
    }
    
    // First, check user role from profiles for ALL users
    if (result.data.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', result.data.user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        await supabase.auth.signOut();
        return { 
          error: {
            message: 'Error fetching user profile',
            name: 'profile_fetch_error',
          } as AuthError 
        };
      }
      
      const userRole = profileData?.role;
      console.log('User role:', userRole);
      
      // If company ID is provided for driver login, verify the association
      if (companyId && typeof companyId === 'string') {
        // For driver role, verify driver-company association
        if (userRole === 'driver') {
          // Fixed: Explicitly define the type parameters for the RPC call
          const { data: isValid, error: validationError } = await supabase
            .rpc<boolean, ValidateDriverCompanyParams>('validate_driver_company_association', {
              _email: email,
              _company_id: companyId
            });
          
          if (validationError || !isValid) {
            console.error('Driver not associated with this company:', validationError || 'Validation returned false');
            // Sign out the user since they're not associated with the company
            await supabase.auth.signOut();
            
            return { 
              error: {
                message: 'You are not registered as a driver for this company',
                name: 'invalid_company_association',
              } as AuthError 
            };
          }
          
          // Update the driver's last login time
          await updateDriverLoginStatus(email, companyId);
          
          console.log('Driver company association verified');
        }
        // For company role, verify user is a company admin
        else if (userRole === 'company') {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .eq('user_id', result.data.user.id)
            .single();
          
          if (companyError || !companyData) {
            console.error('User not associated with this company as admin:', companyError || 'No company record found');
            // Sign out the user since they're not an admin of the company
            await supabase.auth.signOut();
            
            return { 
              error: {
                message: 'You are not registered as a company admin',
                name: 'invalid_company_admin',
              } as AuthError 
            };
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

// Helper function to update driver login status
const updateDriverLoginStatus = async (email: string, companyId: string) => {
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
const checkDriverPasswordChange = async (userId: string) => {
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
