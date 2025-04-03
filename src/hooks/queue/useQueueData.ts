
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

export const useQueueData = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchCompanies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('queue_position', { ascending: true });
      
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      setError(error.message || 'Falha ao carregar empresas');
      toast.error('Falha ao carregar empresas', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    companies,
    isLoading,
    error,
    fetchCompanies
  };
};
