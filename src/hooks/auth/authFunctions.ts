
import { AuthError } from '@supabase/supabase-js';
import { supabase } from '../../main';
import { toast } from 'sonner';

// Sign in with email and password
export const signIn = async (email: string, password: string, companyId?: string) => {
  try {
    console.log('Signing in user:', email);
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
    
    // If company ID is provided for driver login, verify the association
    if (companyId && result.data.user) {
      // First, check user role from profiles
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
      
      // For driver role, verify driver-company association
      if (userRole === 'driver') {
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('user_id', result.data.user.id)
          .eq('company_id', companyId)
          .single();
        
        if (driverError || !driverData) {
          console.error('Driver not associated with this company:', driverError || 'No driver record found');
          // Sign out the user since they're not associated with the company
          await supabase.auth.signOut();
          
          return { 
            error: {
              message: 'You are not registered as a driver for this company',
              name: 'invalid_company_association',
            } as AuthError 
          };
        }
        
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

// Enhanced Sign out with better feedback and error handling
export const signOut = async () => {
  console.log('Attempting to sign out user');
  
  try {
    // Clear any local storage or session storage if needed
    // localStorage.removeItem('yourAuthItem');
    
    // Perform the actual sign out
    const result = await supabase.auth.signOut();
    
    if (result.error) {
      console.error('Error signing out from Supabase:', result.error);
      throw result.error;
    }
    
    console.log('User signed out successfully from Supabase');
    return { error: null };
  } catch (err) {
    console.error('Exception during sign out:', err);
    return { error: err as AuthError | Error };
  }
};

// Reset password
export const resetPassword = async (email: string) => {
  try {
    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (!result.error) {
      toast.success('Password reset email sent', {
        description: 'Please check your email to reset your password.'
      });
    }
    
    return { error: result.error };
  } catch (err) {
    console.error('Error resetting password:', err);
    return { error: err as AuthError };
  }
};

// Fetch companies for driver login
export const fetchCompanies = async () => {
  try {
    console.log('Fetching companies from Supabase...');
    
    // Get all companies regardless of status
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .order('name');
    
    if (error) {
      console.error('Error fetching companies from database:', error);
      return { data: null, error };
    }
    
    console.log(`Successfully fetched ${data?.length || 0} companies:`, data);
    
    if (!data || data.length === 0) {
      console.warn('No companies found in the database');
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception occurred while fetching companies:', err);
    return { data: null, error: err as Error };
  }
};
