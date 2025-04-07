
import { supabase } from '@/integrations/supabase/client';
import { logInfo, logError } from '../monitoring/systemLogService';

/**
 * Assign a company from the queue to a booking
 */
export const assignCompanyFromQueue = async (bookingId: string) => {
  try {
    console.log(`Assigning company from queue to booking ${bookingId}...`);
    
    // Check if booking exists and doesn't already have a company
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status, origin, destination')
      .eq('id', bookingId)
      .single();
    
    if (bookingError) {
      console.error('Error fetching booking:', bookingError);
      return { companyId: null, error: bookingError };
    }
    
    if (!booking) {
      const noBookingError = new Error(`Booking ${bookingId} not found`);
      console.error(noBookingError);
      return { companyId: null, error: noBookingError };
    }
    
    // Get the next company in the queue
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name, queue_position')
      .eq('status', 'active')
      .order('queue_position', { ascending: true })
      .limit(1);
    
    if (companyError) {
      console.error('Error fetching companies:', companyError);
      return { companyId: null, error: companyError };
    }
    
    if (!companies || companies.length === 0) {
      const noCompaniesError = new Error('No active companies available in queue');
      console.error(noCompaniesError);
      return { companyId: null, error: noCompaniesError };
    }
    
    const company = companies[0];
    console.log(`Selected company from queue: ${company.name} (${company.id}) at position ${company.queue_position}`);
    
    // Update the booking with the selected company
    const { error: updateBookingError } = await supabase
      .from('bookings')
      .update({
        company_id: company.id,
        company_name: company.name
      })
      .eq('id', bookingId);
    
    if (updateBookingError) {
      console.error('Error updating booking with company:', updateBookingError);
      return { companyId: null, error: updateBookingError };
    }
    
    // Update the company's queue position (move to the end)
    await updateCompanyQueuePosition(company.id);
    
    logInfo(`Assigned company ${company.name} to booking ${bookingId}`, 'queue', {
      booking_id: bookingId,
      company_id: company.id
    });
    
    return { companyId: company.id, error: null };
  } catch (error) {
    console.error('Error assigning company from queue:', error);
    logError('Failed to assign company from queue to booking', 'queue', {
      booking_id: bookingId,
      error: String(error)
    });
    return { companyId: null, error };
  }
};

/**
 * Update a company's queue position by moving it to the end of the queue
 */
export const updateCompanyQueuePosition = async (companyId: string) => {
  try {
    console.log(`Updating queue position for company ${companyId}...`);
    
    // Get the highest current queue position
    const { data: maxPositionData, error: maxPositionError } = await supabase
      .from('companies')
      .select('queue_position')
      .order('queue_position', { ascending: false })
      .limit(1)
      .single();
    
    if (maxPositionError) {
      console.error('Error finding highest queue position:', maxPositionError);
      throw maxPositionError;
    }
    
    const newPosition = (maxPositionData?.queue_position || 0) + 1;
    console.log(`Moving company ${companyId} to queue position ${newPosition}`);
    
    // Update the company's position
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        queue_position: newPosition,
        last_order_assigned: new Date().toISOString()
      })
      .eq('id', companyId);
    
    if (updateError) {
      console.error('Error updating company queue position:', updateError);
      throw updateError;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating company queue position:', error);
    logError('Failed to update company queue position', 'queue', {
      company_id: companyId,
      error: String(error)
    });
    return { success: false, error };
  }
};

/**
 * Fix any invalid queue positions (duplicates, gaps, etc.)
 */
export const fixInvalidQueuePositions = async () => {
  try {
    console.log('Fixing invalid queue positions...');
    
    // Get all active companies
    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('id, name, queue_position')
      .eq('status', 'active')
      .order('queue_position', { ascending: true });
    
    if (companyError) {
      console.error('Error fetching companies for queue fix:', companyError);
      throw companyError;
    }
    
    if (!companies || companies.length === 0) {
      console.log('No active companies found to fix queue positions');
      return { success: true, error: null };
    }
    
    // Reassign queue positions sequentially
    const updates = companies.map((company, index) => {
      return {
        id: company.id,
        name: company.name, // Include name property to satisfy the type requirement
        queue_position: index + 1
      };
    });
    
    // Update all companies with their new positions
    // Process one by one to avoid conflicts
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('companies')
        .update({ queue_position: update.queue_position })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`Error updating queue position for company ${update.id}:`, updateError);
      }
    }
    
    logInfo(`Fixed queue positions for ${companies.length} companies`, 'queue');
    return { success: true, error: null };
  } catch (error) {
    console.error('Error fixing queue positions:', error);
    logError('Failed to fix company queue positions', 'queue', {
      error: String(error)
    });
    return { success: false, error };
  }
};
