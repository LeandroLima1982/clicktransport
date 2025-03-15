
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

// Get current admin stats for dashboard
export const getAdminStats = async () => {
  try {
    // Fetch counts for different entities
    const [
      { count: companiesCount, error: companiesError },
      { count: driversCount, error: driversError },
      { count: ordersCount, error: ordersError },
      { count: vehiclesCount, error: vehiclesError }
    ] = await Promise.all([
      supabase.from('companies').select('*', { count: 'exact', head: true }),
      supabase.from('drivers').select('*', { count: 'exact', head: true }),
      supabase.from('service_orders').select('*', { count: 'exact', head: true }),
      supabase.from('vehicles').select('*', { count: 'exact', head: true })
    ]);
    
    if (companiesError || driversError || ordersError || vehiclesError) {
      console.error('Error fetching admin stats:', { 
        companiesError, driversError, ordersError, vehiclesError 
      });
      throw new Error('Failed to fetch admin statistics');
    }
    
    return {
      success: true,
      stats: {
        companies: companiesCount || 0,
        drivers: driversCount || 0,
        orders: ordersCount || 0,
        vehicles: vehiclesCount || 0
      }
    };
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    return {
      success: false,
      error,
      stats: {
        companies: 0,
        drivers: 0,
        orders: 0,
        vehicles: 0
      }
    };
  }
};

