
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { ServiceOrder } from '@/types/serviceOrder';
import { createServiceOrderFromBooking } from './serviceOrderService';
import { 
  logInfo, 
  logWarning, 
  logError 
} from '../monitoring/systemLogService';

/**
 * Creates a new booking with validation for required fields
 */
export const createBooking = async (bookingData: Partial<Booking>) => {
  try {
    // Validate required fields
    if (!bookingData.user_id) {
      return { booking: null, error: new Error('User ID is required') };
    }
    
    if (!bookingData.origin || !bookingData.destination) {
      return { booking: null, error: new Error('Origin and destination are required') };
    }
    
    // Create a valid booking object with defaults for required fields
    const validBookingData = {
      ...bookingData,
      booking_date: bookingData.booking_date || new Date().toISOString(),
      travel_date: bookingData.travel_date || new Date().toISOString(),
      reference_code: bookingData.reference_code || `BK-${Date.now()}`,
      total_price: bookingData.total_price || 0,
      status: bookingData.status || 'pending'
    };
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(validBookingData)
      .select('*')
      .single();
    
    if (error) throw error;
    
    // Log successful booking creation
    await logInfo('Nova reserva criada', 'order', {
      booking_id: data.id,
      reference_code: data.reference_code,
      user_id: data.user_id
    });
    
    return { booking: data as Booking, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    await logError('Erro ao criar reserva', 'order', { 
      error,
      attempted_booking: bookingData
    });
    return { booking: null, error };
  }
};

/**
 * Assigns a service order to a driver
 */
export const assignServiceOrderToDriver = async (orderId: string, driverId: string) => {
  try {
    // First, check if the driver exists and is available
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id, status')
      .eq('id', driverId)
      .single();
    
    if (driverError) throw driverError;
    
    if (!driver) {
      return { updated: null, error: new Error('Driver not found') };
    }
    
    if (driver.status !== 'active') {
      return { updated: null, error: new Error('Driver is not available') };
    }
    
    // Update the service order with the driver_id and change status to 'assigned'
    const { data, error } = await supabase
      .from('service_orders')
      .update({ 
        driver_id: driverId,
        status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update driver status to indicate they're assigned to an order
    const { error: updateDriverError } = await supabase
      .from('drivers')
      .update({ status: 'assigned' })
      .eq('id', driverId);
    
    if (updateDriverError) {
      // Log warning but don't fail the operation
      await logWarning('Falha ao atualizar status do motorista', 'driver', {
        driver_id: driverId,
        order_id: orderId,
        error: updateDriverError
      });
    }
    
    // Log the assignment
    await logInfo('Motorista atribuído à ordem de serviço', 'order', {
      order_id: orderId,
      driver_id: driverId
    });
    
    return { updated: data as ServiceOrder, error: null };
  } catch (error) {
    console.error('Error assigning driver to service order:', error);
    await logError('Erro ao atribuir motorista à ordem de serviço', 'order', {
      order_id: orderId,
      driver_id: driverId,
      error
    });
    return { updated: null, error };
  }
};

/**
 * Updates a service order status with validation
 */
export const updateServiceOrderStatus = async (
  orderId: string, 
  newStatus: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
) => {
  try {
    // First get the current status
    const { data: currentOrder, error: fetchError } = await supabase
      .from('service_orders')
      .select('status, driver_id')
      .eq('id', orderId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentStatus = currentOrder.status;
    
    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      'pending': ['assigned', 'cancelled'],
      'assigned': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [], // Terminal state
      'cancelled': []  // Terminal state
    };
    
    if (!validTransitions[currentStatus].includes(newStatus)) {
      const errorMsg = `Invalid status transition from ${currentStatus} to ${newStatus}`;
      await logWarning(errorMsg, 'order', { 
        order_id: orderId, 
        current_status: currentStatus,
        attempted_status: newStatus
      });
      
      return { 
        updated: null, 
        error: new Error(errorMsg)
      };
    }
    
    // Update the order status
    const { data, error } = await supabase
      .from('service_orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Log the status update
    await logInfo(`Status da ordem atualizado: ${currentStatus} → ${newStatus}`, 'order', {
      order_id: orderId,
      driver_id: data.driver_id,
      previous_status: currentStatus,
      new_status: newStatus
    });
    
    // Handle driver status updates based on order status changes
    if (data.driver_id) {
      if (newStatus === 'completed' || newStatus === 'cancelled') {
        // Reset driver to 'active' when order is completed or cancelled
        const { error: driverError } = await supabase
          .from('drivers')
          .update({ status: 'active' })
          .eq('id', data.driver_id);
          
        if (driverError) {
          console.error('Warning: Failed to update driver status:', driverError);
          await logWarning('Falha ao atualizar status do motorista', 'driver', {
            driver_id: data.driver_id,
            order_id: orderId,
            error: driverError
          });
        }
      } else if (newStatus === 'in_progress') {
        // Update driver to 'on_trip' when order is started
        const { error: driverError } = await supabase
          .from('drivers')
          .update({ status: 'on_trip' })
          .eq('id', data.driver_id);
          
        if (driverError) {
          console.error('Warning: Failed to update driver status:', driverError);
          await logWarning('Falha ao atualizar status do motorista', 'driver', {
            driver_id: data.driver_id,
            order_id: orderId,
            error: driverError
          });
        }
      }
    }
    
    return { updated: data as ServiceOrder, error: null };
  } catch (error) {
    console.error('Error updating service order status:', error);
    await logError('Erro ao atualizar status da ordem de serviço', 'order', {
      order_id: orderId,
      attempted_status: newStatus,
      error
    });
    return { updated: null, error };
  }
};

export { createServiceOrderFromBooking };
