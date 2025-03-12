import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';
import { validateDriverAssociation, updateDriverLoginStatus, checkDriverPasswordChange } from './driver/driverAuthService';
import { verifyAdminRole } from './admin/adminAuthService';
import { verifyCompanyAdmin } from './company/companyAuthService';
import { verifyUserRole } from './user/userRoleService';

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
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
    
    // Authenticate the user
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
      
      // For driver role, validate the association
      if (userRole === 'driver') {
        const { isValid, error: validationError, message } = 
          await validateDriverAssociation(email);
        
        if (!isValid || validationError) {
          await supabase.auth.signOut();
          return { 
            error: {
              message: message || 'Validação do motorista falhou',
              name: 'driver_validation_failed',
            } as AuthError 
          };
        }
        
        // Update login status and check password change requirement
        await updateDriverLoginStatus(email);
        await checkDriverPasswordChange(result.data.user.id);
        
        console.log('Driver login validated successfully');
      }
      // For company role, verify company admin status
      else if (userRole === 'company') {
        const companyId = localStorage.getItem('driverCompanyId');
        if (companyId) {
          const { isCompanyAdmin, error: companyError } = 
            await verifyCompanyAdmin(result.data.user.id, companyId);
          
          if (companyError || !isCompanyAdmin) {
            await supabase.auth.signOut();
            return { error: companyError };
          }
          
          console.log('Company admin association verified');
        }
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
