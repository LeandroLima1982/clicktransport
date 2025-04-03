
import { supabase } from '@/integrations/supabase/client';
import { logInfo, logError } from '../monitoring/systemLogService';
import { 
  getNextCompanyInQueue, 
  updateCompanyQueuePosition, 
  fixInvalidQueuePositions 
} from './queue/queuePositionService';

/**
 * Find and assign a company from queue to a booking
 */
export const assignCompanyFromQueue = async (bookingId: string) => {
  try {
    console.log('Finding company from queue for booking:', bookingId);
    
    // Get the next company in queue
    const { company: nextCompany, error: companyError } = await getNextCompanyInQueue();
    
    if (companyError) {
      throw new Error(`Failed to find company in queue: ${companyError.message}`);
    }
    
    if (!nextCompany) {
      throw new Error('No active companies available in the queue');
    }
    
    const companyId = nextCompany.id;
    const companyName = nextCompany.name;
    
    console.log(`Assigning company ${companyName} (${companyId}) to booking ${bookingId}`);
    
    // Update the booking with the company
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        company_id: companyId,
        company_name: companyName 
      })
      .eq('id', bookingId);
    
    if (updateError) {
      throw new Error(`Failed to update booking with company: ${updateError.message}`);
    }
    
    // Update company queue position
    await updateCompanyQueuePosition(companyId);
    
    logInfo('Company assigned from queue to booking', 'queue', {
      booking_id: bookingId,
      company_id: companyId,
      company_name: companyName
    });
    
    return { companyId, companyName, error: null };
  } catch (error) {
    console.error('Error assigning company from queue:', error);
    logError('Failed to assign company from queue', 'queue', {
      booking_id: bookingId,
      error: String(error)
    });
    return { companyId: null, companyName: null, error };
  }
};

/**
 * Update company queue position after order assignment
 * This is kept for backward compatibility but uses the refactored function internally
 */
export const updateCompanyQueuePosition = async (companyId: string) => {
  return await updateCompanyQueuePosition(companyId);
};

/**
 * Fix any issues with the queue (null or 0 positions)
 * This is kept for backward compatibility but uses the refactored function internally
 */
export const repairQueuePositions = async () => {
  try {
    logInfo('Starting queue position repair', 'queue');
    
    const { fixed, error } = await fixInvalidQueuePositions();
    
    if (error) {
      throw error;
    }
    
    return { fixed, error: null };
  } catch (error) {
    console.error('Error repairing queue positions:', error);
    logError('Failed to repair queue positions', 'queue', { error: String(error) });
    return { fixed: 0, error };
  }
};

// Initialize by fixing any queue position issues
(async function initQueue() {
  try {
    const { fixed } = await repairQueuePositions();
    if (fixed > 0) {
      console.log(`Fixed ${fixed} company queue positions on startup`);
    }
  } catch (err) {
    console.error('Error during queue initialization:', err);
  }
})();

export default {
  assignCompanyFromQueue,
  updateCompanyQueuePosition,
  repairQueuePositions
};
