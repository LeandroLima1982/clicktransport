
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { ServiceOrder } from '@/types/serviceOrder';
import { logError, logInfo } from '../monitoring/systemLogService';

/**
 * Get all bookings for a user
 */
export const getUserBookings = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, service_orders:service_orders(id, status, driver_id, origin, destination)')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false });
    
    if (error) throw error;
    
    return { bookings: data || [], error: null };
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return { bookings: [], error };
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, service_orders:service_orders(id, status, driver_id, origin, destination, pickup_date, delivery_date, driver:drivers(id, name, phone), passenger_data)')
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    
    // Add a flag to indicate if the booking has a service order
    const bookingWithServiceOrderFlag = {
      ...data,
      has_service_order: data.service_orders && data.service_orders.length > 0
    };
    
    return { booking: bookingWithServiceOrderFlag, error: null };
  } catch (error) {
    console.error('Error getting booking by ID:', error);
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
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Also cancel associated service orders
    try {
      const { data: serviceOrders } = await supabase
        .from('service_orders')
        .select('id')
        .eq('booking_id', bookingId);
        
      if (serviceOrders && serviceOrders.length > 0) {
        const orderIds = serviceOrders.map(order => order.id);
        
        for (const orderId of orderIds) {
          await updateOrderStatus(orderId, 'cancelled');
        }
      }
    } catch (serviceOrderError) {
      console.error('Error cancelling associated service orders:', serviceOrderError);
    }
    
    return { success: true, booking: data, error: null };
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return { success: false, booking: null, error };
  }
};

/**
 * Create a service order from a booking
 */
export const createServiceOrderFromBooking = async (booking: Booking) => {
  try {
    // Check if a service order already exists for this booking
    const { data: existingOrders } = await supabase
      .from('service_orders')
      .select('id')
      .eq('booking_id', booking.id);
      
    if (existingOrders && existingOrders.length > 0) {
      return { 
        serviceOrder: existingOrders[0], 
        error: new Error('Service order already exists for this booking') 
      };
    }
    
    // Create the service order data with explicit typing
    const serviceOrderData: Partial<ServiceOrder> = {
      booking_id: booking.id,
      company_id: booking.company_id || '',
      origin: booking.origin,
      destination: booking.destination,
      pickup_date: booking.travel_date || booking.booking_date,
      status: 'pending' as ServiceOrder['status'],
      notes: booking.additional_notes || null,
      passenger_data: booking.passenger_data || null
    };
    
    // Insert the service order
    const { data, error } = await supabase
      .from('service_orders')
      .insert([serviceOrderData])
      .select()
      .single();
      
    if (error) throw error;
    
    // Log the service order creation
    logInfo('Service order created from booking', 'service_order', {
      service_order_id: data.id,
      booking_id: booking.id,
      reference: booking.reference_code
    });
    
    return { serviceOrder: data, error: null };
  } catch (error) {
    console.error('Error creating service order from booking:', error);
    return { serviceOrder: null, error };
  }
};

/**
 * Update the status of a service order
 */
export const updateOrderStatus = async (orderId: string, status: ServiceOrder['status']) => {
  try {
    // For completed orders, add a delivery date
    const updates: { status: ServiceOrder['status']; delivery_date?: string } = { status };
    
    if (status === 'completed') {
      updates.delivery_date = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('service_orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();
      
    if (error) throw error;
    
    // Log the status update
    logInfo(`Service order status updated to ${status}`, 'service_order', {
      service_order_id: orderId,
      new_status: status
    });
    
    return { success: true, serviceOrder: data, error: null };
  } catch (error) {
    console.error('Error updating service order status:', error);
    return { success: false, serviceOrder: null, error };
  }
};

/**
 * Assign a driver to a service order
 */
export const assignDriverToOrder = async (orderId: string, driverId: string) => {
  try {
    const { data, error } = await supabase
      .from('service_orders')
      .update({ 
        driver_id: driverId,
        status: 'assigned'
      })
      .eq('id', orderId)
      .select()
      .single();
      
    if (error) throw error;
    
    // Log the driver assignment
    logInfo(`Driver assigned to service order`, 'service_order', {
      service_order_id: orderId,
      driver_id: driverId
    });
    
    return { success: true, serviceOrder: data, error: null };
  } catch (error) {
    console.error('Error assigning driver to order:', error);
    return { success: false, serviceOrder: null, error };
  }
};
