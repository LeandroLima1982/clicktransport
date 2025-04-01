
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Generate a sample booking and service order for testing
 */
export const generateSampleBookingAndOrder = async () => {
  try {
    console.log('Starting to generate sample booking and order');
    
    // First, check if we have active companies
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('status', 'active')
      .limit(1);
    
    if (companyError) throw companyError;
    
    if (!companies || companies.length === 0) {
      toast.error('Nenhuma empresa ativa encontrada para criar ordem de teste');
      return { success: false, error: 'No active companies found' };
    }
    
    const companyId = companies[0].id;
    
    // Create a test booking
    const bookingRef = 'TEST-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const pickupDate = new Date();
    pickupDate.setHours(pickupDate.getHours() + 2); // 2 hours from now
    
    const bookingData = {
      reference_code: bookingRef,
      origin: 'Rua de Teste, 123, São Paulo',
      destination: 'Aeroporto de Guarulhos, São Paulo',
      booking_date: now.toISOString(),
      travel_date: pickupDate.toISOString(),
      total_price: 159.90,
      passengers: 2,
      vehicle_type: 'Sedan Executivo',
      status: 'confirmed',
      company_id: companyId,
      company_name: companies[0].name,
      client_name: 'Cliente Teste',
      client_email: 'teste@exemplo.com',
      client_phone: '(11) 99999-9999',
      additional_notes: 'Reserva de teste gerada automaticamente',
      user_id: '00000000-0000-0000-0000-000000000000' // Dummy user ID for testing
    };
    
    console.log('Creating test booking with data:', bookingData);
    
    // Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();
    
    if (bookingError) {
      console.error('Error creating test booking:', bookingError);
      toast.error('Erro ao criar reserva de teste');
      return { success: false, error: bookingError };
    }
    
    console.log('Test booking created successfully:', booking);
    
    // Create service order
    const orderData = {
      company_id: companyId,
      origin: bookingData.origin,
      destination: bookingData.destination,
      pickup_date: pickupDate.toISOString(),
      status: 'created',
      notes: `Reserva de teste: ${bookingRef}\n${bookingData.additional_notes}`,
      passenger_data: {
        name: bookingData.client_name,
        email: bookingData.client_email,
        phone: bookingData.client_phone
      },
      total_price: bookingData.total_price
    };
    
    console.log('Creating test service order with data:', orderData);
    
    // Insert service order
    const { data: serviceOrder, error: orderError } = await supabase
      .from('service_orders')
      .insert([orderData])
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating test service order:', orderError);
      toast.error('Erro ao criar ordem de serviço de teste');
      return { success: true, booking, error: orderError };
    }
    
    console.log('Test service order created successfully:', serviceOrder);
    toast.success('Dados de teste criados com sucesso!', {
      description: `Reserva e ordem de serviço criadas para teste`
    });
    
    return { success: true, booking, serviceOrder };
  } catch (error) {
    console.error('Error generating sample data:', error);
    toast.error('Erro ao gerar dados de teste');
    return { success: false, error };
  }
};

/**
 * Create a manual service order for testing
 */
export const createManualServiceOrder = async () => {
  try {
    console.log('Starting to create manual service order');
    
    // First, check if we have active companies
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('status', 'active')
      .limit(1);
    
    if (companyError) throw companyError;
    
    if (!companies || companies.length === 0) {
      toast.error('Nenhuma empresa ativa encontrada para criar ordem manual');
      return { success: false, error: 'No active companies found' };
    }
    
    const companyId = companies[0].id;
    
    // Create a future pickup date (tomorrow)
    const pickupDate = new Date();
    pickupDate.setDate(pickupDate.getDate() + 1);
    pickupDate.setHours(10, 0, 0, 0); // 10:00 AM
    
    // Create service order data
    const orderData = {
      company_id: companyId,
      origin: 'Rua Augusta, 1500, São Paulo, SP',
      destination: 'Shopping Ibirapuera, Av. Ibirapuera, 3103, São Paulo, SP',
      pickup_date: pickupDate.toISOString(),
      status: 'created',
      notes: 'Ordem de serviço manual criada para teste',
      passenger_data: {
        name: 'Passageiro Manual Teste',
        email: 'passageiro.manual@teste.com',
        phone: '(11) 98888-7777'
      },
      total_price: 120.50
    };
    
    console.log('Creating manual service order with data:', orderData);
    
    // Insert service order
    const { data: serviceOrder, error: orderError } = await supabase
      .from('service_orders')
      .insert([orderData])
      .select()
      .single();
    
    if (orderError) {
      console.error('Error creating manual service order:', orderError);
      toast.error('Erro ao criar ordem manual');
      return { success: false, error: orderError };
    }
    
    console.log('Manual service order created successfully:', serviceOrder);
    toast.success('Ordem de serviço manual criada com sucesso!', {
      description: `Ordem criada para a empresa ${companies[0].name}`
    });
    
    return { success: true, serviceOrder };
  } catch (error) {
    console.error('Error creating manual service order:', error);
    toast.error('Erro ao criar ordem manual');
    return { success: false, error };
  }
};
