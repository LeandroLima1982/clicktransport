
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../integrations/supabase/client';
import { toast } from 'sonner';

// Sign up with email and password
export const signUp = async (email: string, password: string, userData?: any) => {
  try {
    console.log('Signing up user:', email);
    // Always default to client role if not specified - this prevents accidental registration as driver
    const userRole = userData?.accountType || 'client'; 
    
    console.log('User role for registration:', userRole);
    
    // Ensure 'driver' role is not allowed in public registration
    if (userRole === 'driver') {
      toast.error('Driver registration is only available through the company panel');
      return { 
        error: {
          message: 'Driver registration is not allowed here',
          name: 'registration_not_allowed'
        } as AuthError 
      };
    }
    
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email: email,
          role: userRole,
          full_name: userData?.firstName && userData?.lastName 
            ? `${userData.firstName} ${userData.lastName}` 
            : ''
        }
      }
    });
    
    if (result.error) {
      toast.error('Error creating account', {
        description: result.error.message
      });
      return { error: result.error };
    }
    
    console.log('Sign up result:', result);
    
    // Create company record if user is signing up as company
    if (userRole === 'company' && result.data.user) {
      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          user_id: result.data.user.id,
          name: userData.companyName || '',
        });
        
      if (companyError) {
        console.error('Error creating company record:', companyError);
      }
    }
    
    // Driver creation is now handled only through the company panel
    
    return { error: null };
  } catch (err) {
    console.error('Error creating account:', err);
    return { error: err as AuthError };
  }
};
