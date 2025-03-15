
import { supabase } from '../../main';
import { UserRole } from './types';

// Function to fetch user role from profiles table with timeout
export const fetchUserRole = async (userId: string): Promise<UserRole> => {
  try {
    if (!userId) {
      console.log('No user ID provided for role fetch');
      return null;
    }
    
    console.log('Fetching user role for ID:', userId);
    
    // Create a promise that rejects after 5 seconds
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout fetching user role')), 5000);
    });
    
    // Create the actual query
    const fetchPromise = supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    // Race the fetch against the timeout
    const { data, error } = await Promise.race([
      fetchPromise,
      timeoutPromise.then(() => {
        throw new Error('Timeout fetching user role');
      })
    ]);
    
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
