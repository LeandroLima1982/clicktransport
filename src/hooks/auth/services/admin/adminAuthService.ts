
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../../integrations/supabase/client';

// Verify if a user has admin role
export const verifyAdminRole = async (userId: string) => {
  try {
    console.log('Verifying admin role for user ID:', userId);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching admin profile:', profileError);
      return { 
        isAdmin: false, 
        error: {
          message: 'Error fetching admin profile',
          name: 'profile_fetch_error',
        } as AuthError 
      };
    }
    
    const userRole = profileData?.role;
    console.log('Admin role verification result:', userRole);
    
    if (userRole !== 'admin') {
      console.error('User is not an admin, role found:', userRole);
      return { 
        isAdmin: false, 
        error: {
          message: 'You do not have administrator privileges',
          name: 'invalid_admin_role',
        } as AuthError 
      };
    }
    
    console.log('Admin role verified successfully');
    return { isAdmin: true, error: null };
  } catch (err) {
    console.error('Error verifying admin role:', err);
    return { isAdmin: false, error: err as AuthError };
  }
};
