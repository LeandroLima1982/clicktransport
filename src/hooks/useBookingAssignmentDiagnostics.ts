
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SystemLog = {
  id: string;
  message: string;
  category: 'queue' | 'order' | 'driver' | 'company' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  details?: any;
  created_at: string;
};

export const useBookingAssignmentDiagnostics = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .in('category', ['queue', 'order'])
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      setLogs(data as SystemLog[]);
    } catch (error) {
      console.error('Error fetching system logs:', error);
      toast.error('Falha ao carregar logs de sistema');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const clearLogs = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('system_logs')
        .delete()
        .in('category', ['queue', 'order']);
      
      if (error) throw error;
      
      setLogs([]);
      toast.success('Logs limpos com sucesso');
    } catch (error) {
      console.error('Error clearing system logs:', error);
      toast.error('Falha ao limpar logs de sistema');
    }
  }, []);
  
  return {
    logs,
    isLoading,
    fetchLogs,
    clearLogs
  };
};
