
import { supabase } from '../../../../integrations/supabase/client';
import { AuthError } from '@supabase/supabase-js';

// Check user role and handle role verification
export const verifyUserRole = async (userId: string) => {
  try {
    if (!userId) {
      console.error('No user ID provided for role verification');
      return { role: null, error: null };
    }
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { 
        role: null, 
        error: {
          message: 'Error fetching user profile',
          name: 'profile_fetch_error',
        } as AuthError 
      };
    }
    
    const userRole = profileData?.role;
    console.log('User role verification:', userRole);
    
    return { role: userRole, error: null };
  } catch (err) {
    console.error('Error verifying user role:', err);
    return { role: null, error: err as AuthError };
  }
};
