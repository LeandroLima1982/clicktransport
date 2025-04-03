
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useQueueOperations = (fetchCompanies: () => Promise<void>) => {
  const [error, setError] = useState<string | null>(null);
  
  const fixQueuePositions = useCallback(async () => {
    try {
      setError(null);
      // We need to reorganize the queue positions to be sequential
      const { data: activeCompanies, error: fetchError } = await supabase
        .from('companies')
        .select('id, status')
        .eq('status', 'active')
        .order('queue_position', { ascending: true });
        
      if (fetchError) throw fetchError;
      
      // Update each company's queue position
      for (let i = 0; i < activeCompanies.length; i++) {
        const { error: updateError } = await supabase
          .from('companies')
          .update({ queue_position: i + 1 })
          .eq('id', activeCompanies[i].id);
          
        if (updateError) throw updateError;
      }
      
      toast.success('Posições da fila corrigidas com sucesso');
      await fetchCompanies();
    } catch (error: any) {
      console.error('Error fixing queue positions:', error);
      setError(error.message || 'Falha ao corrigir posições da fila');
      toast.error('Falha ao corrigir posições da fila', {
        description: error.message
      });
    }
  }, [fetchCompanies]);
  
  const resetQueue = useCallback(async () => {
    try {
      setError(null);
      // Reset all queue positions based on alphabetical company name
      const { data: activeCompanies, error: fetchError } = await supabase
        .from('companies')
        .select('id')
        .eq('status', 'active')
        .order('name', { ascending: true });
        
      if (fetchError) throw fetchError;
      
      // Update each company's queue position and clear last_order_assigned
      for (let i = 0; i < activeCompanies.length; i++) {
        const { error: updateError } = await supabase
          .from('companies')
          .update({ 
            queue_position: i + 1,
            last_order_assigned: null
          })
          .eq('id', activeCompanies[i].id);
          
        if (updateError) throw updateError;
      }
      
      toast.success('Fila resetada com sucesso');
      await fetchCompanies();
    } catch (error: any) {
      console.error('Error resetting queue:', error);
      setError(error.message || 'Falha ao resetar fila');
      toast.error('Falha ao resetar fila', {
        description: error.message
      });
    }
  }, [fetchCompanies]);
  
  const moveCompanyToEnd = useCallback(async (companyId: string) => {
    try {
      setError(null);
      // Get current highest queue position
      const { data: maxResult, error: maxError } = await supabase
        .from('companies')
        .select('queue_position')
        .eq('status', 'active')
        .order('queue_position', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (maxError) throw maxError;
      
      const maxPosition = maxResult?.queue_position || 0;
      
      // Move company to end of queue
      const { error: updateError } = await supabase
        .from('companies')
        .update({ queue_position: maxPosition + 1 })
        .eq('id', companyId);
        
      if (updateError) throw updateError;
      
      toast.success('Empresa movida para o fim da fila');
      await fetchCompanies();
    } catch (error: any) {
      console.error('Error moving company to end of queue:', error);
      setError(error.message || 'Falha ao mover empresa para o fim da fila');
      toast.error('Falha ao mover empresa para o fim da fila', {
        description: error.message
      });
    }
  }, [fetchCompanies]);
  
  return {
    error,
    fixQueuePositions,
    resetQueue,
    moveCompanyToEnd
  };
};
