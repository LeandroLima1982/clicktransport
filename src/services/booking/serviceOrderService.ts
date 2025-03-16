import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServiceOrder } from '@/types/serviceOrder';
import { Booking } from '@/types/booking';
import { getNextCompanyInQueue, updateCompanyQueuePosition } from './queueService';
import { 
  notifyBookingConfirmed, 
  notifyCompanyNewOrder,
  notifyDriverNewAssignment
} from '../notifications/workflowNotificationService';

/**
 * Creates a service order from a booking
 */
export const createServiceOrderFromBooking = async (booking: Booking) => {
  try {
    console.log('Creating service order from booking:', booking);
    
    // Validate booking status - only proceed if booking is in the correct state
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      console.error(`Invalid booking status for creating service order: ${booking.status}`);
      return { serviceOrder: null, error: new Error(`Invalid booking status: ${booking.status}`) };
    }
    
    // Get the next company in the queue
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
    
    // Create the service order
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
    } else {
      // Send confirmation notification to the user
      notifyBookingConfirmed(booking);
    }
    
    // Update the company's queue position and last order timestamp
    // This is critical for round-robin assignment to work properly
    const { success: queueUpdated, error: queueError } = await updateCompanyQueuePosition(companyId);
    
    if (!queueUpdated) {
      console.error('Error updating company queue position:', queueError);
      toast.warning('Ordem de serviço criada, mas houve um erro ao atualizar a fila de empresas');
    } else {
      console.log(`Successfully updated queue position for company ${companyId}`);
    }
    
    // Notify company about the new order
    notifyCompanyNewOrder(data as ServiceOrder);
    
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
    
    // First verify the driver exists and is available
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id, status, name')
      .eq('id', driverId)
      .single();
      
    if (driverError || !driver) {
      console.error('Error fetching driver:', driverError);
      throw new Error('Driver not found or not available');
    }
    
    if (driver.status !== 'active') {
      console.error(`Driver ${driverId} is not active (status: ${driver.status})`);
      throw new Error(`Driver is not active (${driver.status})`);
    }
    
    // Get the order details before the update
    const { data: orderBeforeUpdate, error: orderFetchError } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (orderFetchError) throw orderFetchError;
    
    // Assign the order to the driver
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
    
    // Update driver status to on_trip
    const { error: driverUpdateError } = await supabase
      .from('drivers')
      .update({ status: 'on_trip' })
      .eq('id', driverId);
      
    if (driverUpdateError) {
      console.error('Warning: Failed to update driver status to on_trip:', driverUpdateError);
      // We don't throw here because the order assignment was successful
    }
    
    // Notify the driver about the new assignment
    notifyDriverNewAssignment(data as ServiceOrder);
    
    // Notify the user that a driver has been assigned to their order
    notifyDriverAssigned(data as ServiceOrder, driver.name);
    
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
 * Updates the status of a service order
 * This is used by drivers to update the status of a service order
 */
export const updateServiceOrderStatus = async (orderId: string, status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled') => {
  try {
    console.log(`Updating service order ${orderId} status to ${status}`);
    
    // Update the order status
    const { data, error } = await supabase
      .from('service_orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    
    // If the order is completed or cancelled, update related resources
    if (status === 'completed' || status === 'cancelled') {
      // Reset driver status if this order has a driver assigned
      if (data.driver_id) {
        const { error: driverError } = await supabase
          .from('drivers')
          .update({ status: 'active' })
          .eq('id', data.driver_id);
          
        if (driverError) {
          console.error('Error resetting driver status:', driverError);
          // Don't throw here as the primary operation succeeded
        }
      }
    }
    
    console.log('Service order status updated successfully:', data);
    return { updated: data as ServiceOrder, error: null };
  } catch (error) {
    console.error('Error updating service order status:', error);
    return { updated: null, error };
  }
};

/**
 * Forcefully assigns a booking to a specific company
 * Useful for fixing issues with the automatic assignment
 */
export const forceAssignBookingToCompany = async (bookingId: string, companyId: string) => {
  try {
    console.log(`Forcing assignment of booking ${bookingId} to company ${companyId}`);
    
    // Get the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
      
    if (bookingError || !booking) {
      console.error('Error fetching booking:', bookingError);
      return { success: false, error: bookingError || new Error('Booking not found') };
    }
    
    // Check if a service order already exists
    const { data: existingOrders, error: checkError } = await supabase
      .from('service_orders')
      .select('id')
      .ilike('notes', `%Reserva #${booking.reference_code}%`)
      .limit(1);
      
    if (checkError) {
      console.error('Error checking for existing service order:', checkError);
      return { success: false, error: checkError };
    }
    
    if (existingOrders && existingOrders.length > 0) {
      console.error(`Booking ${bookingId} already has a service order: ${existingOrders[0].id}`);
      return { 
        success: false, 
        error: new Error(`Booking already has a service order: ${existingOrders[0].id}`) 
      };
    }
    
    // Create a service order with the forced company_id
    const serviceOrderData = {
      company_id: companyId,
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date,
      delivery_date: booking.return_date || null,
      status: 'pending' as 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled',
      notes: `Reserva #${booking.reference_code} - ATRIBUIÇÃO MANUAL - ${booking.additional_notes || 'Sem observações'}`,
    };
    
    const { data, error } = await supabase
      .from('service_orders')
      .insert(serviceOrderData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating service order:', error);
      return { success: false, error };
    }
    
    // Update the booking status to confirmed
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', bookingId);
    
    if (updateError) {
      console.error('Error updating booking status:', updateError);
      // We don't fail the operation here because the service order was created
    }
    
    // Update the company's queue position
    await updateCompanyQueuePosition(companyId);
    
    return { 
      success: true, 
      data: {
        message: `Booking ${bookingId} successfully assigned to company ${companyId}`,
        service_order: data
      },
      error: null 
    };
    
  } catch (error) {
    console.error('Error in force assign booking:', error);
    return { success: false, data: null, error };
  }
};

export default {
  createServiceOrderFromBooking,
  assignServiceOrderToDriver,
  getCompanyServiceOrders,
  updateServiceOrderStatus,
  forceAssignBookingToCompany
};
