
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logWarning, logInfo, logError } from '@/services/monitoring/systemLogService';

/**
 * Cleans up all test data from the database
 */
export const cleanupAllTestData = async () => {
  try {
    console.log('Starting comprehensive cleanup of all test data...');
    logInfo('Starting deep cleanup of all test data', 'data-cleanup');
    
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
    
    try {
      // Delete in proper order to handle foreign key constraints
      
      // First delete driver_locations as they reference drivers
      const { error: locationsError } = await supabase
        .from('driver_locations')
        .delete()
        .is('driver_id', null)
        .or('driver_id.neq.00000000-0000-0000-0000-000000000000');
      
      if (locationsError) {
        console.error('Error deleting driver locations:', locationsError);
        await logWarning('Failed to delete driver locations', 'data-cleanup', locationsError);
      } else {
        console.log('Driver locations deleted');
      }
      
      // Delete driver ratings
      const { error: ratingsError } = await supabase
        .from('driver_ratings')
        .delete()
        .is('driver_id', null)
        .or('driver_id.neq.00000000-0000-0000-0000-000000000000');
      
      if (ratingsError) {
        console.error('Error deleting driver ratings:', ratingsError);
        await logWarning('Failed to delete driver ratings', 'data-cleanup', ratingsError);
      } else {
        console.log('Driver ratings deleted');
      }
      
      // Delete service orders (they have driver_id foreign keys)
      const { error: ordersError } = await supabase
        .from('service_orders')
        .delete()
        .is('id', null)
        .or('id.neq.00000000-0000-0000-0000-000000000000');
      
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
        .is('id', null)
        .or('id.neq.00000000-0000-0000-0000-000000000000');
      
      if (bookingsError) {
        console.error('Error deleting bookings:', bookingsError);
        await logWarning('Failed to delete bookings', 'data-cleanup', bookingsError);
      } else {
        console.log('Bookings deleted');
      }
      
      // Delete drivers (must delete after orders that reference them)
      const { error: driversError } = await supabase
        .from('drivers')
        .delete()
        .is('id', null)
        .or('id.neq.00000000-0000-0000-0000-000000000000');
      
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
        .is('id', null)
        .or('id.neq.00000000-0000-0000-0000-000000000000');
      
      if (vehiclesError) {
        console.error('Error deleting vehicles:', vehiclesError);
        await logWarning('Failed to delete vehicles', 'data-cleanup', vehiclesError);
      } else {
        console.log('Vehicles deleted');
      }
      
      // Delete companies last (after drivers and vehicles that reference them)
      const { error: companiesError } = await supabase
        .from('companies')
        .delete()
        .is('id', null)
        .or('id.neq.00000000-0000-0000-0000-000000000000');
      
      if (companiesError) {
        console.error('Error deleting companies:', companiesError);
        await logWarning('Failed to delete companies', 'data-cleanup', companiesError);
      } else {
        console.log('Companies deleted');
      }
    } catch (error) {
      console.error('Error during specific table cleanup:', error);
      await logWarning('Database cleanup encountered errors', 'data-cleanup', error);
      return { success: false, error };
    }
    
    // Do not attempt to delete profiles linked to auth.users
    // Just log success message
    console.log('Database cleanup completed successfully');
    toast.success('Dados de teste removidos com sucesso');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error during database cleanup:', error);
    toast.error('Erro ao limpar dados de teste', { 
      description: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    return { success: false, error };
  }
};

export default {
  cleanupAllTestData
};
