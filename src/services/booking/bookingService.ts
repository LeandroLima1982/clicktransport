
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Booking } from '@/types/booking';
import { createServiceOrderFromBooking, forceAssignBookingToCompany as forceAssign } from './serviceOrderService';
import { 
  getCompanyQueueStatus as getQueueStatus, 
  resetCompanyQueuePositions as resetQueue,
  getQueueDiagnostics as getQueueDiags
} from './queueService';

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

// Export the functions directly from the service modules for convenience
export const getCompanyQueueStatus = getQueueStatus;
export const resetCompanyQueuePositions = resetQueue;
export const getQueueDiagnostics = getQueueDiags;
export const forceAssignBookingToCompany = forceAssign;

export default {
  createBooking,
  getLastAssignedBookingInfo,
  checkUnprocessedBookings,
  reconcilePendingBookings,
  getCompanyQueueStatus,
  resetCompanyQueuePositions,
  getQueueDiagnostics,
  forceAssignBookingToCompany
};
