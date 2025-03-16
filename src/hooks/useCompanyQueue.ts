
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  getCompanyQueueStatus, 
  fixInvalidQueuePositions, 
  resetCompanyQueuePositions, 
  getQueueDiagnostics 
} from '@/services/booking/queueService';

export const useCompanyQueue = () => {
  const [resetting, setResetting] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [isFixingPositions, setIsFixingPositions] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const queryClient = useQueryClient();
  
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
  
  const { data: diagnostics, isLoading: diagnosticsLoading } = useQuery({
    queryKey: ['queue-diagnostics'],
    queryFn: async () => {
      setIsDiagnosing(true);
      try {
        const result = await getQueueDiagnostics();
        if (!result.success) throw result.error;
        return result.data;
      } finally {
        setIsDiagnosing(false);
      }
    },
    enabled: false,
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
      queryClient.invalidateQueries({ queryKey: ['company-queue-status'] });
      queryClient.invalidateQueries({ queryKey: ['queue-diagnostics'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao reiniciar fila de empresas: ${error?.message || 'Erro desconhecido'}`);
    }
  });
  
  // Mutation for fixing invalid queue positions
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
      queryClient.invalidateQueries({ queryKey: ['company-queue-status'] });
      queryClient.invalidateQueries({ queryKey: ['queue-diagnostics'] });
    },
    onError: (error: any) => {
      toast.error(`Erro ao corrigir posições de fila: ${error?.message || 'Erro desconhecido'}`);
    }
  });
  
  const resetQueue = () => {
    resetQueueMutation.mutate();
  };
  
  const fixQueuePositions = () => {
    fixPositionsMutation.mutate();
  };
  
  const runDiagnostics = () => {
    queryClient.invalidateQueries({ queryKey: ['queue-diagnostics'] });
  };
  
  return {
    queueStatus,
    isLoading,
    isError,
    resetQueue,
    resetting,
    isReconciling,
    fixQueuePositions,
    isFixingPositions,
    refetch,
    diagnostics,
    diagnosticsLoading,
    isDiagnosing,
    runDiagnostics
  };
};

export default useCompanyQueue;
