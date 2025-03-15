
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type definitions for RPC function responses
type NextCompanyResponse = {
  company_id: string;
  success: boolean;
};

type UpdatePositionResponse = {
  success: boolean;
  new_position: number;
};

type ResetQueueResponse = {
  success: boolean;
  companies_updated: number;
};

type FixPositionsResponse = {
  success: boolean;
  fixed_count: number;
};

/**
 * Gets the next company in the queue for service order assignment
 * Uses a transaction to ensure queue integrity
 */
export const getNextCompanyInQueue = async () => {
  try {
    console.log('Finding next company in queue for assignment');
    
    // Call the RPC function to get the next company
    const { data, error } = await supabase.rpc('get_next_company_in_queue', {}, {
      count: 'exact'
    }) as unknown as {
      data: NextCompanyResponse | null;
      error: any;
    };
    
    if (error) {
      console.error('Error finding next company in queue:', error);
      throw error;
    }
    
    if (!data || !data.success || !data.company_id) {
      console.error('No active companies found to assign the order');
      return { company: null, error: new Error('No active companies found') };
    }
    
    // Fetch the full company details now that we have the ID
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, queue_position, last_order_assigned, status')
      .eq('id', data.company_id)
      .single();
      
    if (companyError) {
      console.error('Error fetching company details:', companyError);
      return { company: null, error: companyError };
    }
    
    console.log('Found next company in queue:', company);
    return { company, error: null };
  } catch (error) {
    console.error('Error finding next company in queue:', error);
    return { company: null, error };
  }
};

/**
 * Updates a company's queue position and last order timestamp
 * This now uses a secure database transaction to ensure proper queue rotation
 */
export const updateCompanyQueuePosition = async (companyId: string) => {
  try {
    console.log(`Updating queue position for company ${companyId}`);
    
    // Use a secure RPC function to update the queue position atomically
    const { data, error } = await supabase.rpc('update_company_queue_position', {
      company_id: companyId
    }, {
      count: 'exact'
    }) as unknown as {
      data: UpdatePositionResponse | null;
      error: any;
    };
    
    if (error) {
      console.error('Error updating company queue position:', error);
      return { success: false, error };
    }
    
    if (!data) {
      return { success: false, error: new Error('No response from update function') };
    }
    
    console.log(`Company ${companyId} queue position updated to ${data.new_position}`);
    return { success: true, error: null, new_position: data.new_position };
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
 * Now uses database transaction to ensure consistency
 */
export const resetCompanyQueuePositions = async () => {
  try {
    console.log('Resetting queue positions for all companies');
    
    // Use a secure RPC function to reset all queue positions atomically
    const { data, error } = await supabase.rpc('reset_company_queue_positions', {}, {
      count: 'exact'
    }) as unknown as {
      data: ResetQueueResponse | null;
      error: any;
    };
    
    if (error) {
      console.error('Error resetting company queue positions:', error);
      return { success: false, error };
    }
    
    if (!data) {
      return { success: false, error: new Error('No response from reset function') };
    }
    
    console.log(`Queue positions reset for ${data.companies_updated} companies`);
    return { success: true, error: null, companies_updated: data.companies_updated };
  } catch (error) {
    console.error('Error resetting company queue positions:', error);
    return { success: false, error };
  }
};

/**
 * Fixes invalid queue positions (0 or null) for companies
 * Now uses a database function to ensure consistency
 */
export const fixInvalidQueuePositions = async () => {
  try {
    console.log('Fixing invalid queue positions for companies');
    
    // Use a secure RPC function to fix invalid queue positions atomically
    const { data, error } = await supabase.rpc('fix_invalid_queue_positions', {}, {
      count: 'exact'
    }) as unknown as {
      data: FixPositionsResponse | null;
      error: any;
    };
    
    if (error) {
      console.error('Error fixing invalid queue positions:', error);
      return { success: false, error, fixed: 0 };
    }
    
    if (!data) {
      return { success: false, error: new Error('No response from fix function'), fixed: 0 };
    }
    
    console.log(`Fixed ${data.fixed_count} companies with invalid queue positions`);
    return { success: true, error: null, fixed: data.fixed_count };
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

/**
 * Ensures a company has valid queue position before assignment
 * Validates and fixes queue position if needed
 */
export const validateCompanyForAssignment = async (companyId: string) => {
  try {
    console.log(`Validating company ${companyId} for assignment`);
    
    // Get company current queue position
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('queue_position, last_order_assigned, status')
      .eq('id', companyId)
      .single();
      
    if (companyError) {
      console.error('Error fetching company for validation:', companyError);
      return { valid: false, error: companyError };
    }
    
    if (company.status !== 'active') {
      console.log(`Company ${companyId} is not active (status: ${company.status})`);
      return { valid: false, error: new Error(`Company is not active: ${company.status}`) };
    }
    
    const hasValidPosition = company.queue_position !== null && company.queue_position > 0;
    
    // If position is invalid, fix it directly
    if (!hasValidPosition) {
      console.log(`Company ${companyId} has invalid queue position: ${company.queue_position}`);
      
      // Call directly to fix just this company
      const { data, error } = await supabase.rpc('fix_company_queue_position', {
        company_id: companyId
      }, {
        count: 'exact'
      }) as unknown as {
        data: UpdatePositionResponse | null;
        error: any;
      };
      
      if (error) {
        console.error('Error fixing company queue position:', error);
        return { valid: false, error };
      }
      
      return { valid: true, fixed: true, error: null };
    }
    
    return { valid: true, fixed: false, error: null };
  } catch (error) {
    console.error('Error validating company for assignment:', error);
    return { valid: false, error };
  }
};

export default {
  getNextCompanyInQueue,
  updateCompanyQueuePosition,
  getCompanyQueueStatus,
  resetCompanyQueuePositions,
  fixInvalidQueuePositions,
  getQueueDiagnostics,
  validateCompanyForAssignment
};
