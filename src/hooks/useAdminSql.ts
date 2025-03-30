
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useAdminSql = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const { userRole } = useAuth();
  
  const executeSQL = async (query: string) => {
    if (userRole !== 'admin') {
      toast.error('Apenas administradores podem executar comandos SQL');
      throw new Error('Only admins can execute SQL commands');
    }
    
    try {
      setIsExecuting(true);
      
      // Usando a função exec_sql que acabamos de criar
      const { data, error } = await supabase.rpc('exec_sql', {
        query
      });
      
      if (error) {
        console.error('SQL execution error:', error);
        toast.error('Erro ao executar SQL', { 
          description: error.message 
        });
        throw error;
      }
      
      console.log('SQL execution result:', data);
      return { data, error: null };
    } catch (error: any) {
      console.error('SQL execution error:', error);
      return { data: null, error };
    } finally {
      setIsExecuting(false);
    }
  };
  
  return {
    executeSQL,
    isExecuting
  };
};
