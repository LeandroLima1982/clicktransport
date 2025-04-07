import { supabase } from '@/integrations/supabase/client';
import { logInfo, logError } from '@/services/monitoring/systemLogService';

// Export directly from this file instead of re-exporting
export const updateCompanyQueuePosition = async (
  companyId: string, 
  newPosition: number
): Promise<boolean> => {
  try {
    // Update the company's queue position
    const { error } = await supabase
      .from('companies')
      .update({ queue_position: newPosition })
      .eq('id', companyId);
    
    if (error) {
      console.error('Error updating queue position:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Failed to update company queue position:', error);
    return false;
  }
};

// Add the assignCompanyFromQueue function that was missing
export const assignCompanyFromQueue = async (bookingId: string): Promise<string | null> => {
  try {
    console.log(`Assigning company from queue for booking ${bookingId}`);
    
    // Get the first company in the queue
    const { data: companies, error: queueError } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'active')
      .order('queue_position', { ascending: true })
      .limit(1);
    
    if (queueError) {
      console.error('Error getting next company from queue:', queueError);
      return null;
    }
    
    if (!companies || companies.length === 0) {
      console.log('No active companies in queue');
      return null;
    }
    
    const company = companies[0];
    console.log(`Assigning company ${company.id} (${company.name}) to booking ${bookingId}`);
    
    // Update the booking with the assigned company
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        company_id: company.id,
        company_name: company.name,
        status: 'confirmed'
      })
      .eq('id', bookingId);
    
    if (updateError) {
      console.error('Error updating booking with company:', updateError);
      return null;
    }
    
    // Move the company to the end of the queue
    await rotateQueuePosition(company.id);
    
    return company.id;
  } catch (error) {
    console.error('Error assigning company from queue:', error);
    return null;
  }
};

/**
 * Fixes invalid company queue positions in the database.
 * This function reorders companies in the queue to ensure there are no gaps or duplicate positions.
 */
export const fixInvalidQueuePositions = async (): Promise<void> => {
  try {
    console.log('Fixing invalid queue positions...');

    // Fetch all active companies ordered by their queue position
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('id')
      .eq('status', 'active')
      .order('queue_position', { ascending: true });

    if (fetchError) {
      console.error('Error fetching companies for queue reordering:', fetchError);
      throw fetchError;
    }

    if (companies && companies.length > 0) {
      // Reassign queue positions based on the order
      const updates = companies.map((company, index) => ({
        id: company.id,
        queue_position: index + 1,
      }));

      // Update the companies with their new queue positions
      const { error: updateError } = await supabase
        .from('companies')
        .upsert(updates);

      if (updateError) {
        console.error('Error updating company queue positions:', updateError);
        throw updateError;
      }

      logInfo('Successfully fixed invalid queue positions', 'queue');
    } else {
      console.log('No active companies found to reorder the queue.');
    }

    console.log('Invalid queue positions fixed successfully.');
  } catch (error) {
    console.error('Error fixing invalid queue positions:', error);
    logError('Failed to fix invalid queue positions', 'queue', {
      error: String(error)
    });
    throw error;
  }
};

/**
 * Rotates the queue position of a company, moving it to the end of the queue.
 * @param companyId The ID of the company to rotate in the queue.
 */
export const rotateQueuePosition = async (companyId: string): Promise<void> => {
  try {
    console.log(`Rotating queue position for company ${companyId}`);

    // Fetch the current maximum queue position
    const { data: maxQueueData, error: maxQueueError } = await supabase
      .from('companies')
      .select('queue_position')
      .order('queue_position', { ascending: false })
      .limit(1);

    if (maxQueueError) {
      console.error('Error fetching maximum queue position:', maxQueueError);
      throw maxQueueError;
    }

    const maxQueuePosition = maxQueueData && maxQueueData.length > 0 ? maxQueueData[0].queue_position : 0;

    // Fetch the company's current queue position
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('queue_position')
      .eq('id', companyId)
      .single();

    if (companyError) {
      console.error('Error fetching company queue position:', companyError);
      throw companyError;
    }

    const currentQueuePosition = companyData ? companyData.queue_position : null;

    if (currentQueuePosition === null) {
      console.warn(`Company ${companyId} has no queue position.`);
      return;
    }

    // Update the company's queue position to the end of the queue
    const newQueuePosition = maxQueuePosition + 1;
    const { error: updateError } = await supabase
      .from('companies')
      .update({ queue_position: newQueuePosition })
      .eq('id', companyId);

    if (updateError) {
      console.error('Error updating company queue position:', updateError);
      throw updateError;
    }

    logInfo(`Rotated queue position for company ${companyId} from ${currentQueuePosition} to ${newQueuePosition}`, 'queue');
    console.log(`Company ${companyId} rotated to position ${newQueuePosition}`);
  } catch (error) {
    console.error('Error rotating company queue position:', error);
    logError(`Failed to rotate queue position for company ${companyId}`, 'queue', {
      error: String(error)
    });
    throw error;
  }
};
