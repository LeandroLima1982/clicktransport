
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminSql = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const { userRole } = useAuth();
  
  const executeSQL = async (query: string) => {
    if (userRole !== 'admin') {
      throw new Error('Only admins can execute SQL commands');
    }
    
    try {
      setIsExecuting(true);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        query
      });
      
      if (error) throw error;
      
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
