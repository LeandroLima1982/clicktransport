
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
    
    // Check if service order already exists for this booking
    const { data: existingOrders } = await supabase
      .from('service_orders')
      .select('id')
      .eq('id', booking.id); // Use booking ID directly since booking_id column doesn't exist
      
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
    
    // Create a service order input with the booking ID as the service order ID to maintain the relation
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
    
    // Modified approach: Instead of using booking_id as a column, we'll use the id directly
    // This is because the database schema doesn't have a booking_id column
    const { data, error } = await supabase
      .from('service_orders')
      .insert([{
        company_id: serviceOrderData.company_id,
        origin: serviceOrderData.origin,
        destination: serviceOrderData.destination,
        pickup_date: serviceOrderData.pickup_date,
        status: serviceOrderData.status,
        notes: serviceOrderData.notes,
        passenger_data: serviceOrderData.passenger_data
      }])
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
    
    // Update the booking to mark that a service order has been created
    try {
      await supabase
        .from('bookings')
        .update({ has_service_order: true })
        .eq('id', booking.id);
    } catch (updateError) {
      console.warn('Could not update booking with service order status:', updateError);
    }
    
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

/**
 * Create a service order manually for admin panel
 */
export const createManualServiceOrder = async (booking: Booking) => {
  try {
    console.log('Manually creating service order for booking:', booking.id);
    
    // First, ensure the booking has a company assigned
    if (!booking.company_id) {
      // Get the first available company
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'active')
        .order('queue_position', { ascending: true })
        .limit(1);
      
      if (!companies || companies.length === 0) {
        throw new Error('No active companies available to assign this booking');
      }
      
      // Update the booking with the selected company
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          company_id: companies[0].id,
          company_name: companies[0].name 
        })
        .eq('id', booking.id);
      
      if (updateError) {
        throw new Error(`Failed to assign company to booking: ${updateError.message}`);
      }
      
      // Update booking object with company info
      booking.company_id = companies[0].id;
      booking.company_name = companies[0].name;
      
      // Update company queue position
      await supabase
        .from('companies')
        .update({ 
          queue_position: supabase.sql`increment_queue_position(${companies[0].id})`,
          last_order_assigned: new Date().toISOString()
        })
        .eq('id', companies[0].id);
    }
    
    // Now create the service order
    const serviceOrderData = {
      company_id: booking.company_id,
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date || booking.booking_date,
      status: 'created', // Set as created since this is a manual operation
      notes: booking.additional_notes || `Manually created by admin for booking ${booking.reference_code}`,
      passenger_data: booking.passenger_data || null
    };
    
    const { data, error } = await supabase
      .from('service_orders')
      .insert([serviceOrderData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating manual service order:', error);
      throw error;
    }
    
    // Update the booking to mark that a service order has been created
    await supabase
      .from('bookings')
      .update({ has_service_order: true })
      .eq('id', booking.id);
    
    logInfo('Manual service order created by admin', 'service_order', {
      service_order_id: data.id,
      booking_id: booking.id,
      company_id: booking.company_id,
      reference: booking.reference_code
    });
    
    return { serviceOrder: data, error: null };
  } catch (error) {
    console.error('Error creating manual service order:', error);
    logError('Failed to create manual service order', 'service_order', {
      booking_id: booking?.id,
      error: String(error)
    });
    return { serviceOrder: null, error };
  }
};
