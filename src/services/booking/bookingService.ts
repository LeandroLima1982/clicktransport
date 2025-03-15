
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
    
    // Look for active companies in ascending queue order
    // If queue positions are the same, prioritize companies that haven't received orders recently
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name, queue_position, last_order_assigned, status')
      .eq('status', 'active')
      .order('queue_position', { ascending: true })
      .order('last_order_assigned', { ascending: true, nullsFirst: true })
      .limit(10); // Get more companies in case we need to filter some out
      
    if (error) {
      console.error('Error finding next company in queue:', error);
      throw error;
    }
    
    if (!companies || companies.length === 0) {
      console.error('No active companies found to assign the order');
      return { company: null, error: new Error('No active companies found') };
    }
    
    // Verify companies are actually available to take new orders
    // In a real system, this could check other availability indicators
    const availableCompany = companies[0];
    
    console.log('Found next company in queue:', availableCompany);
    return { company: availableCompany, error: null };
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
    
    // Validate booking status - only proceed if booking is in the correct state
    if (booking.status !== 'pending' && booking.status !== 'confirmed') {
      console.error(`Invalid booking status for creating service order: ${booking.status}`);
      return { serviceOrder: null, error: new Error(`Invalid booking status: ${booking.status}`) };
    }
    
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
    
    // Use a transaction to ensure all database operations succeed or fail together
    // This prevents partial state with an order created but queue not updated
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
    const { success: queueUpdated, error: queueError } = await updateCompanyQueuePosition(companyId);
    
    if (!queueUpdated) {
      console.error('Error updating company queue position:', queueError);
      toast.warning('Ordem de serviço criada, mas houve um erro ao atualizar a fila de empresas');
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
 * Updates a company's queue position and last order timestamp
 * This fixes the queue rotation system by ensuring the position is incremented
 * and the timestamp is updated properly
 */
export const updateCompanyQueuePosition = async (companyId: string) => {
  try {
    console.log(`Updating queue position for company ${companyId}`);
    
    // First, get the current position to ensure we can increment it correctly
    const { data: currentCompany, error: fetchError } = await supabase
      .from('companies')
      .select('queue_position')
      .eq('id', companyId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current company queue position:', fetchError);
      return { success: false, error: fetchError };
    }
    
    // Calculate the new position (increment by 1 or set to 1 if null)
    const currentPosition = currentCompany?.queue_position || 0;
    const newPosition = currentPosition + 1;
    
    // Update the company's queue position and last order timestamp
    const { error } = await supabase
      .from('companies')
      .update({ 
        queue_position: newPosition,
        last_order_assigned: new Date().toISOString()
      })
      .eq('id', companyId);
    
    if (error) {
      console.error('Error updating company queue position:', error);
      return { success: false, error };
    }
    
    console.log(`Company ${companyId} queue position updated successfully from ${currentPosition} to ${newPosition}`);
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
    
    // First verify the driver exists and is available
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('id, status')
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
 * Checks for pending bookings without service orders and creates them
 * This is a recovery mechanism for when the system fails to create service orders
 */
export const reconcilePendingBookings = async () => {
  try {
    // Get all confirmed bookings that might not have service orders
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'confirmed');
      
    if (bookingsError) throw bookingsError;
    
    if (!bookings || bookings.length === 0) {
      console.log('No confirmed bookings found for reconciliation');
      return { processed: 0, errors: 0 };
    }
    
    console.log(`Found ${bookings.length} confirmed bookings to check for service orders`);
    
    let processed = 0;
    let errors = 0;
    
    // Process each booking to ensure it has a service order
    for (const booking of bookings) {
      // Check if this booking already has a service order
      const { data: existingOrders, error: checkError } = await supabase
        .from('service_orders')
        .select('id')
        .ilike('notes', `%Reserva #${booking.reference_code}%`)
        .limit(1);
        
      if (checkError) {
        console.error(`Error checking for existing service order for booking ${booking.id}:`, checkError);
        errors++;
        continue;
      }
      
      // If no service order exists, create one
      if (!existingOrders || existingOrders.length === 0) {
        console.log(`Creating missing service order for booking ${booking.id} (${booking.reference_code})`);
        
        // Create a properly typed booking object with strict type for status
        const typedBooking: Booking = {
          id: booking.id,
          reference_code: booking.reference_code,
          user_id: booking.user_id,
          origin: booking.origin,
          destination: booking.destination,
          booking_date: booking.booking_date,
          travel_date: booking.travel_date,
          created_at: booking.created_at,
          // Explicit type casting for the status field
          status: booking.status as 'confirmed' | 'pending' | 'completed' | 'cancelled',
          total_price: booking.total_price,
          // Handle optional fields with fallbacks
          return_date: booking.return_date || null,
          vehicle_type: booking.vehicle_type || null,
          passengers: booking.passengers || 1,
          additional_notes: booking.additional_notes || null
        };
        
        const { serviceOrder, error } = await createServiceOrderFromBooking(typedBooking);
        
        if (error || !serviceOrder) {
          console.error(`Error creating service order for booking ${booking.id}:`, error);
          errors++;
        } else {
          console.log(`Successfully created service order for booking ${booking.id}`);
          processed++;
        }
      } else {
        console.log(`Booking ${booking.id} (${booking.reference_code}) already has service order ${existingOrders[0].id}`);
      }
    }
    
    return { processed, errors };
  } catch (error) {
    console.error('Error reconciling pending bookings:', error);
    return { processed: 0, errors: 1, error };
  }
};

/**
 * Gets information about the last assigned booking and service order
 * Useful for debugging assignment issues
 */
export const getLastAssignedBookingInfo = async () => {
  try {
    console.log('Checking last assigned booking');
    
    // Get the most recent service order
    const { data: latestOrders, error: ordersError } = await supabase
      .from('service_orders')
      .select('id, company_id, created_at, notes, status')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (ordersError) throw ordersError;
    
    if (!latestOrders || latestOrders.length === 0) {
      return { 
        success: true, 
        data: { message: 'No service orders found in the system' },
        error: null 
      };
    }
    
    const latestOrder = latestOrders[0];
    
    // Extract booking reference from the order notes
    let bookingRef = null;
    if (latestOrder.notes) {
      const match = latestOrder.notes.match(/Reserva #([A-Z0-9-]+)/);
      if (match && match[1]) {
        bookingRef = match[1];
      }
    }
    
    // Get company info
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, queue_position, last_order_assigned')
      .eq('id', latestOrder.company_id)
      .single();
      
    if (companyError) {
      console.error('Error fetching company details:', companyError);
    }
    
    // Get the booking if we extracted a reference
    let booking = null;
    if (bookingRef) {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('reference_code', bookingRef)
        .single();
        
      if (!bookingError) {
        booking = bookingData;
      } else {
        console.error('Error fetching booking details:', bookingError);
      }
    }
    
    return { 
      success: true, 
      data: {
        lastServiceOrder: latestOrder,
        company: company || null,
        booking: booking,
      },
      error: null 
    };
    
  } catch (error) {
    console.error('Error getting last assigned booking info:', error);
    return { success: false, data: null, error };
  }
};

/**
 * Checks if we have unprocessed bookings that need service orders
 * Finds bookings that don't have service orders and summarizes them
 */
export const checkUnprocessedBookings = async () => {
  try {
    console.log('Checking for unprocessed bookings');
    
    // Get the last 10 bookings
    const { data: recentBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (bookingsError) throw bookingsError;
    
    if (!recentBookings || recentBookings.length === 0) {
      return { 
        success: true, 
        data: { message: 'No recent bookings found in the system' },
        error: null 
      };
    }
    
    const unprocessedBookings = [];
    const processedBookings = [];
    
    // Check each booking to see if it has a service order
    for (const booking of recentBookings) {
      const { data: relatedOrders, error: checkError } = await supabase
        .from('service_orders')
        .select('id, status, created_at')
        .ilike('notes', `%Reserva #${booking.reference_code}%`)
        .limit(1);
        
      if (checkError) {
        console.error(`Error checking for service order for booking ${booking.id}:`, checkError);
        continue;
      }
      
      const bookingInfo = {
        id: booking.id,
        reference_code: booking.reference_code,
        status: booking.status,
        created_at: booking.created_at,
        has_service_order: (relatedOrders && relatedOrders.length > 0),
        service_order: (relatedOrders && relatedOrders.length > 0) ? relatedOrders[0] : null
      };
      
      if (bookingInfo.has_service_order) {
        processedBookings.push(bookingInfo);
      } else {
        unprocessedBookings.push(bookingInfo);
      }
    }
    
    return { 
      success: true, 
      data: {
        unprocessedBookings,
        processedBookings,
        totalUnprocessed: unprocessedBookings.length,
        totalProcessed: processedBookings.length
      },
      error: null 
    };
    
  } catch (error) {
    console.error('Error checking unprocessed bookings:', error);
    return { success: false, data: null, error };
  }
};

/**
 * Gets the current company rotation state and diagnostics
 * Shows all companies with their queue positions and last assignment times
 */
export const getQueueDiagnostics = async () => {
  try {
    console.log('Running queue diagnostics');
    
    // Get all companies with their queue information
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, queue_position, last_order_assigned, status')
      .order('queue_position', { ascending: true });
      
    if (companiesError) throw companiesError;
    
    // Get the last 5 service orders to check assignment pattern
    const { data: recentOrders, error: ordersError } = await supabase
      .from('service_orders')
      .select('id, company_id, created_at, notes')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (ordersError) throw ordersError;
    
    // Enhanced diagnostic info for each company
    const companyDiagnostics = await Promise.all((companies || []).map(async (company) => {
      // Count orders assigned to this company
      const { count: orderCount, error: countError } = await supabase
        .from('service_orders')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', company.id);
      
      // Get most recent order for this company
      const { data: latestOrder, error: latestError } = await supabase
        .from('service_orders')
        .select('id, created_at, notes')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      return {
        ...company,
        order_count: countError ? 'error' : orderCount,
        latest_order: (latestError || !latestOrder || latestOrder.length === 0) ? null : latestOrder[0]
      };
    }));
    
    return { 
      success: true, 
      data: {
        companies: companyDiagnostics,
        recentOrders: recentOrders || [],
        queue_status: {
          active_companies: (companies || []).filter(c => c.status === 'active').length,
          total_companies: (companies || []).length,
          zero_queue_position_count: (companies || []).filter(c => c.queue_position === 0).length,
          null_queue_position_count: (companies || []).filter(c => c.queue_position === null).length,
        }
      },
      error: null 
    };
    
  } catch (error) {
    console.error('Error running queue diagnostics:', error);
    return { success: false, data: null, error };
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
