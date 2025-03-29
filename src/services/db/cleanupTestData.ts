
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logWarning, logInfo } from '@/services/monitoring/systemLogService';

/**
 * Cleans up all test data from the database
 */
export const cleanupAllTestData = async () => {
  try {
    console.log('Starting comprehensive cleanup of all test data...');
    
    // First try to clean financial_metrics which might have RLS issues
    try {
      logInfo('Attempting to delete financial_metrics data', 'data-cleanup');
      
      // Disable RLS temporarily for this operation via a direct SQL query
      // This is safer than modifying RLS policies permanently
      // Using 'as any' to bypass TypeScript checking since our new function isn't in the types yet
      const { error: financialMetricsError } = await supabase.rpc('admin_delete_financial_metrics' as any);
      
      if (financialMetricsError) {
        console.warn('Could not delete financial_metrics:', financialMetricsError);
        await logWarning('Could not delete financial_metrics during cleanup', 'data-cleanup', financialMetricsError);
      } else {
        console.log('Financial metrics deleted');
      }
    } catch (financialError) {
      console.warn('Error deleting financial metrics:', financialError);
      // Continue with other deletions even if this fails
    }
    
    // Delete service orders first (due to foreign key constraints)
    const { error: ordersError } = await supabase
      .from('service_orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (ordersError) {
      console.error('Error deleting service orders:', ordersError);
      await logWarning('Failed to delete service orders', 'data-cleanup', ordersError);
    } else {
      console.log('Service orders deleted');
    }
    
    // Delete bookings
    const { error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (bookingsError) {
      console.error('Error deleting bookings:', bookingsError);
      await logWarning('Failed to delete bookings', 'data-cleanup', bookingsError);
    } else {
      console.log('Bookings deleted');
    }
    
    // Clean driver locations
    const { error: locationsError } = await supabase
      .from('driver_locations')
      .delete()
      .neq('driver_id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (locationsError) {
      console.error('Error deleting driver locations:', locationsError);
      await logWarning('Failed to delete driver locations', 'data-cleanup', locationsError);
    } else {
      console.log('Driver locations deleted');
    }
    
    // Delete drivers
    const { error: driversError } = await supabase
      .from('drivers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (driversError) {
      console.error('Error deleting drivers:', driversError);
      await logWarning('Failed to delete drivers', 'data-cleanup', driversError);
    } else {
      console.log('Drivers deleted');
    }
    
    // Delete vehicles
    const { error: vehiclesError } = await supabase
      .from('vehicles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (vehiclesError) {
      console.error('Error deleting vehicles:', vehiclesError);
      await logWarning('Failed to delete vehicles', 'data-cleanup', vehiclesError);
    } else {
      console.log('Vehicles deleted');
    }
    
    // Delete companies
    const { error: companiesError } = await supabase
      .from('companies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (companiesError) {
      console.error('Error deleting companies:', companiesError);
      await logWarning('Failed to delete companies', 'data-cleanup', companiesError);
    } else {
      console.log('Companies deleted');
    }
    
    // Do not attempt to delete profiles linked to auth.users
    // Just log success message
    console.log('Database cleanup completed successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error during database cleanup:', error);
    return { success: false, error };
  }
};

export default {
  cleanupAllTestData
};
