
import { supabase } from '@/integrations/supabase/client';
import { logInfo, logError } from '../../monitoring/systemLogService';

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
