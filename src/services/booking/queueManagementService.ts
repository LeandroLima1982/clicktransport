
// Replace with direct implementation instead of importing (to avoid conflicts)
// import { updateCompanyQueuePosition, getNextCompanyInQueue, fixInvalidQueuePositions } from './queue/queuePositionService';
import { supabase } from '@/integrations/supabase/client';
import { logInfo, logError } from '@/services/monitoring/systemLogService';

// Implement functions directly here instead of importing
export const getNextCompanyInQueue = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, queue_position')
      .eq('status', 'active')
      .order('queue_position', { ascending: true })
      .limit(1);
    
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting next company in queue:', error);
    return null;
  }
};

export const fixInvalidQueuePositions = async (): Promise<boolean> => {
  try {
    console.log('Fixing invalid queue positions');
    
    // Get all active companies
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('id, queue_position')
      .eq('status', 'active')
      .order('queue_position', { ascending: true });
    
    if (fetchError) throw fetchError;
    
    if (!companies || companies.length === 0) {
      return true; // No companies to fix
    }
    
    // Check for invalid positions and fix if needed
    const updates = [];
    let position = 1;
    
    for (const company of companies) {
      if (company.queue_position !== position) {
        updates.push({
          id: company.id,
          queue_position: position
        });
      }
      position++;
    }
    
    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from('companies')
        .upsert(updates);
      
      if (updateError) throw updateError;
      
      logInfo(`Fixed queue positions for ${updates.length} companies`, 'queue');
    }
    
    return true;
  } catch (error) {
    console.error('Error fixing queue positions:', error);
    logError('Failed to fix queue positions', 'queue', {
      error: String(error)
    });
    return false;
  }
};

export const updateCompanyQueuePosition = async (companyId: string): Promise<boolean> => {
  try {
    console.log(`Updating queue position for company: ${companyId}`);
    
    // First get the current queue data
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('id, queue_position, last_order_assigned')
      .order('queue_position', { ascending: true });
      
    if (fetchError) {
      console.error('Error fetching queue data:', fetchError);
      return false;
    }
    
    if (!companies || companies.length === 0) {
      console.warn('No companies found for queue management');
      return false;
    }
    
    // Find the company that just got an order
    const assignedCompanyIndex = companies.findIndex(c => c.id === companyId);
    if (assignedCompanyIndex === -1) {
      console.error('Company not found in queue:', companyId);
      return false;
    }
    
    const assignedCompany = companies[assignedCompanyIndex];
    
    // Move this company to the end of the queue
    const maxPosition = Math.max(...companies.map(c => c.queue_position || 0));
    const newQueuePosition = maxPosition + 1;
    
    // Update the company record
    const { error: updateError } = await supabase
      .from('companies')
      .update({ 
        queue_position: newQueuePosition,
        last_order_assigned: new Date().toISOString()
      })
      .eq('id', companyId);
    
    if (updateError) {
      console.error('Error updating company queue position:', updateError);
      return false;
    }
    
    logInfo(`Company ${companyId} moved to end of queue (position ${newQueuePosition})`, 
      'queue', 
      { company_id: companyId, old_position: assignedCompany.queue_position, new_position: newQueuePosition }
    );
    
    return true;
  } catch (error) {
    console.error('Exception in updateCompanyQueuePosition:', error);
    logError('Failed to update company queue position', 'queue', {
      company_id: companyId,
      error: String(error)
    });
    return false;
  }
};
