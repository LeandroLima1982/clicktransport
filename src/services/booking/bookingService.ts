
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logError, logInfo } from '../monitoring/systemLogService';
import { notifyBookingCreated } from '../notifications/workflowNotificationService';
import { Booking } from '@/types/booking';
import { ServiceOrder } from '@/types/serviceOrder';
import { 
  getUserBookings, 
  getBookingById, 
  cancelBooking, 
  createServiceOrderFromBooking,
  updateOrderStatus,
  assignDriverToOrder
} from './serviceOrderService';

/**
 * Create a new booking
 */
export const createBooking = async (bookingData: Partial<Booking>) => {
  try {
    console.log('Creating booking with data:', bookingData);
    
    // Make sure required fields are present
    if (!bookingData.booking_date || !bookingData.origin || !bookingData.destination || 
        !bookingData.reference_code || !bookingData.total_price || !bookingData.user_id) {
      throw new Error('Missing required booking fields');
    }
    
    // Ensure status is a valid enum value
    const validStatus = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
    const status = bookingData.status && validStatus.includes(bookingData.status as any) 
      ? bookingData.status 
      : 'confirmed' as Booking['status'];
    
    // Create properly typed booking object with required fields
    const typedBookingData: Partial<Booking> = {
      ...bookingData,
      status,
      booking_date: bookingData.booking_date,
      origin: bookingData.origin,
      destination: bookingData.destination,
      reference_code: bookingData.reference_code,
      total_price: bookingData.total_price,
      user_id: bookingData.user_id,
      travel_date: bookingData.travel_date || bookingData.booking_date // Ensure travel_date is provided
    };
    
    // Insert booking data
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([typedBookingData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    console.log('Booking created successfully:', booking);
    
    // Log the booking creation
    logInfo('Booking created', 'booking', {
      booking_id: booking.id,
      reference: booking.reference_code
    });
    
    // Send notification (if applicable)
    try {
      await notifyBookingCreated(booking);
    } catch (notifyError) {
      console.error('Error sending booking notification:', notifyError);
    }
    
    return { booking, error: null };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { booking: null, error };
  }
};

// Re-export these functions from serviceOrderService
export { 
  getUserBookings, 
  getBookingById, 
  cancelBooking, 
  createServiceOrderFromBooking,
  updateOrderStatus,
  assignDriverToOrder
};
