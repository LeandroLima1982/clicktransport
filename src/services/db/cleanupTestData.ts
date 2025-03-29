
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Cleans up all test data from the database
 */
export const cleanupAllTestData = async () => {
  try {
    console.log('Starting comprehensive cleanup of all test data...');
    
    // Delete service orders first (due to foreign key constraints)
    const { error: ordersError } = await supabase
      .from('service_orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (ordersError) throw ordersError;
    console.log('Service orders deleted');
    
    // Delete bookings
    const { error: bookingsError } = await supabase
      .from('bookings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (bookingsError) throw bookingsError;
    console.log('Bookings deleted');
    
    // Clean driver locations
    const { error: locationsError } = await supabase
      .from('driver_locations')
      .delete()
      .neq('driver_id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (locationsError) throw locationsError;
    console.log('Driver locations deleted');
    
    // Delete drivers
    const { error: driversError } = await supabase
      .from('drivers')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (driversError) throw driversError;
    console.log('Drivers deleted');
    
    // Delete vehicles
    const { error: vehiclesError } = await supabase
      .from('vehicles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (vehiclesError) throw vehiclesError;
    console.log('Vehicles deleted');
    
    // Delete companies
    const { error: companiesError } = await supabase
      .from('companies')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This will delete all
    
    if (companiesError) throw companiesError;
    console.log('Companies deleted');
    
    // Make sure to not delete admin profiles
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000000');
    
    if (profilesError) {
      console.log('No test profiles to delete or unable to delete test profile');
    } else {
      console.log('Test profile deleted');
    }
    
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
