
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  getLastAssignedBookingInfo, 
  checkUnprocessedBookings, 
  getQueueDiagnostics,
  forceAssignBookingToCompany,
  reconcilePendingBookings
} from '@/services/booking/bookingService';

/**
 * Hook for diagnosing and fixing booking assignment issues
 */
export const useBookingAssignmentDiagnostics = () => {
  const [isForceAssigning, setIsForceAssigning] = useState(false);
  
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
  
  const runReconcile = () => {
    reconcileBookingsMutation.mutate();
  };
  
  const forceAssignBooking = (bookingId: string, companyId: string) => {
    forceAssignMutation.mutate({ bookingId, companyId });
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
    
    refreshAllData
  };
};

export default useBookingAssignmentDiagnostics;
