
import { supabase } from '@/integrations/supabase/client';
import { createServiceOrderFromBooking } from '../booking/serviceOrderService';
import { logInfo, logError } from '../monitoring/systemLogService';
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
    // Create booking with an auto-generated user ID instead of a fixed one
    // We'll create a random ID for test purposes that won't conflict with foreign key constraints
    const testUserId = crypto.randomUUID();
    
    const bookingData = {
      reference_code: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'confirmed' as const,
      origin: 'Aeroporto Santos Dumont, Rio de Janeiro',
      destination: 'Ipanema Beach, Rio de Janeiro',
      travel_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      booking_date: new Date().toISOString(),
      total_price: 120.00,
      passengers: 1,
      user_id: testUserId, // Use a random UUID instead of a fixed one
      additional_notes: 'Cliente precisa de espaço para bagagem extra'
    };
    
    // Create a test profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        full_name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        role: 'client'
      });
      
    if (profileError) {
      console.error('Error creating test profile:', profileError);
      toast.error('Erro ao criar perfil de teste', {
        description: profileError.message
      });
      return { success: false, booking: null, serviceOrder: null, error: profileError };
    }
    
    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    
    if (bookingError) {
      toast.error('Erro ao criar reserva de teste', {
        description: bookingError.message
      });
      throw bookingError;
    }
    
    toast.success('Reserva de teste criada', { duration: 2000 });
    
    // Create service order from the booking using RPC to bypass RLS
    try {
      // Direct RPC call to create service order (this would require a stored procedure in the DB)
      // For now, let's try to create the order directly but handle the error gracefully
      const { serviceOrder, error: orderError } = await createServiceOrderFromBooking(booking as Booking);
      
      if (orderError) {
        toast.warning('Reserva criada, mas não foi possível criar a ordem de serviço', {
          description: 'Você pode continuar com os testes de reserva'
        });
        console.error('Error creating service order:', orderError);
        return { success: true, booking, serviceOrder: null, error: orderError };
      }
      
      toast.success('Ordem de serviço de teste criada', { 
        description: 'A ordem foi atribuída automaticamente à empresa conforme a fila',
        duration: 3000 
      });
      
      return { success: true, booking, serviceOrder, error: null };
    } catch (orderError) {
      toast.warning('Reserva criada, mas não foi possível criar a ordem de serviço', {
        description: 'Erro ao criar ordem de serviço: ' + (orderError instanceof Error ? orderError.message : 'Erro desconhecido')
      });
      console.error('Error creating service order:', orderError);
      return { success: true, booking, serviceOrder: null, error: orderError };
    }
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
        throw new Error('Nenhuma empresa ativa disponível. Configure o ambiente de teste primeiro.');
      }
      
      companyId = companies[0].id;
    }
    
    // Create a manual service order directly (without financial metrics update)
    try {
      // Create order data
      const orderData = {
        company_id: companyId,
        origin: 'Centro do Rio de Janeiro',
        destination: 'Maracanã, Rio de Janeiro',
        pickup_date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 3 days from now
        status: 'pending' as const,
        notes: 'Ordem de serviço de teste criada manualmente',
      };
      
      // Insert order directly
      const { data: order, error: orderError } = await supabase
        .from('service_orders')
        .insert(orderData)
        .select()
        .single();
      
      if (orderError) {
        // If this fails due to RLS policy, we'll handle gracefully
        toast.error('Erro ao criar ordem manual: RLS violation', { 
          description: 'Configure o ambiente de teste primeiro para definir as permissões necessárias'
        });
        throw orderError;
      }
      
      toast.success('Ordem de serviço manual criada com sucesso', { duration: 3000 });
      return { success: true, serviceOrder: order, error: null };
    } catch (error) {
      console.error('Error creating manual service order:', error);
      return { success: false, serviceOrder: null, error };
    }
  } catch (error) {
    console.error('Error setting up manual service order:', error);
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
