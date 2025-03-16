
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
      .order('queue_position', { ascending: true, nullsFirst: false })
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
    
    // Check if any companies have null or 0 queue positions and log warning
    const hasInvalidPositions = companies.some(c => c.queue_position === null || c.queue_position === 0);
    if (hasInvalidPositions) {
      console.warn('Some companies have null or 0 queue positions. Consider resetting the queue.');
    }
    
    // Get the company with the lowest queue position or oldest last assignment
    // This ensures we're implementing proper round-robin assignment
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
    
    // First, get the maximum queue position to ensure we're rotating correctly
    const { data: maxPositionResult, error: maxError } = await supabase
      .from('companies')
      .select('queue_position')
      .order('queue_position', { ascending: false })
      .limit(1)
      .single();
    
    if (maxError) {
      console.error('Error fetching max queue position:', maxError);
      // If we can't get the max, just increment by a large number to put at the end
      return updateCompanyQueueWithValue(companyId, 1000);
    }
    
    const maxPosition = maxPositionResult?.queue_position || 0;
    const newPosition = maxPosition + 1;
    
    return updateCompanyQueueWithValue(companyId, newPosition);
  } catch (error) {
    console.error('Error updating company queue position:', error);
    return { success: false, error };
  }
};

/**
 * Helper function to update a company's queue position with a specific value
 */
const updateCompanyQueueWithValue = async (companyId: string, newPosition: number) => {
  try {
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
    
    console.log(`Company ${companyId} queue position updated to ${newPosition}`);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateCompanyQueueWithValue:', error);
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
    
    return { companies: data || [], error: null };
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
    
    // Get all active companies to set incremental queue positions
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('id')
      .eq('status', 'active')
      .order('name', { ascending: true });
      
    if (fetchError) {
      console.error('Error fetching companies for queue reset:', fetchError);
      return { success: false, error: fetchError };
    }
    
    if (!companies || companies.length === 0) {
      console.log('No active companies found for queue reset');
      return { success: true, error: null };
    }
    
    // Assign incremental queue positions to ensure proper rotation
    for (let i = 0; i < companies.length; i++) {
      const { error } = await supabase
        .from('companies')
        .update({ 
          queue_position: i + 1,
          // Only reset last_order_assigned if we're doing a full reset
          last_order_assigned: i === 0 ? new Date().toISOString() : null
        })
        .eq('id', companies[i].id);
        
      if (error) {
        console.error(`Error updating queue position for company ${companies[i].id}:`, error);
        // Continue with other companies even if one fails
      }
    }
    
    console.log(`Queue positions reset for ${companies.length} companies`);
    toast.success(`Fila reiniciada para ${companies.length} empresas`);
    return { success: true, error: null };
  } catch (error) {
    console.error('Error resetting company queue positions:', error);
    return { success: false, error };
  }
};

/**
 * Fix invalid queue positions (0 or null) for companies
 * This is a targeted fix for companies with problematic queue positions
 */
export const fixInvalidQueuePositions = async () => {
  try {
    console.log('Fixing invalid queue positions for companies');
    
    // Get the maximum queue position currently in use
    const { data: maxPositionResult, error: maxError } = await supabase
      .from('companies')
      .select('queue_position')
      .order('queue_position', { ascending: false })
      .limit(1)
      .single();
    
    if (maxError) {
      console.error('Error fetching max queue position:', maxError);
      return { success: false, error: maxError, fixed: 0 };
    }
    
    const maxPosition = maxPositionResult?.queue_position || 0;
    let nextPosition = maxPosition + 1;
    
    // Find companies with null or 0 queue positions
    const { data: invalidCompanies, error: fetchError } = await supabase
      .from('companies')
      .select('id, name')
      .or('queue_position.is.null,queue_position.eq.0')
      .eq('status', 'active');
      
    if (fetchError) {
      console.error('Error fetching companies with invalid queue positions:', fetchError);
      return { success: false, error: fetchError, fixed: 0 };
    }
    
    if (!invalidCompanies || invalidCompanies.length === 0) {
      console.log('No companies with invalid queue positions found');
      return { success: true, error: null, fixed: 0 };
    }
    
    console.log(`Found ${invalidCompanies.length} companies with invalid queue positions`);
    
    // Fix each invalid company with an incremental position
    let fixed = 0;
    for (const company of invalidCompanies) {
      const { error } = await supabase
        .from('companies')
        .update({ queue_position: nextPosition })
        .eq('id', company.id);
        
      if (error) {
        console.error(`Error fixing queue position for company ${company.id}:`, error);
      } else {
        console.log(`Fixed queue position for company ${company.name} to ${nextPosition}`);
        fixed++;
        nextPosition++;
      }
    }
    
    return { success: true, error: null, fixed };
  } catch (error) {
    console.error('Error fixing invalid queue positions:', error);
    return { success: false, error, fixed: 0 };
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
    
    // Get the last 10 service orders to check assignment pattern
    const { data: recentOrders, error: ordersError } = await supabase
      .from('service_orders')
      .select('id, company_id, created_at, notes, status')
      .order('created_at', { ascending: false })
      .limit(10);
      
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
        .select('id, created_at, notes, status')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      // Get unfinished orders count (pending or in progress)
      const { count: unfinishedCount, error: unfinishedError } = await supabase
        .from('service_orders')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .in('status', ['pending', 'in_progress']);
      
      return {
        ...company,
        order_count: countError ? 'error' : orderCount,
        latest_order: (latestError || !latestOrder || latestOrder.length === 0) ? null : latestOrder[0],
        unfinished_orders: unfinishedError ? 'error' : unfinishedCount
      };
    }));
    
    // Get overall statistics
    const ordersByStatusQuery = await supabase
      .from('service_orders')
      .select('status')
      .order('created_at', { ascending: false });
      
    const ordersByStatus = ordersByStatusQuery.data || [];
    
    // Calculate status distribution
    const statusCounts = ordersByStatus.reduce((acc: {[key: string]: number}, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    return { 
      success: true, 
      data: {
        companies: companyDiagnostics,
        recentOrders: recentOrders || [],
        status_distribution: statusCounts,
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
  fixInvalidQueuePositions,
  getQueueDiagnostics
};
