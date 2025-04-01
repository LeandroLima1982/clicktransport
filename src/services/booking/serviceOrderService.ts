
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logError, logInfo } from '../monitoring/systemLogService';
import { Booking } from '@/types/booking';
import { ServiceOrder } from '@/types/serviceOrder';

/**
 * Create a service order from a booking
 */
export const createServiceOrderFromBooking = async (booking: any) => {
  try {
    console.log('Creating service order from booking (service):', booking);
    
    // Find an available company if not specified
    let companyId = booking.company_id;
    
    if (!companyId) {
      console.log('No company ID in booking, finding available company...');
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, queue_position')
        .eq('status', 'active')
        .order('queue_position', { ascending: true })
        .limit(1);
      
      if (companiesError) throw companiesError;
      
      if (companies && companies.length > 0) {
        companyId = companies[0].id;
        console.log('Selected company based on queue:', companies[0]);
      } else {
        throw new Error('No active companies available for service order assignment');
      }
    }
    
    // Create service order
    const orderData = {
      company_id: companyId,
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date,
      status: 'created' as ServiceOrder['status'], 
      notes: `Reserva: ${booking.reference_code}\n${booking.additional_notes || ''}`,
      passenger_data: booking.passenger_data || null,
      total_price: booking.total_price || null,
      trip_type: booking.trip_type || 'oneway'
    };
    
    console.log('Creating service order with data:', orderData);
    
    // Insert the order
    const { data: serviceOrder, error: orderError } = await supabase
      .from('service_orders')
      .insert([orderData])
      .select('*, companies(name)')
      .single();
    
    if (orderError) {
      console.error('Failed to create service order:', orderError);
      throw orderError;
    }
    
    console.log('Service order created successfully:', serviceOrder);
    
    // Update the booking with the service order ID
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        company_id: companyId,
        company_name: serviceOrder.companies?.name || 'Empresa designada',
        has_service_order: true
      })
      .eq('id', booking.id);
    
    if (updateError) {
      console.error('Error updating booking with company info:', updateError);
    }
    
    logInfo('Service order created from booking', 'booking', {
      booking_id: booking.id,
      service_order_id: serviceOrder.id
    });
    
    return { serviceOrder, error: null };
  } catch (error) {
    console.error('Error creating service order from booking:', error);
    logError('Failed to create service order from booking', 'booking', {
      booking_id: booking?.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { serviceOrder: null, error };
  }
};

/**
 * Assign a driver to a service order
 */
export const assignDriverToOrder = async (orderId: string, driverId: string) => {
  try {
    console.log(`Assigning driver ${driverId} to order ${orderId}`);
    
    // Verify the order exists and is in a valid state
    const { data: order, error: orderError } = await supabase
      .from('service_orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError) throw orderError;
    
    if (!order) {
      return { success: false, error: 'Order not found' };
    }
    
    if (order.status !== 'created' && order.status !== 'pending') {
      return { success: false, error: `Cannot assign driver to order in ${order.status} status` };
    }
    
    // Verify the driver exists
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id, name')
      .eq('id', driverId)
      .single();
    
    if (driverError) throw driverError;
    
    if (!driver) {
      return { success: false, error: 'Driver not found' };
    }
    
    // Assign the driver to the order and update status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('service_orders')
      .update({ 
        driver_id: driverId,
        status: 'assigned' as ServiceOrder['status']
      })
      .eq('id', orderId)
      .select('*, companies:company_id(name)')
      .single();
    
    if (updateError) throw updateError;
    
    logInfo('Driver assigned to order', 'order', {
      order_id: orderId,
      driver_id: driverId,
      driver_name: driver.name
    });
    
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error('Error assigning driver to order:', error);
    logError('Failed to assign driver to order', 'order', {
      order_id: orderId,
      driver_id: driverId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { success: false, error };
  }
};

/**
 * Update the status of a service order
 */
export const updateOrderStatus = async (orderId: string, newStatus: ServiceOrder['status'], driverId?: string) => {
  try {
    console.log(`Updating service order ${orderId} status to ${newStatus}`);
    
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
      'pending': ['assigned', 'cancelled', 'created'],
      'created': ['assigned', 'pending', 'cancelled'],
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
    
    // Update the order status
    const { data, error } = await supabase
      .from('service_orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select('*, companies:company_id(name)')
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log(`Service order status updated to ${newStatus}:`, data);
    
    // Log the status update
    logInfo('Service order status updated', 'order', {
      order_id: orderId,
      previous_status: currentStatus,
      new_status: newStatus
    });
    
    return { success: true, order: data };
  } catch (error) {
    console.error('Error updating order status:', error);
    logError('Failed to update order status', 'order', {
      order_id: orderId,
      new_status: newStatus,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { success: false, error };
  }
};

/**
 * Get all bookings for a user
 */
export const getUserBookings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return { bookings: data || [], error: null };
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return { bookings: [], error };
  }
};

/**
 * Get booking details by ID
 */
export const getBookingById = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return { booking: data, error: null };
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return { booking: null, error };
  }
};

/**
 * Cancel a booking
 */
export const cancelBooking = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' as Booking['status'] })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Log the cancellation
    logInfo('Booking cancelled', 'booking', {
      booking_id: bookingId
    });
    
    return { booking: data, error: null };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { booking: null, error };
  }
};
