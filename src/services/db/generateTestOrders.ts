
import { supabase } from '@/integrations/supabase/client';
import { createServiceOrderFromBooking } from '../booking/serviceOrderService';
import { logInfo } from '../monitoring/systemLogService';
import { toast } from 'sonner';
import { Booking } from '@/types/booking';

/**
 * Creates a test service order from a booking
 */
export const createTestServiceOrder = async (booking?: Booking) => {
  try {
    // If no booking is provided, fetch the most recent one
    if (!booking) {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error) throw error;
      booking = data as Booking;
    }
    
    logInfo('Creating test service order from booking', 'order', {
      booking_id: booking.id,
      booking_reference: booking.reference_code
    });
    
    const { serviceOrder, error } = await createServiceOrderFromBooking(booking);
    
    if (error) {
      throw error;
    }
    
    return { success: true, serviceOrder, error: null };
  } catch (error) {
    console.error('Error creating test service order:', error);
    return { success: false, serviceOrder: null, error };
  }
};

/**
 * Generate a sample booking and service order for testing
 */
export const generateSampleBookingAndOrder = async () => {
  try {
    // Create booking with a static test user ID that exists in the profiles table
    // This is for testing purposes only
    const bookingData = {
      reference_code: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'confirmed' as const,
      origin: 'Aeroporto Santos Dumont, Rio de Janeiro',
      destination: 'Ipanema Beach, Rio de Janeiro',
      travel_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      booking_date: new Date().toISOString(),
      total_price: 120.00,
      passengers: 1,
      user_id: '00000000-0000-0000-0000-000000000000', // This is a placeholder user ID that should exist in your test environment
      additional_notes: 'Cliente precisa de espaço para bagagem extra'
    };
    
    // Check if the test user exists, if not create it
    const { data: userExists, error: userCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', bookingData.user_id)
      .single();
      
    if (userCheckError || !userExists) {
      // Create a test user profile if it doesn't exist
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: bookingData.user_id,
          full_name: 'Test User',
          email: 'test@example.com',
          role: 'client'
        });
        
      if (createProfileError) {
        console.error('Error creating test profile:', createProfileError);
        // If we cannot create a profile, we'll try to find any existing profile to use
        const { data: anyProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
          .single();
          
        if (profileError || !anyProfile) {
          throw new Error('No valid user profile found and unable to create one. Please set up test environment first.');
        }
        
        // Use this profile instead
        bookingData.user_id = anyProfile.id;
      }
    }
    
    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    
    if (bookingError) throw bookingError;
    
    toast.success('Reserva de teste criada', { duration: 2000 });
    
    // Create service order from the booking
    const { serviceOrder, error: orderError } = await createServiceOrderFromBooking(booking as Booking);
    
    if (orderError) throw orderError;
    
    toast.success('Ordem de serviço de teste criada', { 
      description: 'A ordem foi atribuída automaticamente à empresa conforme a fila',
      duration: 3000 
    });
    
    return { success: true, booking, serviceOrder, error: null };
  } catch (error) {
    console.error('Error generating sample booking and order:', error);
    toast.error('Erro ao gerar reserva e ordem de teste', {
      description: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    return { success: false, booking: null, serviceOrder: null, error };
  }
};

/**
 * Creates a manual service order (not from a booking)
 */
export const createManualServiceOrder = async (companyId?: string) => {
  try {
    // If no company ID is provided, fetch the first active company
    if (!companyId) {
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .eq('status', 'active')
        .order('queue_position', { ascending: true })
        .limit(1);
      
      if (companiesError) throw companiesError;
      
      if (!companies || companies.length === 0) {
        throw new Error('No active companies available');
      }
      
      companyId = companies[0].id;
    }
    
    // Create a manual service order
    const orderData = {
      company_id: companyId,
      origin: 'Centro do Rio de Janeiro',
      destination: 'Maracanã, Rio de Janeiro',
      pickup_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 3 days from now
      status: 'pending' as const,
      notes: 'Ordem de serviço de teste criada manualmente',
    };
    
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .insert(orderData)
      .select()
      .single();
    
    if (orderError) throw orderError;
    
    toast.success('Ordem de serviço manual criada com sucesso', { duration: 3000 });
    
    return { success: true, serviceOrder: order, error: null };
  } catch (error) {
    console.error('Error creating manual service order:', error);
    toast.error('Erro ao criar ordem de serviço manual', {
      description: error instanceof Error ? error.message : 'Erro desconhecido'
    });
    return { success: false, serviceOrder: null, error };
  }
};

export default {
  createTestServiceOrder,
  generateSampleBookingAndOrder,
  createManualServiceOrder
};
