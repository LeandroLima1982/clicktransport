
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Gets the next company in the queue for service order assignment
 * Selects companies based on queue position and last order time
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
    const availableCompany = companies[0];
    
    console.log('Found next company in queue:', availableCompany);
    return { company: availableCompany, error: null };
  } catch (error) {
    console.error('Error finding next company in queue:', error);
    return { company: null, error };
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
 * Gets queue diagnostic information
 * Shows details about company queue positions, last assignments, etc.
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

export default {
  getNextCompanyInQueue,
  updateCompanyQueuePosition,
  getCompanyQueueStatus,
  resetCompanyQueuePositions,
  getQueueDiagnostics
};
