
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { ServiceOrderInput } from '@/types/serviceOrderInput';
import { logInfo, logError } from '../monitoring/systemLogService';

/**
 * Create a service order from a booking
 */
export const createServiceOrderFromBooking = async (booking: Booking) => {
  try {
    console.log('Creating service order for booking:', booking.id, 'with company:', booking.company_id);
    
    const { data: existingOrders } = await supabase
      .from('service_orders')
      .select('id')
      .eq('booking_id', booking.id);
      
    if (existingOrders && existingOrders.length > 0) {
      console.log('Service order already exists for booking:', booking.id);
      return { 
        serviceOrder: existingOrders[0], 
        error: new Error('Service order already exists for this booking') 
      };
    }
    
    // Make sure we have a company_id to assign the order to
    if (!booking.company_id) {
      console.error('Cannot create service order: missing company_id in booking', booking);
      return {
        serviceOrder: null,
        error: new Error('No company assigned to this booking')
      };
    }
    
    // Create a service order input with explicitly typed status
    const serviceOrderData: ServiceOrderInput = {
      booking_id: booking.id,
      company_id: booking.company_id,
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date || booking.booking_date,
      status: 'pending', // Using the ServiceOrderStatus type
      notes: booking.additional_notes || null,
      passenger_data: booking.passenger_data || null
    };
    
    console.log('Creating service order with data:', serviceOrderData);
    
    const { data, error } = await supabase
      .from('service_orders')
      .insert([serviceOrderData])
      .select()
      .single();
      
    if (error) {
      console.error('Supabase error creating service order:', error);
      throw error;
    }
    
    if (!data) {
      console.error('No data returned after creating service order');
      throw new Error('Failed to create service order: no data returned');
    }
    
    console.log('Successfully created service order:', data.id);
    
    logInfo('Service order created from booking', 'service_order', {
      service_order_id: data.id,
      booking_id: booking.id,
      company_id: booking.company_id,
      reference: booking.reference_code
    });
    
    return { serviceOrder: data, error: null };
  } catch (error) {
    console.error('Error creating service order from booking:', error);
    logError('Failed to create service order from booking', 'service_order', {
      booking_id: booking?.id,
      error: String(error)
    });
    return { serviceOrder: null, error };
  }
};
