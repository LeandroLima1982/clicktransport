
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Company = {
  id: string;
  name: string;
  status: string;
  queue_position: number | null;
  last_order_assigned: string | null;
};

export const useCompanyQueue = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('queue_position', { ascending: true, nullsLast: true });
      
      if (error) throw error;
      
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Falha ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const fixQueuePositions = useCallback(async () => {
    try {
      // We need to reorganize the queue positions to be sequential
      const { data: activeCompanies, error: fetchError } = await supabase
        .from('companies')
        .select('id, status')
        .eq('status', 'active')
        .order('queue_position', { ascending: true, nullsLast: true });
        
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
    } catch (error) {
      console.error('Error fixing queue positions:', error);
      toast.error('Falha ao corrigir posições da fila');
    }
  }, [fetchCompanies]);
  
  const resetQueue = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error('Error resetting queue:', error);
      toast.error('Falha ao resetar fila');
    }
  }, [fetchCompanies]);
  
  const moveCompanyToEnd = useCallback(async (companyId: string) => {
    try {
      // Get current highest queue position
      const { data: maxResult, error: maxError } = await supabase
        .from('companies')
        .select('queue_position')
        .eq('status', 'active')
        .order('queue_position', { ascending: false })
        .limit(1)
        .single();
        
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
    } catch (error) {
      console.error('Error moving company to end of queue:', error);
      toast.error('Falha ao mover empresa para o fim da fila');
    }
  }, [fetchCompanies]);
  
  return {
    companies,
    isLoading,
    fetchCompanies,
    fixQueuePositions,
    resetQueue,
    moveCompanyToEnd
  };
};
