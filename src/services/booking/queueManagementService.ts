
import { supabase } from '@/integrations/supabase/client';
import { logInfo, logError } from '../monitoring/systemLogService';

/**
 * Find and assign a company from queue to a booking
 */
export const assignCompanyFromQueue = async (bookingId: string) => {
  try {
    console.log('Finding company from queue for booking:', bookingId);
    
    // Get the next company in queue
    const { data: nextCompany, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('status', 'active')
      .order('queue_position', { ascending: true })
      .limit(1);
    
    if (companyError) {
      throw new Error(`Failed to find company in queue: ${companyError.message}`);
    }
    
    if (!nextCompany || nextCompany.length === 0) {
      throw new Error('No active companies available in the queue');
    }
    
    const companyId = nextCompany[0].id;
    const companyName = nextCompany[0].name;
    
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
 */
export const updateCompanyQueuePosition = async (companyId: string) => {
  try {
    console.log(`Updating queue position for company ${companyId}`);
    
    // Get highest queue position
    const { data: maxPositionResult, error: maxPosError } = await supabase
      .from('companies')
      .select('queue_position')
      .order('queue_position', { ascending: false })
      .limit(1);
    
    if (maxPosError) {
      throw new Error(`Failed to get max queue position: ${maxPosError.message}`);
    }
    
    const maxPosition = maxPositionResult && maxPositionResult.length > 0 
      ? maxPositionResult[0].queue_position
      : 0;
    
    // Move company to the end of the queue
    const newPosition = Math.max(1, maxPosition + 1);
    
    // Update company queue position
    const { error: updateError } = await supabase
      .from('companies')
      .update({
        queue_position: newPosition,
        last_order_assigned: new Date().toISOString()
      })
      .eq('id', companyId);
    
    if (updateError) {
      throw new Error(`Failed to update company queue position: ${updateError.message}`);
    }
    
    logInfo('Updated company queue position', 'queue', {
      company_id: companyId,
      new_position: newPosition
    });
    
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
 * Fix any issues with the queue (null or 0 positions)
 */
export const repairQueuePositions = async () => {
  try {
    logInfo('Starting queue position repair', 'queue');
    
    // First, identify companies with invalid positions
    const { data: invalidCompanies, error: fetchError } = await supabase
      .from('companies')
      .select('id, name')
      .or('queue_position.is.null,queue_position.eq.0')
      .eq('status', 'active');
    
    if (fetchError) {
      throw new Error(`Failed to fetch companies with invalid positions: ${fetchError.message}`);
    }
    
    if (!invalidCompanies || invalidCompanies.length === 0) {
      console.log('No invalid queue positions found');
      return { fixed: 0, error: null };
    }
    
    console.log(`Found ${invalidCompanies.length} companies with invalid queue positions`);
    
    // Get the current maximum queue position
    const { data: maxPosResult, error: maxPosError } = await supabase
      .from('companies')
      .select('queue_position')
      .not('queue_position', 'is', null)
      .order('queue_position', { ascending: false })
      .limit(1);
    
    if (maxPosError) {
      throw new Error(`Failed to get max queue position: ${maxPosError.message}`);
    }
    
    // Start position for fixes
    let nextPosition = maxPosResult && maxPosResult.length > 0 
      ? (maxPosResult[0].queue_position || 0) + 1
      : 1;
    
    // Fix each invalid company
    for (const company of invalidCompanies) {
      const { error: updateError } = await supabase
        .from('companies')
        .update({ queue_position: nextPosition })
        .eq('id', company.id);
      
      if (updateError) {
        console.error(`Failed to update queue position for company ${company.id}:`, updateError);
      } else {
        console.log(`Fixed queue position for company ${company.name} (${company.id}) to ${nextPosition}`);
        nextPosition++;
      }
    }
    
    logInfo('Queue position repair completed', 'queue', {
      fixed_count: invalidCompanies.length,
      companies: invalidCompanies.map(c => c.name).join(', ')
    });
    
    return { fixed: invalidCompanies.length, error: null };
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
