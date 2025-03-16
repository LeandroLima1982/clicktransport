
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Company = {
  id: string;
  name: string;
  status: string;
  queue_position: number | null;
  last_order_assigned: string | null;
  order_count?: number;
};

type DiagnosticsData = {
  queue_status: {
    total_companies: number;
    active_companies: number;
    null_queue_position_count: number;
    zero_queue_position_count: number;
  };
  companies: Company[];
};

export const useCompanyQueue = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  
  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('queue_position', { ascending: true });
      
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
  
  const runDiagnostics = useCallback(async () => {
    try {
      setDiagnosticsLoading(true);
      
      // Get all companies with service order counts
      const { data: companiesWithOrders, error: companiesError } = await supabase
        .from('companies')
        .select(`
          id, 
          name, 
          status, 
          queue_position, 
          last_order_assigned
        `);
      
      if (companiesError) throw companiesError;
      
      // Count orders for each company
      const companyOrderCounts: Record<string, number> = {};
      const { data: orders, error: ordersError } = await supabase
        .from('service_orders')
        .select('company_id');
      
      if (ordersError) throw ordersError;
      
      orders?.forEach(order => {
        companyOrderCounts[order.company_id] = (companyOrderCounts[order.company_id] || 0) + 1;
      });
      
      // Analyze queue positions
      const nullQueueCount = companiesWithOrders.filter(c => c.queue_position === null).length;
      const zeroQueueCount = companiesWithOrders.filter(c => c.queue_position === 0).length;
      const activeCompanies = companiesWithOrders.filter(c => c.status === 'active').length;
      
      // Add order counts to companies
      const companiesWithStats = companiesWithOrders.map(company => ({
        ...company,
        order_count: companyOrderCounts[company.id] || 0
      }));
      
      setDiagnostics({
        queue_status: {
          total_companies: companiesWithOrders.length,
          active_companies: activeCompanies,
          null_queue_position_count: nullQueueCount,
          zero_queue_position_count: zeroQueueCount
        },
        companies: companiesWithStats
      });
      
    } catch (error) {
      console.error('Error running diagnostics:', error);
      toast.error('Falha ao executar diagnóstico');
    } finally {
      setDiagnosticsLoading(false);
    }
  }, []);
  
  return {
    companies,
    isLoading,
    fetchCompanies,
    fixQueuePositions,
    resetQueue,
    moveCompanyToEnd,
    diagnostics,
    diagnosticsLoading,
    runDiagnostics
  };
};
