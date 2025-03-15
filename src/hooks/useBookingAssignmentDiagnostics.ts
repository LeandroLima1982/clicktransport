
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  getLastAssignedBookingInfo, 
  checkUnprocessedBookings, 
  getQueueDiagnostics,
  forceAssignBookingToCompany,
  reconcilePendingBookings,
  resetCompanyQueuePositions
} from '@/services/booking/bookingService';
import { fixInvalidQueuePositions } from '@/services/booking/queueService';

/**
 * Hook for diagnosing and fixing booking assignment issues
 */
export const useBookingAssignmentDiagnostics = () => {
  const [isForceAssigning, setIsForceAssigning] = useState(false);
  const [isResettingQueue, setIsResettingQueue] = useState(false);
  const [isFixingPositions, setIsFixingPositions] = useState(false);
  
  // Get information about the last assigned booking
  const {
    data: lastAssignmentInfo,
    isLoading: isLoadingLastAssignment,
    error: lastAssignmentError,
    refetch: refetchLastAssignment
  } = useQuery({
    queryKey: ['last-assignment-info'],
    queryFn: async () => {
      const { success, data, error } = await getLastAssignedBookingInfo();
      if (!success) throw error;
      return data;
    }
  });
  
  // Check for unprocessed bookings
  const {
    data: unprocessedBookings,
    isLoading: isLoadingUnprocessed,
    error: unprocessedError,
    refetch: refetchUnprocessed
  } = useQuery({
    queryKey: ['unprocessed-bookings'],
    queryFn: async () => {
      const { success, data, error } = await checkUnprocessedBookings();
      if (!success) throw error;
      return data;
    }
  });
  
  // Get queue diagnostics
  const {
    data: queueDiagnostics,
    isLoading: isLoadingQueueDiagnostics,
    error: queueDiagnosticsError,
    refetch: refetchQueueDiagnostics
  } = useQuery({
    queryKey: ['queue-diagnostics'],
    queryFn: async () => {
      const { success, data, error } = await getQueueDiagnostics();
      if (!success) throw error;
      return data;
    }
  });
  
  // Mutation for force assigning a booking to a company
  const forceAssignMutation = useMutation({
    mutationFn: async ({ bookingId, companyId }: { bookingId: string, companyId: string }) => {
      setIsForceAssigning(true);
      try {
        const { success, data, error } = await forceAssignBookingToCompany(bookingId, companyId);
        if (!success) throw error;
        return data;
      } finally {
        setIsForceAssigning(false);
      }
    },
    onSuccess: () => {
      toast.success('Reserva atribuída manualmente com sucesso');
      refetchUnprocessed();
      refetchLastAssignment();
      refetchQueueDiagnostics();
    },
    onError: (error: any) => {
      toast.error(`Erro ao atribuir reserva: ${error.message || 'Falha desconhecida'}`);
    }
  });
  
  // Mutation for reconciling bookings
  const [isReconciling, setIsReconciling] = useState(false);
  
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
      
      refetchUnprocessed();
      refetchLastAssignment();
      refetchQueueDiagnostics();
    },
    onError: (error: any) => {
      toast.error(`Erro ao reconciliar reservas: ${error.message || 'Falha desconhecida'}`);
    }
  });
  
  // Mutation for resetting the queue
  const resetQueueMutation = useMutation({
    mutationFn: async () => {
      setIsResettingQueue(true);
      try {
        const { success, error } = await resetCompanyQueuePositions();
        if (!success) throw error;
        return success;
      } finally {
        setIsResettingQueue(false);
      }
    },
    onSuccess: () => {
      toast.success('Fila de empresas redefinida com sucesso');
      refetchQueueDiagnostics();
    },
    onError: (error: any) => {
      toast.error(`Erro ao redefinir fila: ${error.message || 'Falha desconhecida'}`);
    }
  });
  
  // NEW: Mutation for fixing invalid queue positions
  const fixQueuePositionsMutation = useMutation({
    mutationFn: async () => {
      setIsFixingPositions(true);
      try {
        const result = await fixInvalidQueuePositions();
        if (!result.success) throw result.error;
        return result;
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
      refetchQueueDiagnostics();
    },
    onError: (error: any) => {
      toast.error(`Erro ao corrigir posições de fila: ${error.message || 'Falha desconhecida'}`);
    }
  });
  
  const runReconcile = () => {
    reconcileBookingsMutation.mutate();
  };
  
  const forceAssignBooking = (bookingId: string, companyId: string) => {
    forceAssignMutation.mutate({ bookingId, companyId });
  };
  
  const resetQueue = () => {
    resetQueueMutation.mutate();
  };
  
  const fixQueuePositions = () => {
    fixQueuePositionsMutation.mutate();
  };
  
  const refreshAllData = () => {
    refetchLastAssignment();
    refetchUnprocessed();
    refetchQueueDiagnostics();
  };
  
  return {
    // Last assignment data
    lastAssignmentInfo,
    isLoadingLastAssignment,
    lastAssignmentError,
    
    // Unprocessed bookings data
    unprocessedBookings,
    isLoadingUnprocessed,
    unprocessedError,
    
    // Queue diagnostics
    queueDiagnostics,
    isLoadingQueueDiagnostics,
    queueDiagnosticsError,
    
    // Actions
    forceAssignBooking,
    isForceAssigning,
    
    runReconcile,
    isReconciling,
    
    resetQueue,
    isResettingQueue,
    
    fixQueuePositions,
    isFixingPositions,
    
    refreshAllData
  };
};

export default useBookingAssignmentDiagnostics;
