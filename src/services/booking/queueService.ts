
import { supabase } from '@/integrations/supabase/client';
import { logInfo, logWarning, logError, getSystemLogs } from '../monitoring/systemLogService';

/**
 * Gets the status of all companies in the queue
 */
export const getCompanyQueueStatus = async () => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('queue_position', { ascending: true });
    
    if (error) throw error;
    
    return { companies: data, error: null };
  } catch (error) {
    console.error('Error fetching queue status:', error);
    logError('Falha ao buscar status da fila de empresas', 'queue', { error });
    return { companies: [], error };
  }
};

/**
 * Resets all companies queue positions to match their created_at order
 * This is a full queue reconciliation
 */
export const resetCompanyQueuePositions = async () => {
  try {
    // Log the operation start
    await logInfo('Iniciando reset completo das posições da fila', 'queue');
    
    // Get all companies sorted by created_at
    const { data: companies, error: fetchError } = await supabase
      .from('companies')
      .select('id, created_at')
      .order('created_at', { ascending: true });
    
    if (fetchError) throw fetchError;
    
    // Update each company with a new queue position in sequence
    const updatePromises = companies.map((company, index) => {
      return supabase
        .from('companies')
        .update({ queue_position: index + 1 })
        .eq('id', company.id);
    });
    
    await Promise.all(updatePromises);
    
    // Log the successful operation
    await logInfo('Reset completo das posições da fila finalizado com sucesso', 'queue', {
      total_companies: companies.length
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error resetting queue positions:', error);
    await logError('Falha ao resetar posições da fila', 'queue', { error });
    return { success: false, error };
  }
};

/**
 * Gets the next company in the queue for assigning an order
 * Includes additional validation to ensure a valid company is returned
 */
export const getNextCompanyInQueue = async () => {
  try {
    // Get active companies ordered by queue position
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('status', 'active')
      .order('queue_position', { ascending: true })
      .limit(1);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      // No active companies found
      await logWarning('Nenhuma empresa ativa encontrada para atribuição de ordem', 'queue');
      return { company: null, error: new Error('No active companies found') };
    }
    
    // Validate the company's queue position
    const company = data[0];
    if (company.queue_position === null || company.queue_position === 0) {
      await logWarning('Empresa com posição inválida na fila selecionada para atribuição', 'queue', {
        company_id: company.id,
        company_name: company.name
      });
      
      // Try to fix the position on-the-fly
      await supabase
        .from('companies')
        .update({ queue_position: 1 })
        .eq('id', company.id);
        
      // Get the updated company
      const { data: updatedData, error: updateError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', company.id)
        .single();
        
      if (updateError) throw updateError;
      
      return { company: updatedData, error: null };
    }
    
    return { company: company, error: null };
  } catch (error) {
    console.error('Error getting next company in queue:', error);
    await logError('Erro ao obter próxima empresa na fila', 'queue', { error });
    return { company: null, error };
  }
};

/**
 * Updates a company's queue position after an order is assigned
 * Also includes validation to ensure the queue remains consistent
 */
export const updateCompanyQueuePosition = async (companyId: string) => {
  try {
    // Get the company's current queue position
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('queue_position, name')
      .eq('id', companyId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Get highest queue position
    const { data: maxPositionResult, error: maxPosError } = await supabase
      .from('companies')
      .select('queue_position')
      .order('queue_position', { ascending: false })
      .limit(1)
      .single();
    
    if (maxPosError && maxPosError.code !== 'PGRST116') throw maxPosError;
    
    const maxPosition = maxPositionResult?.queue_position || 0;
    
    // Move this company to the end of the queue
    const newPosition = maxPosition + 1;
    
    const { error: updateError } = await supabase
      .from('companies')
      .update({ 
        queue_position: newPosition,
        last_order_assigned: new Date().toISOString()
      })
      .eq('id', companyId);
    
    if (updateError) throw updateError;
    
    await logInfo('Posição da fila da empresa atualizada', 'queue', {
      company_id: companyId,
      company_name: company.name,
      old_position: company.queue_position,
      new_position: newPosition
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating company queue position:', error);
    await logError('Erro ao atualizar posição da empresa na fila', 'queue', { 
      company_id: companyId,
      error
    });
    return { success: false, error };
  }
};

/**
 * Fixes invalid queue positions (null or 0)
 */
export const fixInvalidQueuePositions = async () => {
  try {
    await logInfo('Iniciando correção de posições de fila inválidas', 'queue');
    
    // Find companies with null or 0 queue positions
    const { data: invalidCompanies, error: fetchError } = await supabase
      .from('companies')
      .select('id, name')
      .or('queue_position.is.null,queue_position.eq.0');
    
    if (fetchError) throw fetchError;
    
    if (!invalidCompanies || invalidCompanies.length === 0) {
      return { fixed: 0, error: null };
    }
    
    // Get highest queue position
    const { data: maxPositionResult, error: maxPosError } = await supabase
      .from('companies')
      .select('queue_position')
      .not('queue_position', 'is', null)
      .order('queue_position', { ascending: false })
      .limit(1)
      .single();
    
    if (maxPosError && maxPosError.code !== 'PGRST116') throw maxPosError;
    
    let startPosition = (maxPositionResult?.queue_position || 0) + 1;
    
    // Fix each invalid company
    const updatePromises = invalidCompanies.map((company, index) => {
      const newPosition = startPosition + index;
      
      return supabase
        .from('companies')
        .update({ queue_position: newPosition })
        .eq('id', company.id);
    });
    
    await Promise.all(updatePromises);
    
    await logInfo('Correção de posições de fila concluída', 'queue', {
      fixed_count: invalidCompanies.length,
      companies: invalidCompanies.map(c => c.name)
    });
    
    return { fixed: invalidCompanies.length, error: null };
  } catch (error) {
    console.error('Error fixing invalid queue positions:', error);
    await logError('Erro ao corrigir posições de fila inválidas', 'queue', { error });
    return { fixed: 0, error };
  }
};

/**
 * Gets diagnostic data about the queue and recent orders
 */
export const getQueueDiagnostics = async () => {
  try {
    // Get companies statistics
    const [
      allCompaniesResult,
      activeCompaniesResult,
      zeroPositionResult,
      nullPositionResult,
      recentOrdersResult
    ] = await Promise.all([
      // Get total company count
      supabase.from('companies').select('id', { count: 'exact' }),
      
      // Get active company count
      supabase.from('companies').select('id', { count: 'exact' }).eq('status', 'active'),
      
      // Get companies with position 0
      supabase.from('companies').select('id', { count: 'exact' }).eq('queue_position', 0),
      
      // Get companies with null position
      supabase.from('companies').select('id', { count: 'exact' }).is('queue_position', null),
      
      // Get recent orders
      supabase.from('service_orders').select('*').order('created_at', { ascending: false }).limit(5)
    ]);
    
    if (allCompaniesResult.error) throw allCompaniesResult.error;
    if (activeCompaniesResult.error) throw activeCompaniesResult.error;
    if (zeroPositionResult.error) throw zeroPositionResult.error;
    if (nullPositionResult.error) throw nullPositionResult.error;
    if (recentOrdersResult.error) throw recentOrdersResult.error;
    
    // Get recent logs
    const { logs: recentLogs } = await getSystemLogs({ 
      category: 'queue', 
      limit: 5 
    });
    
    return {
      success: true,
      data: {
        queue_status: {
          total_companies: allCompaniesResult.count || 0,
          active_companies: activeCompaniesResult.count || 0,
          zero_queue_position_count: zeroPositionResult.count || 0,
          null_queue_position_count: nullPositionResult.count || 0,
        },
        recentOrders: recentOrdersResult.data || [],
        recentLogs: recentLogs || []
      },
      error: null
    };
  } catch (error) {
    console.error('Error getting queue diagnostics:', error);
    return { success: false, data: null, error };
  }
};

export default {
  getCompanyQueueStatus,
  resetCompanyQueuePositions,
  getNextCompanyInQueue,
  updateCompanyQueuePosition,
  fixInvalidQueuePositions,
  getQueueDiagnostics
};
