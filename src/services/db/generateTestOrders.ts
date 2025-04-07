
import { supabase } from '@/integrations/supabase/client';
import { createManualServiceOrder as createManualOrder } from '@/services/booking/serviceOrderCreationService';
import { Booking } from '@/types/booking';

// Add proper function exports
export const generateSampleBookingAndOrder = async () => {
  try {
    // Create a sample booking
    const bookingRef = 'TST-' + Math.floor(100000 + Math.random() * 900000);
    
    // Create a test booking payload
    const bookingData = {
      reference_code: bookingRef,
      origin: 'Aeroporto Internacional de Guarulhos',
      destination: 'Centro de São Paulo',
      booking_date: new Date().toISOString(),
      travel_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: 'confirmed' as const,
      passengers: 2,
      client_name: 'Cliente de Teste',
      client_email: 'test@example.com',
      client_phone: '+5511999999999',
      total_price: 150.0,
      user_id: '00000000-0000-0000-0000-000000000001', // Default test user ID
      has_service_order: false
    };
    
    // Insert the booking
    const { data: bookingResult, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating test booking:', error);
      return { success: false, error, booking: null, serviceOrder: null };
    }
    
    if (!bookingResult) {
      return { success: false, error: new Error('No booking data returned'), booking: null, serviceOrder: null };
    }
    
    const booking = bookingResult as Booking;
    
    // Try to create a service order
    try {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'active')
        .order('queue_position', { ascending: true })
        .limit(1);
        
      if (!companies || companies.length === 0) {
        return { 
          success: true, 
          booking, 
          serviceOrder: null,
          error: new Error('No active companies available to create service order')
        };
      }
      
      // Add company to booking
      await supabase
        .from('bookings')
        .update({ 
          company_id: companies[0].id,
          company_name: companies[0].name, 
          has_service_order: true 
        } as any)
        .eq('id', booking.id);
        
      // Get updated booking
      const { data: updatedBooking } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', booking.id)
        .single();
        
      if (!updatedBooking) {
        return { 
          success: true, 
          booking, 
          serviceOrder: null,
          error: new Error('Failed to update booking with company')
        };
      }
      
      // Create a service order
      const { serviceOrder, error: serviceOrderError } = await createManualOrder(updatedBooking as Booking);
      
      if (serviceOrderError) {
        return { 
          success: true, 
          booking: updatedBooking, 
          serviceOrder: null,
          error: serviceOrderError
        };
      }
      
      return { 
        success: true, 
        booking: updatedBooking, 
        serviceOrder,
        error: null
      };
    } catch (serviceError) {
      console.error('Error creating service order:', serviceError);
      return { 
        success: true, 
        booking, 
        serviceOrder: null,
        error: serviceError instanceof Error ? serviceError : new Error(String(serviceError))
      };
    }
  } catch (error) {
    console.error('Error in generateSampleBookingAndOrder:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error)),
      booking: null, 
      serviceOrder: null 
    };
  }
};

// Re-export the createManualServiceOrder function from the serviceOrderCreationService
export { createManualOrder as createManualServiceOrder };
