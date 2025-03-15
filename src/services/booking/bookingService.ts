import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Booking } from '@/types/booking';
import { ServiceOrder } from '@/types/serviceOrder';

/**
 * Creates a new booking in the database
 */
export const createBooking = async (bookingData: Omit<Booking, 'id' | 'created_at'>) => {
  try {
    console.log('Creating new booking:', bookingData);
    
    // Ensure user_id is provided
    if (!bookingData.user_id) {
      console.error('Error: user_id is required for creating a booking');
      throw new Error('User ID is required');
    }
    
    // Ensure status is of the correct type
    const formattedData = {
      ...bookingData,
      status: bookingData.status as 'confirmed' | 'pending' | 'completed' | 'cancelled'
    };
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(formattedData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
    
    console.log('Booking created successfully:', data);
    return { booking: data as Booking, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { booking: null, error };
  }
};

/**
 * Gets the next company in the queue for service order assignment
 */
export const getNextCompanyInQueue = async () => {
  try {
    console.log('Finding next company in queue for assignment');
    
    // Busca a empresa com menor posição na fila (próxima a receber uma ordem)
    // Em caso de empate, seleciona a que não recebeu ordens há mais tempo
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, queue_position, last_order_assigned')
      .eq('status', 'active')
      .order('queue_position', { ascending: true })
      .order('last_order_assigned', { ascending: true, nullsFirst: true })
      .limit(1);
      
    if (error) {
      console.error('Error finding next company in queue:', error);
      throw error;
    }
    
    if (!companies || companies.length === 0) {
      console.error('No active companies found to assign the order');
      return { company: null, error: new Error('No active companies found') };
    }
    
    console.log('Found next company in queue:', companies[0]);
    return { company: companies[0], error: null };
  } catch (error) {
    console.error('Error finding next company in queue:', error);
    return { company: null, error };
  }
};

/**
 * Creates a service order from a booking
 */
export const createServiceOrderFromBooking = async (booking: Booking) => {
  try {
    console.log('Creating service order from booking:', booking);
    
    // Obter a próxima empresa na fila
    const { company, error: companyError } = await getNextCompanyInQueue();
    
    if (companyError || !company) {
      console.error('Error finding company for assignment:', companyError);
      toast.error('Não foi possível encontrar uma empresa disponível para atribuir o pedido');
      return { serviceOrder: null, error: companyError || new Error('No company found') };
    }
    
    const companyId = company.id;
    console.log(`Found company to assign order: ${companyId} (${company.name})`);
    
    // Create service order with booking details
    const serviceOrderData = {
      company_id: companyId,
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date,
      delivery_date: booking.return_date || null,
      status: 'pending' as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
      notes: `Reserva #${booking.reference_code} - ${booking.additional_notes || 'Sem observações'}`,
    };
    
    const { data, error } = await supabase
      .from('service_orders')
      .insert(serviceOrderData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating service order:', error);
      throw error;
    }
    
    console.log('Service order created successfully:', data);
    
    // Update the booking status to confirmed after service order is created
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', booking.id);
      
    if (updateError) {
      console.error('Error updating booking status:', updateError);
      // We don't throw here because the service order was created successfully
      toast.warning('Reserva criada, mas houve um erro ao atualizar o status');
    }
    
    // Update the company's queue position and last order timestamp
    await updateCompanyQueuePosition(companyId);
    
    // Notify company about the new order (this will be picked up by real-time subscriptions)
    await notifyCompanyAboutNewOrder(companyId, data as ServiceOrder);
    
    return { serviceOrder: data as ServiceOrder, error: null };
  } catch (error) {
    console.error('Error creating service order from booking:', error);
    toast.error('Erro ao criar ordem de serviço. Por favor, tente novamente.');
    return { serviceOrder: null, error };
  }
};

/**
 * Updates a company's queue position and last order timestamp
 */
export const updateCompanyQueuePosition = async (companyId: string) => {
  try {
    console.log(`Updating queue position for company ${companyId}`);
    
    // Update the company's queue position and last order timestamp
    const { error } = await supabase
      .from('companies')
      .update({ 
        queue_position: supabase.rpc('increment_queue_position', { row_id: companyId }) as unknown as number,
        last_order_assigned: new Date().toISOString()
      })
      .eq('id', companyId);
    
    if (error) {
      console.error('Error updating company queue position:', error);
      return { success: false, error };
    }
    
    console.log(`Company ${companyId} queue position updated successfully`);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating company queue position:', error);
    return { success: false, error };
  }
};

/**
 * Notifies company about a new service order (via database update)
 * This works with realtime subscriptions
 */
const notifyCompanyAboutNewOrder = async (companyId: string, serviceOrder: ServiceOrder) => {
  try {
    // We're using a database update to trigger realtime notifications
    // Companies listening to service_orders table changes will be notified
    const { error } = await supabase
      .from('service_orders')
      .update({ 
        // Update something innocuous to trigger the update event
        notes: serviceOrder.notes ? serviceOrder.notes + " [Notificação enviada]" : "Notificação enviada"
      })
      .eq('id', serviceOrder.id);
    
    if (error) {
      console.error('Error notifying company:', error);
      throw error;
    }
    
    console.log('Company notification sent for new order');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error notifying company about new order:', error);
    return { success: false, error };
  }
};

/**
 * Assigns a service order to a driver
 */
export const assignServiceOrderToDriver = async (orderId: string, driverId: string) => {
  try {
    console.log(`Assigning order ${orderId} to driver ${driverId}`);
    
    const { data, error } = await supabase
      .from('service_orders')
      .update({ 
        driver_id: driverId,
        status: 'assigned' as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Service order assigned successfully:', data);
    return { updated: data as ServiceOrder, error: null };
  } catch (error) {
    console.error('Error assigning service order to driver:', error);
    return { updated: null, error };
  }
};

/**
 * Gets all service orders for a company
 */
export const getCompanyServiceOrders = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_orders')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return { orders: data as ServiceOrder[], error: null };
  } catch (error) {
    console.error('Error fetching company service orders:', error);
    return { orders: [], error };
  }
};

/**
 * Resets the queue position for all companies
 * Useful for administrative purposes or in case of system reset
 */
export const resetCompanyQueuePositions = async () => {
  try {
    console.log('Resetting queue positions for all companies');
    
    const { error } = await supabase
      .from('companies')
      .update({ queue_position: 0 })
      .eq('status', 'active');
      
    if (error) {
      console.error('Error resetting company queue positions:', error);
      return { success: false, error };
    }
    
    console.log('Company queue positions reset successfully');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error resetting company queue positions:', error);
    return { success: false, error };
  }
};

/**
 * Gets the current queue status for all companies
 * Shows the queue position and last order time for each company
 */
export const getCompanyQueueStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, queue_position, last_order_assigned, status')
      .order('queue_position', { ascending: true })
      .order('last_order_assigned', { ascending: true, nullsFirst: true });
      
    if (error) {
      console.error('Error fetching company queue status:', error);
      return { companies: [], error };
    }
    
    return { companies: data, error: null };
  } catch (error) {
    console.error('Error fetching company queue status:', error);
    return { companies: [], error };
  }
};
