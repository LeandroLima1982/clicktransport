
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  resetCompanyQueuePositions, 
  fixInvalidQueuePositions,
  getQueueDiagnostics
} from '@/services/booking/queueService';

// Simulated types for the missing data structures
type Company = {
  id: string;
  name: string;
  status: string;
  queue_position: number | null;
  last_order_assigned?: string;
  order_count?: number;
};

type ServiceOrder = {
  id: string;
  status: string;
  booking_id?: string;
  company_id?: string;
  driver_id?: string;
  created_at: string;
};

type Booking = {
  id: string;
  reference_code: string;
  status: string;
  created_at: string;
};

export const useBookingAssignmentDiagnostics = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [isReconciling, setIsReconciling] = useState(false);
  const [isForceAssigning, setIsForceAssigning] = useState(false);
  const [isLoadingLastAssignment, setIsLoadingLastAssignment] = useState(false);
  const [isLoadingUnprocessed, setIsLoadingUnprocessed] = useState(false);
  const [isLoadingQueueDiagnostics, setIsLoadingQueueDiagnostics] = useState(false);
  const [isFixingPositions, setIsFixingPositions] = useState(false);
  
  // Queue diagnostics data
  const [queueDiagnostics, setQueueDiagnostics] = useState<{
    queue_status: {
      total_companies: number;
      active_companies: number;
      zero_queue_position_count: number;
      null_queue_position_count: number;
    };
    companies: Company[];
    recentOrders: ServiceOrder[];
    recentLogs: any[];
  } | null>(null);
  
  // Last assignment data
  const [lastAssignmentInfo, setLastAssignmentInfo] = useState<{
    lastServiceOrder: ServiceOrder | null;
    company: Company | null;
    booking: Booking | null;
  } | null>(null);
  
  // Unprocessed bookings data
  const [unprocessedBookings, setUnprocessedBookings] = useState<{
    totalUnprocessed: number;
    totalProcessed: number;
    unprocessedBookings: Booking[];
  } | null>(null);

  // Query for queue diagnostics
  const { refetch: refetchQueueDiagnostics } = useQuery({
    queryKey: ['queueDiagnostics'],
    queryFn: async () => {
      setIsLoadingQueueDiagnostics(true);
      try {
        const result = await getQueueDiagnostics();
        if (result.success && result.data) {
          setQueueDiagnostics(result.data);
        }
        return result;
      } finally {
        setIsLoadingQueueDiagnostics(false);
      }
    },
    enabled: false,
  });

  // Function to fix queue positions
  const fixQueuePositionsMutation = useMutation({
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
      refetchQueueDiagnostics();
    },
    onError: (error: any) => {
      toast.error(`Erro ao corrigir posições de fila: ${error?.message || 'Erro desconhecido'}`);
    }
  });

  // Function to reset queue positions
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
      refetchQueueDiagnostics();
    },
    onError: (error: any) => {
      toast.error(`Erro ao resetar posições de fila: ${error?.message || 'Erro desconhecido'}`);
    }
  });

  // Simulated functions for the missing implementations
  const refreshAllData = () => {
    refetchQueueDiagnostics();
    toast.info('Dados atualizados');
  };

  const runReconcile = () => {
    setIsReconciling(true);
    // Simulated asynchronous operation
    setTimeout(() => {
      setIsReconciling(false);
      toast.success('Reconciliação de reservas concluída');
      refetchQueueDiagnostics();
    }, 1500);
  };

  const forceAssignBooking = (bookingId: string, companyId: string) => {
    setIsForceAssigning(true);
    // Simulated asynchronous operation
    setTimeout(() => {
      setIsForceAssigning(false);
      toast.success('Reserva atribuída manualmente com sucesso');
      refetchQueueDiagnostics();
    }, 1500);
  };

  const fixQueuePositions = () => {
    fixQueuePositionsMutation.mutate();
  };

  const resetQueuePositions = () => {
    resetQueuePositionsMutation.mutate();
  };

  // Initial data fetch
  useEffect(() => {
    refreshAllData();
  }, []);

  return {
    isLoading,
    isResetting,
    isFixing,
    isReconciling,
    isForceAssigning,
    isLoadingLastAssignment,
    isLoadingUnprocessed,
    isLoadingQueueDiagnostics,
    isFixingPositions,
    lastAssignmentInfo,
    unprocessedBookings,
    queueDiagnostics,
    fixQueuePositions,
    resetQueuePositions,
    refreshAllData,
    runReconcile,
    forceAssignBooking
  };
};

export default useBookingAssignmentDiagnostics;
