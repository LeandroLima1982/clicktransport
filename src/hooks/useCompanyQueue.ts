
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCompanyQueueStatus, resetCompanyQueuePositions } from '@/services/booking/bookingService';

export const useCompanyQueue = () => {
  const [resetting, setResetting] = useState(false);
  
  const { 
    data: queueStatus = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['company-queue-status'],
    queryFn: async () => {
      const { companies, error } = await getCompanyQueueStatus();
      if (error) throw error;
      return companies;
    },
  });
  
  const resetQueue = async () => {
    try {
      setResetting(true);
      const { success, error } = await resetCompanyQueuePositions();
      
      if (!success) throw error;
      
      toast.success('Fila de empresas reiniciada com sucesso');
      refetch();
    } catch (error) {
      console.error('Error resetting queue:', error);
      toast.error('Erro ao reiniciar fila de empresas');
    } finally {
      setResetting(false);
    }
  };
  
  return {
    queueStatus,
    isLoading,
    isError,
    resetQueue,
    resetting,
    refetch
  };
};

export default useCompanyQueue;
