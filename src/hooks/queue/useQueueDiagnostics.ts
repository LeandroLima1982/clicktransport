
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

export const useQueueDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const runDiagnostics = useCallback(async () => {
    try {
      setDiagnosticsLoading(true);
      setError(null);
      
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
      
    } catch (error: any) {
      console.error('Error running diagnostics:', error);
      setError(error.message || 'Falha ao executar diagnóstico');
      toast.error('Falha ao executar diagnóstico', {
        description: error.message
      });
    } finally {
      setDiagnosticsLoading(false);
    }
  }, []);
  
  return {
    diagnostics,
    diagnosticsLoading,
    error,
    runDiagnostics
  };
};
