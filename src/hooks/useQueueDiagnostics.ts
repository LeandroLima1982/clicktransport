
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  getQueueDiagnostics,
  fixInvalidQueuePositions,
  resetCompanyQueuePositions
} from '@/services/booking/queueService';

// Define a more complete type for the health check response
interface QueueHealthResponse {
  health_score: number;
  invalid_positions: number;
  duplicate_positions: number;
  active_companies: number;
  unprocessed_bookings?: number;
  unlinked_orders?: number;
  booking_processing_score?: number;
  overall_health_score?: number;
  driver_count?: number;
  vehicle_count?: number;
  booking_count?: number;
}

interface BookingDetails {
  id: string;
  reference_code: string;
  status: string;
  origin: string;
  destination: string;
  travel_date: string;
  return_date?: string;
  created_at: string;
  additional_notes?: string;
  service_order?: {
    id: string;
    company_id: string;
    status: string;
    created_at: string;
    company_name?: string;
  };
}

/**
 * Hook for diagnosing and fixing queue system issues
 */
export const useQueueDiagnostics = () => {
  const [isFixingPositions, setIsFixingPositions] = useState(false);
  const [isResettingQueue, setIsResettingQueue] = useState(false);
  const [searchBookingCode, setSearchBookingCode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);
  
  // Get queue diagnostics
  const {
    data: queueDiagnostics,
    isLoading: isLoadingDiagnostics,
    error: diagnosticsError,
    refetch: refetchDiagnostics
  } = useQuery({
    queryKey: ['queue-diagnostics'],
    queryFn: async () => {
      const { success, data, error } = await getQueueDiagnostics();
      if (!success) throw error;
      return data;
    }
  });
  
  // Get database-level queue health check with properly typed response
  const {
    data: queueHealth,
    isLoading: isLoadingHealth,
    error: healthError,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['queue-health'],
    queryFn: async () => {
      // Use explicit typing for the Supabase RPC call
      const response = await supabase.functions.invoke('check_queue_health', {
        method: 'POST',
        body: {}
      });
      
      if (response.error) throw response.error;
      return response.data as QueueHealthResponse;
    }
  });
  
  // Query for finding a specific booking by reference code
  const {
    data: bookingDetails,
    isLoading: isLoadingBooking,
    error: bookingError,
    refetch: refetchBooking
  } = useQuery({
    queryKey: ['booking-details', searchBookingCode],
    queryFn: async () => {
      if (!searchBookingCode) return null;
      
      setIsSearching(true);
      try {
        // First find the booking
        const { data: bookings, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .ilike('reference_code', `%${searchBookingCode}%`)
          .limit(1);
        
        if (bookingError) throw bookingError;
        if (!bookings || bookings.length === 0) {
          return null;
        }
        
        const booking = bookings[0];
        
        // Then check if there's a service order for this booking
        const { data: serviceOrders, error: orderError } = await supabase
          .from('service_orders')
          .select('id, company_id, status, created_at')
          .ilike('notes', `%Reserva #${booking.reference_code}%`)
          .limit(1);
        
        if (orderError) throw orderError;
        
        let serviceOrder = null;
        let companyName = null;
        
        if (serviceOrders && serviceOrders.length > 0) {
          serviceOrder = serviceOrders[0];
          
          // Get company name
          const { data: companies, error: companyError } = await supabase
            .from('companies')
            .select('name')
            .eq('id', serviceOrder.company_id)
            .limit(1);
            
          if (!companyError && companies && companies.length > 0) {
            companyName = companies[0].name;
          }
          
          serviceOrder.company_name = companyName;
        }
        
        return {
          ...booking,
          service_order: serviceOrder
        } as BookingDetails;
      } finally {
        setIsSearching(false);
      }
    },
    enabled: false // Don't run automatically, only when explicitly requested
  });
  
  // Mutation for fixing invalid queue positions
  const fixPositionsMutation = useMutation({
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
      refetchDiagnostics();
      refetchHealth();
    },
    onError: (error: any) => {
      toast.error(`Erro ao corrigir posições de fila: ${error?.message || 'Erro desconhecido'}`);
    }
  });
  
  // Mutation for resetting the queue
  const resetQueueMutation = useMutation({
    mutationFn: async () => {
      setIsResettingQueue(true);
      try {
        const result = await resetCompanyQueuePositions();
        if (!result.success) throw result.error;
        return result;
      } finally {
        setIsResettingQueue(false);
      }
    },
    onSuccess: (data) => {
      toast.success(`Fila de empresas reiniciada com sucesso. ${data.companies_updated} empresas atualizadas.`);
      refetchDiagnostics();
      refetchHealth();
    },
    onError: (error: any) => {
      toast.error(`Erro ao reiniciar fila: ${error?.message || 'Erro desconhecido'}`);
    }
  });

  // Mutation for processing a specific booking
  const processBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      setIsProcessingBooking(true);
      try {
        const response = await supabase.functions.invoke('process_specific_booking', {
          method: 'POST',
          body: { booking_id: bookingId }
        });
        
        if (response.error) throw response.error;
        return response.data;
      } finally {
        setIsProcessingBooking(false);
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Reserva processada com sucesso. Ordem de serviço criada para ${data.company_name || 'uma empresa'}`);
        searchBooking(searchBookingCode); // Refresh booking details
      } else {
        toast.error(`Não foi possível processar a reserva: ${data.message || 'Erro desconhecido'}`);
      }
    },
    onError: (error: any) => {
      toast.error(`Erro ao processar reserva: ${error?.message || 'Erro desconhecido'}`);
    }
  });
  
  const fixQueuePositions = () => {
    fixPositionsMutation.mutate();
  };
  
  const resetQueue = () => {
    resetQueueMutation.mutate();
  };
  
  const refreshDiagnostics = () => {
    refetchDiagnostics();
    refetchHealth();
  };

  const searchBooking = (code: string) => {
    setSearchBookingCode(code);
    refetchBooking();
  };

  const processBooking = (bookingId: string) => {
    processBookingMutation.mutate(bookingId);
  };
  
  /**
   * Calculates the overall health score of the queue system
   * Returns a score from 0-100 where 100 is perfectly healthy
   */
  const getQueueHealthScore = () => {
    if (!queueHealth) return null;
    
    return {
      score: queueHealth.health_score || 0,
      invalidPositions: queueHealth.invalid_positions || 0,
      duplicatePositions: queueHealth.duplicate_positions || 0,
      activeCompanies: queueHealth.active_companies || 0,
      needsAttention: (queueHealth.health_score < 80)
    };
  };
  
  return {
    // Queue diagnostics
    queueDiagnostics,
    isLoadingDiagnostics,
    diagnosticsError,
    
    // Queue health
    queueHealth,
    isLoadingHealth,
    healthError,
    getQueueHealthScore,
    
    // Booking search
    searchBooking,
    bookingDetails,
    isLoadingBooking,
    isSearching,
    bookingError,
    
    // Process booking
    processBooking,
    isProcessingBooking,
    
    // Actions
    fixQueuePositions,
    isFixingPositions,
    
    resetQueue,
    isResettingQueue,
    
    refreshDiagnostics
  };
};

export default useQueueDiagnostics;
