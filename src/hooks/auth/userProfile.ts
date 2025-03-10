
import { supabase } from '../../main';
import { UserRole } from './types';

// Function to fetch user role from profiles table
export const fetchUserRole = async (userId: string): Promise<UserRole> => {
  try {
    console.log('Fetching user role for ID:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    if (data?.role) {
      console.log('User role found:', data.role);
      return data.role as UserRole;
    }
    
    console.log('No role found for user, returning null');
    return null;
  } catch (err) {
    console.error('Exception while fetching user role:', err);
    return null;
  }
};
