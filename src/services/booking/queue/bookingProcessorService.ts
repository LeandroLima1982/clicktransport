
import { supabase } from '@/integrations/supabase/client';
import { createServiceOrderFromBooking } from '../serviceOrderCreationService';
import { updateCompanyQueuePosition } from './queuePositionService';
import { logInfo, logError } from '@/services/monitoring/systemLogService';
import { Booking, BookingStatus } from '@/types/booking';

/**
 * Process unassigned bookings by assigning companies and creating service orders
 */
export const processUnassignedBookings = async (): Promise<{
  processed: number;
  errors: number;
}> => {
  console.log('Starting to process unassigned bookings...');
  let processed = 0;
  let errors = 0;
  
  try {
    // Get bookings that are confirmed but don't have a company or service order
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'confirmed')
      .is('has_service_order', false)
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      console.error('Error fetching unassigned bookings:', fetchError);
      throw fetchError;
    }
    
    console.log(`Found ${bookings?.length || 0} unassigned bookings to process`);
    
    if (!bookings || bookings.length === 0) {
      return { processed: 0, errors: 0 };
    }
    
    // Get active companies sorted by queue position
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, queue_position')
      .eq('status', 'active')
      .order('queue_position', { ascending: true });
    
    if (companiesError || !companies || companies.length === 0) {
      console.error('Error fetching active companies:', companiesError);
      throw new Error('No active companies available for assignment');
    }
    
    // Process each booking
    for (const booking of bookings) {
      try {
        console.log(`Processing booking: ${booking.id} (${booking.reference_code})`);
        
        // Select the company at the top of the queue
        const selectedCompany = companies[0];
        
        // Assign the company to the booking
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ 
            company_id: selectedCompany.id,
            company_name: selectedCompany.name
          })
          .eq('id', booking.id);
        
        if (updateError) {
          console.error('Error updating booking with company:', updateError);
          errors++;
          continue;
        }
        
        // Update the booking object with company info for service order creation
        const updatedBooking: Booking = {
          ...booking,
          company_id: selectedCompany.id,
          company_name: selectedCompany.name,
          status: booking.status as BookingStatus
        };
        
        // Create a service order for this booking
        const { serviceOrder, error: serviceOrderError } = await createServiceOrderFromBooking(updatedBooking);
        
        if (serviceOrderError) {
          console.error('Error creating service order:', serviceOrderError);
          errors++;
          continue;
        }
        
        // Update this company's queue position to move it to the end
        await updateCompanyQueuePosition(selectedCompany.id);
        
        // Rotate the companies array to simulate updating queue positions
        companies.push(companies.shift()!);
        
        // Log successful processing
        logInfo(`Processed booking ${booking.reference_code}`, 'booking_processor', {
          booking_id: booking.id,
          company_id: selectedCompany.id,
          service_order_id: serviceOrder?.id
        });
        
        processed++;
      } catch (bookingError) {
        console.error(`Error processing booking ${booking.id}:`, bookingError);
        logError('Failed to process booking', 'booking_processor', {
          booking_id: booking.id,
          error: String(bookingError)
        });
        errors++;
      }
    }
    
  } catch (error) {
    console.error('Error in booking processor:', error);
    logError('Booking processor failed', 'booking_processor', {
      error: String(error)
    });
    throw error;
  }
  
  console.log(`Booking processor completed. Processed: ${processed}, Errors: ${errors}`);
  return { processed, errors };
};
