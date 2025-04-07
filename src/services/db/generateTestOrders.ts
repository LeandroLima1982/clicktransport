
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';

/**
 * Generate a sample booking and service order for testing
 */
export async function generateSampleBookingAndOrder() {
  try {
    // Generate a sample booking
    const booking = {
      reference_code: `TEST-${Math.floor(Math.random() * 1000000)}`,
      booking_date: new Date().toISOString(),
      origin: 'Test Origin Address',
      destination: 'Test Destination Address',
      travel_date: new Date().toISOString(),
      status: 'confirmed',
      total_price: 120.00,
      passengers: 2,
      user_id: null, // Test booking doesn't need a user
      client_name: 'Test Client',
      client_email: 'test@example.com',
      client_phone: '5511999999999',
    };
    
    // Insert the booking - Fix by passing single object instead of array
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert(booking) // Remove the array brackets
      .select()
      .single();
    
    if (bookingError) {
      console.error('Error creating test booking:', bookingError);
      return { error: bookingError };
    }
    
    // Create a service order for the booking
    // Include company_id which is required by the DB schema
    const serviceOrder = {
      booking_id: bookingData.id,
      status: 'created',
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date,
      delivery_date: null,
      created_at: new Date().toISOString(),
      company_id: bookingData.company_id || '00000000-0000-0000-0000-000000000000' // Default UUID if needed
    };
    
    // Fix by passing single object instead of array
    const { data: serviceOrderData, error: serviceOrderError } = await supabase
      .from('service_orders')
      .insert(serviceOrder) // Remove the array brackets
      .select()
      .single();
    
    if (serviceOrderError) {
      console.error('Error creating test service order:', serviceOrderError);
      return { booking: bookingData, error: serviceOrderError };
    }
    
    return { 
      booking: bookingData, 
      serviceOrder: serviceOrderData, 
      error: null 
    };
  } catch (error) {
    console.error('Error in generateSampleBookingAndOrder:', error);
    return { 
      error: error instanceof Error ? error : new Error('Unknown error in generateSampleBookingAndOrder') 
    };
  }
}

/**
 * Create a manual service order for testing
 */
export async function createManualServiceOrder(bookingId: string) {
  try {
    // Get the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (bookingError) {
      return { error: bookingError };
    }
    
    // Create service order with company_id included
    const serviceOrder = {
      booking_id: bookingId,
      status: 'created',
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date,
      delivery_date: null,
      created_at: new Date().toISOString(),
      company_id: booking.company_id || '00000000-0000-0000-0000-000000000000' // Default UUID if needed
    };
    
    // Fix by passing single object instead of array
    const { data: serviceOrderData, error: serviceOrderError } = await supabase
      .from('service_orders')
      .insert(serviceOrder) // Remove the array brackets
      .select()
      .single();
    
    if (serviceOrderError) {
      return { error: serviceOrderError };
    }
    
    return { serviceOrder: serviceOrderData, error: null };
  } catch (error) {
    console.error('Error in createManualServiceOrder:', error);
    return { 
      error: error instanceof Error ? error : new Error('Unknown error in createManualServiceOrder') 
    };
  }
}
