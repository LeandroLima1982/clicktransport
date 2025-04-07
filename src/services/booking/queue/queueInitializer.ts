
import { supabase } from '@/integrations/supabase/client';
import { fixInvalidQueuePositions } from '../queueManagementService';
import { logInfo, logError } from '@/services/monitoring/systemLogService';

/**
 * Initializes company queue positions in the database.
 * This function is intended to be run once to set up initial queue positions.
 */
export const initializeCompanyQueues = async (): Promise<void> => {
  try {
    console.log('Initializing company queues...');

    // Fetch all active companies without a queue position
    const { data: companiesWithoutQueue, error: fetchError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('status', 'active')
      .is('queue_position', null);

    if (fetchError) {
      console.error('Error fetching companies without queue position:', fetchError);
      throw fetchError;
    }

    if (companiesWithoutQueue && companiesWithoutQueue.length > 0) {
      console.log(`Found ${companiesWithoutQueue.length} companies without queue positions.`);

      // Assign a unique queue position to each company
      // Include the name field that was missing in the previous implementation
      const updates = companiesWithoutQueue.map((company, index) => ({
        id: company.id,
        name: company.name,
        queue_position: index + 1,
      }));

      // Update the companies with their queue positions
      const { error: updateError } = await supabase
        .from('companies')
        .upsert(updates);

      if (updateError) {
        console.error('Error updating company queue positions:', updateError);
        throw updateError;
      }

      logInfo(`Initialized queue positions for ${companiesWithoutQueue.length} companies`, 'queue');
    } else {
      console.log('No companies without queue positions found.');
    }

    // Fix any invalid queue positions (e.g., duplicates, gaps)
    await fixInvalidQueuePositions();

    console.log('Company queues initialized successfully.');
  } catch (error) {
    console.error('Error initializing company queues:', error);
    logError('Failed to initialize company queues', 'queue', {
      error: String(error)
    });
    throw error;
  }
};
