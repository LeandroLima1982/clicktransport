
import { supabase } from '@/integrations/supabase/client';
import { Booking, BookingStatus } from '@/types/booking';
import { logError, logInfo } from '../monitoring/systemLogService';

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
 * Create a new booking
 */
export const createBooking = async (bookingData: Partial<Booking>): Promise<{ data: Booking | null; error: Error | null }> => {
  try {
    // Make sure required fields are present to satisfy TypeScript
    const requiredBookingData = {
      booking_date: bookingData.booking_date || new Date().toISOString(),
      reference_code: bookingData.reference_code || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      origin: bookingData.origin || '',
      destination: bookingData.destination || '',
      travel_date: bookingData.travel_date || new Date().toISOString(),
      status: bookingData.status || ('pending' as BookingStatus),
      total_price: bookingData.total_price || 0,
      passengers: bookingData.passengers || 1,
      user_id: bookingData.user_id || null,
      ...bookingData
    };
    
    // Use explicit typing to avoid excessive type instantiation
    const { data, error: supabaseError } = await supabase
      .from('bookings')
      .insert([requiredBookingData as any]) // Use 'any' to bypass excessive type checking
      .select()
      .single();
      
    if (supabaseError) {
      console.error('Error creating booking:', supabaseError);
      return { data: null, error: new Error(supabaseError.message) };
    }
    
    return { data: data as Booking, error: null };
  } catch (error) {
    console.error('Error in createBooking:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error in createBooking') };
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

/**
 * Ensure a booking has a company assigned 
 */
export const ensureBookingHasCompany = async (bookingId: string) => {
  try {
    // Check if booking already has a company
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, company_id, company_name')
      .eq('id', bookingId)
      .single();
      
    if (bookingError) throw bookingError;
    
    if (booking.company_id) {
      console.log('Booking already has company assigned:', booking.company_id);
      return { updated: false, booking, error: null };
    }
    
    // Get next company in queue
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('status', 'active')
      .order('queue_position', { ascending: true })
      .limit(1);
      
    if (companiesError) throw companiesError;
    
    if (!companies || companies.length === 0) {
      return { updated: false, booking, error: new Error('No active companies available') };
    }
    
    const company = companies[0];
    
    // Update booking with company
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ 
        company_id: company.id, 
        company_name: company.name 
      })
      .eq('id', bookingId)
      .select()
      .single();
      
    if (updateError) throw updateError;
    
    // Update company queue position
    const { data: maxPosition } = await supabase
      .from('companies')
      .select('queue_position')
      .order('queue_position', { ascending: false })
      .limit(1)
      .single();
      
    const newPosition = (maxPosition?.queue_position || 0) + 1;
    
    await supabase
      .from('companies')
      .update({ 
        queue_position: newPosition,
        last_order_assigned: new Date().toISOString()
      })
      .eq('id', company.id);
    
    return { updated: true, booking: updatedBooking, error: null };
  } catch (error) {
    console.error('Error ensuring booking has company:', error);
    return { updated: false, booking: null, error };
  }
};
