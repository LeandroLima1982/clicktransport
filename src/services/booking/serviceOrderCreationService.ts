
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { ServiceOrderInput } from '@/types/serviceOrderInput';
import { logInfo } from '../monitoring/systemLogService';

/**
 * Create a service order from a booking
 */
export const createServiceOrderFromBooking = async (booking: Booking) => {
  try {
    const { data: existingOrders } = await supabase
      .from('service_orders')
      .select('id')
      .eq('booking_id', booking.id);
      
    if (existingOrders && existingOrders.length > 0) {
      return { 
        serviceOrder: existingOrders[0], 
        error: new Error('Service order already exists for this booking') 
      };
    }
    
    // Create a service order input with explicitly typed status
    const serviceOrderData: ServiceOrderInput = {
      booking_id: booking.id,
      company_id: booking.company_id || '',
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date || booking.booking_date,
      status: 'pending', // Using the ServiceOrderStatus type
      notes: booking.additional_notes || null,
      passenger_data: booking.passenger_data || null
    };
    
    const { data, error } = await supabase
      .from('service_orders')
      .insert([serviceOrderData])
      .select()
      .single();
      
    if (error) throw error;
    
    logInfo('Service order created from booking', 'service_order', {
      service_order_id: data.id,
      booking_id: booking.id,
      reference: booking.reference_code
    });
    
    return { serviceOrder: data, error: null };
  } catch (error) {
    console.error('Error creating service order from booking:', error);
    return { serviceOrder: null, error };
  }
};
