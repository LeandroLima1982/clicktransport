
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
  fixed: number;
  invalid_fixed: number;
  duplicate_fixed: number;
};

type QueueHealthResponse = {
  health_score: number;
  invalid_positions: number;
  duplicate_positions: number;
  active_companies: number;
  unprocessed_bookings: number;
  unlinked_orders: number;
  overall_health_score: number;
};

/**
 * Gets the next company in the queue for service order assignment
 * Uses a transaction to ensure queue integrity
 */
export const getNextCompanyInQueue = async () => {
  try {
    console.log('Finding next company in queue for assignment');
    
    // Call the RPC function to get the next company using a generic type for correct typing
    const response = await supabase.functions.invoke('get_next_company_in_queue', {
      method: 'POST',
      body: {}
    });
    
    if (response.error) {
      console.error('Error finding next company in queue:', response.error);
      throw response.error;
    }
    
    const data = response.data as NextCompanyResponse;
    
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
export const updateCompanyQueuePosition = async (companyId: string, bookingId?: string) => {
  try {
    console.log(`Updating queue position for company ${companyId}`);
    
    // Use a secure RPC function to update the queue position atomically
    const response = await supabase.functions.invoke('update_company_queue_position', {
      method: 'POST',
      body: { company_id: companyId, booking_id: bookingId }
    });
    
    if (response.error) {
      console.error('Error updating company queue position:', response.error);
      return { success: false, error: response.error };
    }
    
    const data = response.data as UpdatePositionResponse;
    
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
    const response = await supabase.functions.invoke('reset_company_queue_positions', {
      method: 'POST',
      body: {}
    });
    
    if (response.error) {
      console.error('Error resetting company queue positions:', response.error);
      return { success: false, error: response.error };
    }
    
    const data = response.data as ResetQueueResponse;
    
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
 * Now includes handling for duplicate positions
 */
export const fixInvalidQueuePositions = async () => {
  try {
    console.log('Fixing invalid queue positions');
    
    // Call the Edge Function that handles both invalid and duplicate positions
    const response = await supabase.functions.invoke('fix_invalid_queue_positions', {
      method: 'POST',
      body: {}
    });
    
    if (response.error) {
      console.error('Error fixing invalid queue positions:', response.error);
      return { success: false, error: response.error, fixed: 0 };
    }
    
    const data = response.data as FixPositionsResponse;
    
    if (!data) {
      return { success: false, error: new Error('No response from fix function'), fixed: 0 };
    }
    
    console.log(`Fixed ${data.fixed} invalid queue positions (${data.invalid_fixed} nulls/zeros, ${data.duplicate_fixed} duplicates)`);
    return { 
      success: true, 
      error: null, 
      fixed: data.fixed,
      invalid_fixed: data.invalid_fixed,
      duplicate_fixed: data.duplicate_fixed
    };
  } catch (error) {
    console.error('Error fixing invalid queue positions:', error);
    return { success: false, error, fixed: 0 };
  }
};

/**
 * Gets comprehensive queue health metrics
 */
export const getQueueHealthMetrics = async () => {
  try {
    console.log('Getting queue health metrics');
    
    const response = await supabase.functions.invoke('check_queue_health', {
      method: 'POST',
      body: {}
    });
    
    if (response.error) {
      console.error('Error getting queue health metrics:', response.error);
      return { 
        success: false, 
        error: response.error,
        health: null
      };
    }
    
    const health = response.data as QueueHealthResponse;
    
    return { 
      success: true, 
      error: null, 
      health
    };
  } catch (error) {
    console.error('Error getting queue health metrics:', error);
    return { success: false, error, health: null };
  }
};

/**
 * Diagnoses and automatically fixes queue issues
 */
export const autoFixQueueIssues = async () => {
  try {
    // Step 1: Get current health metrics
    const { success: healthSuccess, health, error: healthError } = await getQueueHealthMetrics();
    
    if (!healthSuccess || !health) {
      toast.error('Falha ao verificar métricas de saúde da fila');
      return { success: false, error: healthError };
    }
    
    let actionsPerformed = [];
    let needsFixes = false;
    
    // Step 2: Check if we need to fix invalid or duplicate positions
    if (health.invalid_positions > 0 || health.duplicate_positions > 0) {
      needsFixes = true;
      const { success: fixSuccess, fixed, error: fixError } = await fixInvalidQueuePositions();
      
      if (!fixSuccess) {
        toast.error('Falha ao corrigir posições de fila inválidas');
        return { success: false, error: fixError };
      }
      
      actionsPerformed.push(`Corrigidas ${fixed} posições de fila`);
    }
    
    // Step 3: If overall health is still below 70, consider resetting the queue
    if (health.overall_health_score < 70 && health.active_companies > 0) {
      needsFixes = true;
      const { success: resetSuccess, companies_updated, error: resetError } = await resetCompanyQueuePositions();
      
      if (!resetSuccess) {
        toast.error('Falha ao reiniciar posições de fila');
        return { success: false, error: resetError };
      }
      
      actionsPerformed.push(`Fila reiniciada para ${companies_updated} empresas`);
    }
    
    if (!needsFixes) {
      toast.info('Não foram encontrados problemas na fila');
      return { success: true, actions: ['Nenhuma ação necessária'] };
    }
    
    // Verify improvements
    const { success: verifySuccess, health: updatedHealth } = await getQueueHealthMetrics();
    
    if (verifySuccess && updatedHealth) {
      const improvement = updatedHealth.overall_health_score - health.overall_health_score;
      
      if (improvement > 0) {
        toast.success(`Saúde da fila melhorada em ${improvement.toFixed(1)}%`);
      } else {
        toast.warning('Ações realizadas, mas sem melhoria significativa na saúde da fila');
      }
    }
    
    return { success: true, actions: actionsPerformed };
  } catch (error) {
    console.error('Error in autoFixQueueIssues:', error);
    toast.error('Erro ao tentar corrigir problemas de fila');
    return { success: false, error, actions: [] };
  }
};

export const getQueueDiagnostics = async () => {
  try {
    // Get queue health metrics
    const { success: healthSuccess, health, error: healthError } = await getQueueHealthMetrics();
    
    if (!healthSuccess || !health) {
      return { success: false, data: null, error: healthError || new Error('Failed to get queue health metrics') };
    }
    
    // Get queue status for companies
    const { companies, error: companiesError } = await getCompanyQueueStatus();
    
    if (companiesError) {
      return { success: false, data: null, error: companiesError };
    }
    
    // Combine data
    const diagnosticsData = {
      health,
      companies: companies.map(company => ({
        ...company,
        hasValidPosition: company.queue_position !== null && company.queue_position > 0,
        lastAssignedFormatted: company.last_order_assigned 
          ? new Date(company.last_order_assigned).toLocaleString() 
          : 'Nunca'
      })),
      problemCompanies: companies.filter(c => 
        c.status === 'active' && (c.queue_position === null || c.queue_position === 0)
      ).length
    };
    
    return { success: true, data: diagnosticsData, error: null };
  } catch (error) {
    console.error('Error getting queue diagnostics:', error);
    return { success: false, data: null, error };
  }
};
