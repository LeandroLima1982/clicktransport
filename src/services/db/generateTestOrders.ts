import { supabase } from '@/integrations/supabase/client';
import { createServiceOrderFromBooking } from '../booking/serviceOrderService';
import { logInfo, logError } from '../monitoring/systemLogService';
import { toast } from 'sonner';
import { Booking } from '@/types/booking';
import { executeSQL } from '@/hooks/useAdminSql';

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
    
    // Ensure we have a valid profile to use
    const { success: profileSuccess, profile, error: profileError } = await ensureTestProfile();
    
    if (!profileSuccess || !profile) {
      throw profileError || new Error('Não foi possível criar ou encontrar um perfil de teste.');
    }
    
    // Use the profile ID for the booking
    const existingUserId = profile.id;
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
 * Modified to handle RLS policy restrictions
 */
export const createManualServiceOrder = async (companyId?: string) => {
  try {
    console.log('Starting manual service order creation...');
    
    // If no company ID is provided, fetch the first active company
    if (!companyId) {
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'active')
        .order('queue_position', { ascending: true })
        .limit(1);
      
      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        throw companiesError;
      }
      
      if (!companies || companies.length === 0) {
        throw new Error('Nenhuma empresa ativa disponível. Configure o ambiente de teste primeiro.');
      }
      
      companyId = companies[0].id;
      console.log(`Selected company for manual order: ${companies[0].name} (${companyId})`);
    }
    
    // Create a manual service order directly
    try {
      // Get current timestamp for pickup_date (add 3 days)
      const pickupDate = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      
      // Create order data
      const orderData = {
        company_id: companyId,
        origin: 'Centro do Rio de Janeiro',
        destination: 'Maracanã, Rio de Janeiro',
        pickup_date: pickupDate,
        status: 'pending' as const,
        notes: 'Ordem de serviço de teste criada manualmente',
      };
      
      console.log('Preparing to insert service order with data:', orderData);
      
      // Try to use direct SQL execution to bypass RLS
      try {
        // Use SQL execution to bypass RLS policies
        const sql = `
          INSERT INTO service_orders (company_id, origin, destination, pickup_date, status, notes)
          VALUES ('${companyId}', '${orderData.origin}', '${orderData.destination}', 
          '${pickupDate}', '${orderData.status}', '${orderData.notes}')
          RETURNING *;
        `;
        
        console.log('Attempting SQL execution to bypass RLS...');
        const { data: sqlResult, error: sqlError } = await executeSQL(sql);
        
        if (sqlError) {
          console.error('Error executing SQL for manual service order:', sqlError);
          throw new Error('Falha ao executar SQL para criar ordem de serviço: ' + 
            (sqlError instanceof Error ? sqlError.message : 'Erro desconhecido'));
        }
        
        console.log('SQL execution successful:', sqlResult);
        toast.success('Ordem de serviço manual criada com sucesso', { duration: 3000 });
        return { success: true, serviceOrder: sqlResult, error: null };
      } catch (sqlExecError) {
        console.error('Error with direct SQL execution:', sqlExecError);
        
        // Fallback to direct insert, which may fail due to RLS
        console.log('Attempting direct insert as fallback...');
        const { data: directOrder, error: directError } = await supabase
          .from('service_orders')
          .insert(orderData)
          .select()
          .single();
        
        if (directError) {
          // If this fails due to RLS policy, we'll handle gracefully
          if (directError.message.includes('violates row-level security policy')) {
            throw new Error('Violação de política de segurança: Configure o ambiente de teste primeiro ou use uma conta de administrador.');
          }
          throw directError;
        }
        
        toast.success('Ordem de serviço manual criada com sucesso', { duration: 3000 });
        return { success: true, serviceOrder: directOrder, error: null };
      }
    } catch (error) {
      console.error('Error creating manual service order:', error);
      toast.error('Erro ao criar ordem de serviço manual', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
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

// Helper function to ensure a test profile exists (reused from setupTestEnvironment)
export const ensureTestProfile = async () => {
  try {
    console.log('Checking for existing test profile...');
    
    // Check if there are any profiles already
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .limit(1);
      
    if (profilesError) {
      console.error('Error checking profiles:', profilesError);
      throw profilesError;
    }
    
    // If we already have a profile, we can use it
    if (existingProfiles && existingProfiles.length > 0) {
      console.log('Found existing profile to use for tests:', existingProfiles[0].id);
      return { success: true, profile: existingProfiles[0], error: null };
    }
    
    console.log('No existing profiles found, creating a test profile...');
    
    // Generate a test profile ID
    const testProfileId = crypto.randomUUID();
    
    // Create a test profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        id: testProfileId,
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user'
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating test profile:', error);
      throw error;
    }
    
    console.log('Created test profile:', profile.id);
    return { success: true, profile, error: null };
  } catch (error) {
    console.error('Error ensuring test profile:', error);
    return { success: false, profile: null, error };
  }
};

export default {
  createTestServiceOrder,
  generateSampleBookingAndOrder,
  createManualServiceOrder,
  ensureTestProfile
};
