
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  getQueueDiagnostics,
  fixInvalidQueuePositions,
  resetCompanyQueuePositions
} from '@/services/booking/queueService';

/**
 * Hook for diagnosing and fixing queue system issues
 */
export const useQueueDiagnostics = () => {
  const [isFixingPositions, setIsFixingPositions] = useState(false);
  const [isResettingQueue, setIsResettingQueue] = useState(false);
  
  // Get queue health diagnostics
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
  
  // Get database-level queue health check
  const {
    data: queueHealth,
    isLoading: isLoadingHealth,
    error: healthError,
    refetch: refetchHealth
  } = useQuery({
    queryKey: ['queue-health'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_queue_health');
      if (error) throw error;
      return data as { 
        health_score: number; 
        invalid_positions: number; 
        duplicate_positions: number; 
        active_companies: number; 
      };
    }
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
    
    // Actions
    fixQueuePositions,
    isFixingPositions,
    
    resetQueue,
    isResettingQueue,
    
    refreshDiagnostics
  };
};

export default useQueueDiagnostics;
