import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ServiceOrder } from '@/components/company/orders/types';
import { Booking } from '@/types/booking';
import { logError, logInfo } from '../monitoring/systemLogService';
import { 
  notifyBookingConfirmed, 
  notifyCompanyNewOrder,
  notifyDriverNewAssignment,
  notifyDriverAssigned,
  notifyTripStarted,
  notifyTripCompleted,
  notifyCompanyOrderStatusChange
} from '../notifications/workflowNotificationService';

/**
 * Create a new service order from a booking
 */
export const createServiceOrderFromBooking = async (booking: Booking) => {
  try {
    // Find company with lowest queue position
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'active')
      .order('queue_position', { ascending: true })
      .limit(1);
    
    if (companiesError) {
      throw companiesError;
    }
    
    if (!companies || companies.length === 0) {
      throw new Error('No active companies available');
    }
    
    const companyId = companies[0].id;
    
    // Create service order
    const orderData = {
      company_id: companyId,
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date,
      status: 'pending' as const,
      notes: `Reserva: ${booking.reference_code}\n${booking.additional_notes || ''}`,
    };
    
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .insert(orderData)
      .select()
      .single();
    
    if (orderError) {
      throw orderError;
    }
    
    // Make sure order.status is one of the allowed values
    const typedOrder: ServiceOrder = {
      ...order,
      status: order.status as ServiceOrder['status']
    };
    
    // Log the service order creation
    logInfo('Service order created from booking', 'order', {
      booking_id: booking.id,
      order_id: typedOrder.id,
      company_id: companyId
    });
    
    // Send notification to company
    try {
      await notifyCompanyNewOrder(typedOrder);
    } catch (notifyError) {
      console.error('Error sending company notification:', notifyError);
    }
    
    // Send notification to customer
    try {
      await notifyBookingConfirmed(booking);
    } catch (notifyError) {
      console.error('Error sending booking confirmation notification:', notifyError);
    }
    
    return { serviceOrder: typedOrder, error: null };
  } catch (error) {
    console.error('Error creating service order from booking:', error);
    logError('Failed to create service order from booking', 'order', {
      booking_id: booking.id,
      error: error
    });
    return { serviceOrder: null, error };
  }
};

/**
 * Assign a driver to a service order
 */
export const assignDriverToOrder = async (orderId: string, driverId: string) => {
  try {
    // First get current order to check status
    const { data: currentOrder, error: fetchError } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Validate that order is in 'pending' status
    if (currentOrder.status !== 'pending') {
      return { 
        success: false, 
        error: `Cannot assign driver to order with status ${currentOrder.status}` 
      };
    }
    
    // Update the order with driver id and change status
    const { data, error } = await supabase
      .from('service_orders')
      .update({ 
        driver_id: driverId,
        status: 'assigned' as const
      })
      .eq('id', orderId)
      .select('*, companies:company_id(name), drivers:driver_id(name)')
      .single();
    
    if (error) {
      throw error;
    }
    
    // Cast to the correct type
    const typedOrder: ServiceOrder = {
      ...data,
      status: data.status as ServiceOrder['status']
    };
    
    // Log the assignment
    logInfo('Driver assigned to service order', 'order', {
      order_id: orderId,
      driver_id: driverId
    });
    
    // Get driver name
    const driverName = data.drivers?.name || 'Motorista designado';
    
    // Send notification to driver
    try {
      await notifyDriverNewAssignment(typedOrder);
    } catch (notifyError) {
      console.error('Error sending driver notification:', notifyError);
    }
    
    // Send notification to customer (if we had this info) about driver assignment
    try {
      await notifyDriverAssigned(typedOrder, driverName);
    } catch (notifyError) {
      console.error('Error sending driver assigned notification:', notifyError);
    }
    
    return { success: true, order: typedOrder };
  } catch (error) {
    console.error('Error assigning driver to order:', error);
    logError('Failed to assign driver to order', 'order', {
      order_id: orderId,
      driver_id: driverId,
      error: error
    });
    return { success: false, error };
  }
};

/**
 * Update the status of a service order
 */
export const updateOrderStatus = async (orderId: string, newStatus: string, driverId?: string) => {
  try {
    // Validate the status transition
    const { data: currentOrder, error: fetchError } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (fetchError) {
      throw fetchError;
    }
    
    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'pending': ['assigned', 'cancelled'],
      'assigned': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };
    
    const currentStatus = currentOrder.status;
    
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      return { 
        success: false, 
        error: `Invalid status transition from ${currentStatus} to ${newStatus}` 
      };
    }
    
    // If driver ID is provided, verify it matches
    if (driverId && currentOrder.driver_id !== driverId) {
      return {
        success: false,
        error: 'Driver ID does not match the assigned driver'
      };
    }
    
    // Check if newStatus is one of the allowed values
    const typedStatus = newStatus as ServiceOrder['status'];
    
    // Update the order status
    const { data, error } = await supabase
      .from('service_orders')
      .update({ status: typedStatus })
      .eq('id', orderId)
      .select('*, companies:company_id(name)')
      .single();
    
    if (error) {
      throw error;
    }
    
    // Cast to the correct type
    const typedOrder: ServiceOrder = {
      ...data,
      status: data.status as ServiceOrder['status']
    };
    
    // Log the status update
    logInfo('Service order status updated', 'order', {
      order_id: orderId,
      previous_status: currentStatus,
      new_status: typedStatus
    });
    
    // Send appropriate notifications based on status
    try {
      // Notify company about status change
      await notifyCompanyOrderStatusChange(typedOrder, currentStatus);
      
      // Additional notifications based on specific status changes
      if (typedStatus === 'in_progress') {
        await notifyTripStarted(typedOrder);
      } else if (typedStatus === 'completed') {
        await notifyTripCompleted(typedOrder);
      }
    } catch (notifyError) {
      console.error('Error sending status change notification:', notifyError);
    }
    
    return { success: true, order: typedOrder };
  } catch (error) {
    console.error('Error updating order status:', error);
    logError('Failed to update order status', 'order', {
      order_id: orderId,
      new_status: newStatus,
      error: error
    });
    return { success: false, error };
  }
};

/**
 * Get all service orders for a company
 */
export const getCompanyOrders = async (companyId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        *,
        drivers (
          id,
          name,
          phone
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // Ensure all orders have the correct status type
    const typedOrders = data?.map(order => ({
      ...order,
      status: order.status as ServiceOrder['status']
    })) || [];
    
    return { orders: typedOrders, error: null };
  } catch (error) {
    console.error('Error fetching company orders:', error);
    return { orders: [], error };
  }
};

/**
 * Get all service orders for a driver
 */
export const getDriverOrders = async (driverId: string, includeCompleted: boolean = false) => {
  try {
    let query = supabase
      .from('service_orders')
      .select(`
        *,
        companies (
          id,
          name
        )
      `)
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });
    
    if (!includeCompleted) {
      query = query.in('status', ['assigned', 'in_progress']);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Ensure all orders have the correct status type
    const typedOrders = data?.map(order => ({
      ...order,
      status: order.status as ServiceOrder['status']
    })) || [];
    
    return { orders: typedOrders, error: null };
  } catch (error) {
    console.error('Error fetching driver orders:', error);
    return { orders: [], error };
  }
};

/**
 * Get all pending service orders (available for assignment)
 */
export const getPendingOrders = async () => {
  try {
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        *,
        companies (
          id,
          name
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    // Ensure all orders have the correct status type
    const typedOrders = data?.map(order => ({
      ...order,
      status: order.status as ServiceOrder['status']
    })) || [];
    
    return { orders: typedOrders, error: null };
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    return { orders: [], error };
  }
};

/**
 * Driver accepts an order
 */
export const acceptOrder = async (orderId: string, driverId: string) => {
  return assignDriverToOrder(orderId, driverId);
};

/**
 * Driver rejects an order
 */
export const rejectOrder = async (orderId: string, driverId: string, reason?: string) => {
  try {
    // Log the rejection
    logInfo('Driver rejected service order', 'driver', {
      order_id: orderId,
      driver_id: driverId,
      reason: reason || 'No reason provided'
    });
    
    // In a real system, we might want to track rejections or assign to another driver
    // For now, we'll just return success without changing the order
    return { success: true };
  } catch (error) {
    console.error('Error rejecting order:', error);
    return { success: false, error };
  }
};

/**
 * Assigns a service order to a driver
 */
export const assignServiceOrderToDriver = async (orderId: string, driverId: string) => {
  try {
    console.log('Assigning order to driver:', { orderId, driverId });
    const { error } = await supabase
      .from('service_orders')
      .update({ 
        driver_id: driverId,
        status: 'assigned' 
      })
      .eq('id', orderId);
    
    if (error) throw error;
    
    return { updated: true, error: null };
  } catch (error) {
    console.error('Error in assignServiceOrderToDriver:', error);
    return { updated: false, error };
  }
};

/**
 * Updates the status of a service order
 */
export const updateServiceOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    console.log('Updating order status:', { orderId, newStatus });
    const { error } = await supabase
      .from('service_orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (error) throw error;
    
    return { updated: true, error: null };
  } catch (error) {
    console.error('Error in updateServiceOrderStatus:', error);
    return { updated: false, error };
  }
};
