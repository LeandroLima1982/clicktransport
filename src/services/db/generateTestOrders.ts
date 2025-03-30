
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
 * This version uses an existing profile ID instead of a random UUID
 */
export const generateSampleBookingAndOrder = async () => {
  try {
    // Create booking with random data
    const bookingReference = `BK-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Check if we have at least one company configured in the system
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id')
      .eq('status', 'active')
      .limit(1);
    
    if (companiesError) {
      console.error('Error checking for companies:', companiesError);
      throw new Error('Não foi possível verificar se existem empresas configuradas. Configure o ambiente de teste primeiro.');
    }
    
    if (!companies || companies.length === 0) {
      throw new Error('Nenhuma empresa ativa encontrada. Execute "Configurar Ambiente de Teste" primeiro.');
    }
    
    // Get an existing profile ID instead of generating a random UUID
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw new Error('Não foi possível encontrar perfis de usuário. Execute "Configurar Ambiente de Teste" primeiro.');
    }
    
    if (!profiles || profiles.length === 0) {
      throw new Error('Nenhum perfil de usuário encontrado. Execute "Configurar Ambiente de Teste" primeiro ou crie um usuário manualmente.');
    }
    
    // Use an existing profile ID
    const existingUserId = profiles[0].id;
    console.log('Using existing user ID for test booking:', existingUserId);
    
    try {
      // Create the booking with an existing user ID
      const bookingData = {
        reference_code: bookingReference,
        status: 'confirmed' as const,
        origin: 'Aeroporto Santos Dumont, Rio de Janeiro',
        destination: 'Ipanema Beach, Rio de Janeiro',
        travel_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
        booking_date: new Date().toISOString(),
        total_price: 120.00,
        passengers: 2,
        user_id: existingUserId,
        additional_notes: 'Reserva de teste criada para demonstração'
      };
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
      
      if (bookingError) {
        if (bookingError.message.includes('violates foreign key constraint')) {
          throw new Error('Erro de chave estrangeira: Execute "Configurar Ambiente de Teste" primeiro para configurar o ambiente corretamente.');
        }
        throw bookingError;
      }
      
      toast.success('Reserva de teste criada', { duration: 2000 });
      
      // Try to create service order
      try {
        const { serviceOrder, error: orderError } = await createServiceOrderFromBooking(booking as Booking);
        
        if (orderError) {
          console.error('Error creating service order:', orderError);
          toast.warning('Reserva criada, mas não foi possível criar a ordem de serviço', {
            description: 'Restrições de permissão. Configure o ambiente de teste primeiro.'
          });
          return { success: true, booking, serviceOrder: null, error: orderError };
        }
        
        toast.success('Ordem de serviço de teste criada', { 
          description: 'A ordem foi atribuída automaticamente à empresa conforme a fila',
          duration: 3000 
        });
        
        return { success: true, booking, serviceOrder, error: null };
      } catch (orderError) {
        console.error('Error creating service order:', orderError);
        toast.warning('Reserva criada, mas não foi possível criar a ordem de serviço', {
          description: 'Erro ao criar ordem de serviço: ' + 
            (orderError instanceof Error ? orderError.message : 'Erro desconhecido')
        });
        return { success: true, booking, serviceOrder: null, error: orderError };
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, booking: null, serviceOrder: null, error };
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
        if (orderError.message.includes('violates row-level security policy')) {
          throw new Error('Violação de política de segurança: Configure o ambiente de teste primeiro para definir as permissões necessárias');
        }
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
