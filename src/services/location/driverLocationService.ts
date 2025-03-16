
import { supabase } from '@/integrations/supabase/client';
import { logError, logInfo } from '../monitoring/systemLogService';

interface DriverLocation {
  driver_id: string;
  order_id: string | null;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp?: string;
}

/**
 * Updates the current location of a driver
 */
export const updateDriverLocation = async (
  driverId: string,
  orderId: string | null,
  latitude: number,
  longitude: number,
  heading?: number,
  speed?: number,
  accuracy?: number
): Promise<{success: boolean, error?: any}> => {
  try {
    if (!driverId || !latitude || !longitude) {
      return { success: false, error: 'Missing required fields' };
    }

    const locationData: DriverLocation = {
      driver_id: driverId,
      order_id: orderId,
      latitude,
      longitude,
      heading,
      speed,
      accuracy,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from('driver_locations')
      .upsert(locationData, {
        onConflict: 'driver_id',
        ignoreDuplicates: false
      });

    if (error) {
      logError('Failed to update driver location', 'driver', {
        driver_id: driverId,
        error: error.message
      });
      return { success: false, error };
    }

    logInfo('Driver location updated', 'driver', {
      driver_id: driverId,
      order_id: orderId,
      coordinates: [longitude, latitude]
    });

    return { success: true };
  } catch (error) {
    logError('Exception updating driver location', 'driver', {
      driver_id: driverId,
      error
    });
    return { success: false, error };
  }
};

/**
 * Gets the current location of a driver
 */
export const getDriverLocation = async (driverId: string) => {
  try {
    const { data, error } = await supabase
      .from('driver_locations')
      .select('*')
      .eq('driver_id', driverId)
      .single();

    if (error) {
      logError('Failed to get driver location', 'driver', {
        driver_id: driverId,
        error: error.message
      });
      return { location: null, error };
    }

    return { location: data, error: null };
  } catch (error) {
    logError('Exception getting driver location', 'driver', {
      driver_id: driverId,
      error
    });
    return { location: null, error };
  }
};

/**
 * Gets all driver locations for a specific order
 */
export const getDriversForOrder = async (orderId: string) => {
  try {
    const { data, error } = await supabase
      .from('driver_locations')
      .select('*')
      .eq('order_id', orderId)
      .order('timestamp', { ascending: false });

    if (error) {
      logError('Failed to get drivers for order', 'order', {
        order_id: orderId,
        error: error.message
      });
      return { drivers: [], error };
    }

    return { drivers: data || [], error: null };
  } catch (error) {
    logError('Exception getting drivers for order', 'order', {
      order_id: orderId,
      error
    });
    return { drivers: [], error };
  }
};

/**
 * Subscribes to location updates for a specific driver
 */
export const subscribeToDriverLocation = (
  driverId: string, 
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel('driver_location_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'driver_locations',
        filter: `driver_id=eq.${driverId}`
      },
      callback
    )
    .subscribe();

  return channel;
};

/**
 * Subscribes to location updates for a specific order
 */
export const subscribeToOrderDrivers = (
  orderId: string,
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel('order_drivers_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'driver_locations',
        filter: `order_id=eq.${orderId}`
      },
      callback
    )
    .subscribe();

  return channel;
};
