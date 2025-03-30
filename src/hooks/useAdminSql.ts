
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Create a standalone version of executeSQL that can be imported directly
export const executeSQL = async (query: string) => {
  try {
    // Check admin permissions - may need to be adjusted based on your auth system
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', (await supabase.auth.getSession()).data.session?.user.id)
      .single();
      
    if (profileData?.role !== 'admin') {
      toast.error('Apenas administradores podem executar comandos SQL');
      throw new Error('Only admins can execute SQL commands');
    }
    
    // Execute the SQL function
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
  }
};

// Hook version of the SQL executor
export const useAdminSql = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const { userRole } = useAuth();
  
  const executeSQLWithState = async (query: string) => {
    if (userRole !== 'admin') {
      toast.error('Apenas administradores podem executar comandos SQL');
      throw new Error('Only admins can execute SQL commands');
    }
    
    try {
      setIsExecuting(true);
      return await executeSQL(query);
    } finally {
      setIsExecuting(false);
    }
  };
  
  return {
    executeSQL: executeSQLWithState,
    isExecuting
  };
};
