
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { logError } from '../monitoring/systemLogService';

/**
 * Get all bookings for a user
 */
export const getUserBookings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, service_orders:service_orders(id, status, driver_id, origin, destination)')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });
    
    if (error) throw error;
    
    return { bookings: data || [], error: null };
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return { bookings: [], error };
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, service_orders:service_orders(id, status, driver_id, origin, destination, pickup_date, delivery_date, driver:drivers(id, name, phone), passenger_data)')
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    
    const bookingWithServiceOrderFlag = {
      ...data,
      has_service_order: data.service_orders && data.service_orders.length > 0
    };
    
    return { booking: bookingWithServiceOrderFlag, error: null };
  } catch (error) {
    console.error('Error getting booking by ID:', error);
    return { booking: null, error };
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    
    try {
      const { data: serviceOrders } = await supabase
        .from('service_orders')
        .select('id')
        .eq('booking_id', bookingId);
        
      if (serviceOrders && serviceOrders.length > 0) {
        const orderIds = serviceOrders.map(order => order.id);
        
        // Import from the new file to avoid circular dependencies
        const { updateOrderStatus } = await import('./serviceOrderStatusService');
        
        for (const orderId of orderIds) {
          await updateOrderStatus(orderId, 'cancelled');
        }
      }
    } catch (serviceOrderError) {
      console.error('Error cancelling associated service orders:', serviceOrderError);
    }
    
    return { success: true, booking: data, error: null };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, booking: null, error };
  }
};
