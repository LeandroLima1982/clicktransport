
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logError, logInfo } from '../monitoring/systemLogService';
import { notifyBookingCreated } from '../notifications/workflowNotificationService';

/**
 * Create a new booking
 */
export const createBooking = async (bookingData: any) => {
  try {
    console.log('Creating booking with data:', bookingData);
    
    // Insert booking data
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('Booking created successfully:', booking);
    
    // Log the booking creation
    logInfo('Booking created', 'booking', {
      booking_id: booking.id,
      reference: booking.reference_code
    });
    
    // Send notification (if applicable)
    try {
      await notifyBookingCreated(booking);
    } catch (notifyError) {
      console.error('Error sending booking notification:', notifyError);
    }
    
    return { booking, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { booking: null, error };
  }
};

/**
 * Create a service order from a booking
 */
export const createServiceOrderFromBooking = async (booking: any) => {
  try {
    console.log('Creating service order from booking:', booking);
    
    // Find an available company if not specified
    let companyId = booking.company_id;
    
    if (!companyId) {
      console.log('No company ID in booking, finding available company...');
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, queue_position')
        .eq('status', 'active')
        .order('queue_position', { ascending: true })
        .limit(1);
      
      if (companiesError) throw companiesError;
      
      if (companies && companies.length > 0) {
        companyId = companies[0].id;
        console.log('Selected company based on queue:', companies[0]);
      } else {
        throw new Error('No active companies available for service order assignment');
      }
    }
    
    // Create service order
    const orderData = {
      company_id: companyId,
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date,
      status: 'created',  // Changed from 'pending' to 'created' for clarity in workflow
      notes: `Reserva: ${booking.reference_code}\n${booking.additional_notes || ''}`,
      // Add passenger data if available
      passenger_data: booking.passenger_data || null,
      // Add price information if available
      total_price: booking.total_price || null,
      // Add trip type if available
      trip_type: booking.trip_type || 'oneway'
    };
    
    console.log('Creating service order with data:', orderData);
    
    // Insert the order
    const { data: serviceOrder, error: orderError } = await supabase
      .from('service_orders')
      .insert([orderData])
      .select('*, companies(name)')
      .single();
    
    if (orderError) {
      console.error('Failed to create service order:', orderError);
      throw orderError;
    }
    
    console.log('Service order created successfully:', serviceOrder);
    
    // Update the booking with the company_id and service_order_id for reference
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        company_id: companyId,
        company_name: serviceOrder.companies?.name || 'Empresa designada' 
      })
      .eq('id', booking.id);
    
    if (updateError) {
      console.error('Error updating booking with company info:', updateError);
      // Non-critical error, log but continue
    }
    
    // Log the service order creation
    logInfo('Service order created from booking', 'booking', {
      booking_id: booking.id,
      service_order_id: serviceOrder.id,
      company_id: companyId
    });
    
    return { serviceOrder, error: null };
  } catch (error) {
    console.error('Error creating service order from booking:', error);
    logError('Failed to create service order from booking', 'booking', {
      booking_id: booking.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { serviceOrder: null, error };
  }
};

/**
 * Get all bookings for a user
 */
export const getUserBookings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { bookings: data || [], error: null };
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return { bookings: [], error };
  }
};

/**
 * Get booking details by ID
 */
export const getBookingById = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return { booking: data, error: null };
  } catch (error) {
    console.error('Error fetching booking details:', error);
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
    
    if (error) {
      throw error;
    }
    
    // Log the cancellation
    logInfo('Booking cancelled', 'booking', {
      booking_id: bookingId
    });
    
    return { booking: data, error: null };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { booking: null, error };
  }
};
