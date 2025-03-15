
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
 * Creates a service order from a booking
 */
export const createServiceOrderFromBooking = async (booking: Booking) => {
  try {
    console.log('Creating service order from booking:', booking);
    
    // First, find an available company to assign the order to
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('status', 'active')
      .limit(1);
    
    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      throw companiesError;
    }
    
    if (!companies || companies.length === 0) {
      console.error('No active companies found to assign the order');
      toast.error('Não foi possível encontrar uma empresa disponível para atribuir o pedido');
      return { serviceOrder: null, error: new Error('No active companies found') };
    }
    
    const companyId = companies[0].id;
    console.log('Found company to assign order:', companyId);
    
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
