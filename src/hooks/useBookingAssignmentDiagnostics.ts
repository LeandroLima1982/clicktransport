
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resetCompanyQueuePositions, fixInvalidQueuePositions } from '@/services/booking/queueService';

export const useBookingAssignmentDiagnostics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  // Função para corrigir posições de fila inválidas
  const fixQueuePositionsMutation = useMutation({
    mutationFn: async () => {
      setIsFixing(true);
      try {
        return await fixInvalidQueuePositions();
      } finally {
        setIsFixing(false);
      }
    },
    onSuccess: (data) => {
      if (data.fixed > 0) {
        toast.success(`Corrigidas ${data.fixed} posições de fila inválidas`);
      } else {
        toast.info('Nenhuma posição de fila inválida encontrada');
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao corrigir posições de fila: ${error?.message || 'Erro desconhecido'}`);
    }
  });

  // Função para resetar todas as posições de fila
  const resetQueuePositionsMutation = useMutation({
    mutationFn: async () => {
      setIsResetting(true);
      try {
        return await resetCompanyQueuePositions();
      } finally {
        setIsResetting(false);
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Posições de fila resetadas com sucesso');
      } else {
        toast.error('Falha ao resetar posições de fila');
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao resetar posições de fila: ${error?.message || 'Erro desconhecido'}`);
    }
  });

  const fixQueuePositions = () => {
    fixQueuePositionsMutation.mutate();
  };

  const resetQueuePositions = () => {
    resetQueuePositionsMutation.mutate();
  };

  return {
    isLoading,
    isResetting,
    isFixing,
    fixQueuePositions,
    resetQueuePositions
  };
};

export default useBookingAssignmentDiagnostics;
