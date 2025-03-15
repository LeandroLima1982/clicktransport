
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCompanyQueueStatus, fixInvalidQueuePositions } from '@/services/booking/queueService';
import { reconcilePendingBookings, resetCompanyQueuePositions } from '@/services/booking/bookingService';

export const useCompanyQueue = () => {
  const [resetting, setResetting] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [isFixingPositions, setIsFixingPositions] = useState(false);
  
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
  
  // Mutation for resetting the queue
  const resetQueueMutation = useMutation({
    mutationFn: async () => {
      setResetting(true);
      try {
        const { success, error } = await resetCompanyQueuePositions();
        if (!success) throw error;
        return success;
      } finally {
        setResetting(false);
      }
    },
    onSuccess: () => {
      toast.success('Fila de empresas reiniciada com sucesso');
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao reiniciar fila de empresas: ${error?.message || 'Erro desconhecido'}`);
    }
  });
  
  // Mutation for reconciling bookings
  const reconcileBookingsMutation = useMutation({
    mutationFn: async () => {
      setIsReconciling(true);
      try {
        return await reconcilePendingBookings();
      } finally {
        setIsReconciling(false);
      }
    },
    onSuccess: (data) => {
      if (data.errors > 0) {
        toast.warning(`Reconciliação concluída com ${data.errors} erros. ${data.processed} reservas processadas.`);
      } else if (data.processed > 0) {
        toast.success(`${data.processed} ordens de serviço criadas com sucesso.`);
      } else {
        toast.info('Nenhuma reserva pendente encontrada para processamento.');
      }
      
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao reconciliar reservas: ${error?.message || 'Erro desconhecido'}`);
    }
  });
  
  // NEW: Mutation for fixing invalid queue positions
  const fixPositionsMutation = useMutation({
    mutationFn: async () => {
      setIsFixingPositions(true);
      try {
        return await fixInvalidQueuePositions();
      } finally {
        setIsFixingPositions(false);
      }
    },
    onSuccess: (data) => {
      if (data.fixed > 0) {
        toast.success(`Corrigidas ${data.fixed} posições de fila inválidas`);
      } else {
        toast.info('Nenhuma posição de fila inválida encontrada');
      }
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro ao corrigir posições de fila: ${error?.message || 'Erro desconhecido'}`);
    }
  });
  
  const resetQueue = () => {
    resetQueueMutation.mutate();
  };
  
  const reconcileBookings = () => {
    reconcileBookingsMutation.mutate();
  };
  
  const fixQueuePositions = () => {
    fixPositionsMutation.mutate();
  };
  
  return {
    queueStatus,
    isLoading,
    isError,
    resetQueue,
    resetting,
    reconcileBookings,
    isReconciling,
    fixQueuePositions,
    isFixingPositions,
    refetch
  };
};

export default useCompanyQueue;
