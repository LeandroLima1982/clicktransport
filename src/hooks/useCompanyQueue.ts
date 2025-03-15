
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCompanyQueueStatus, resetCompanyQueuePositions, reconcilePendingBookings } from '@/services/booking/bookingService';

export const useCompanyQueue = () => {
  const [resetting, setResetting] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  
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
  
  const reconcileBookings = async () => {
    try {
      setIsReconciling(true);
      const { processed, errors } = await reconcilePendingBookings();
      
      if (errors > 0) {
        toast.warning(`Reconciliação concluída com ${errors} erros. ${processed} reservas processadas.`);
      } else if (processed > 0) {
        toast.success(`${processed} ordens de serviço criadas com sucesso.`);
      } else {
        toast.info('Nenhuma reserva pendente encontrada para processamento.');
      }
      
      refetch();
    } catch (error) {
      console.error('Error reconciling bookings:', error);
      toast.error('Erro ao reconciliar reservas pendentes');
    } finally {
      setIsReconciling(false);
    }
  };
  
  return {
    queueStatus,
    isLoading,
    isError,
    resetQueue,
    resetting,
    reconcileBookings,
    isReconciling,
    refetch
  };
};

export default useCompanyQueue;
