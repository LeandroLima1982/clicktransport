
import { useState } from 'react';
import { useQueueData } from './queue/useQueueData';
import { useQueueOperations } from './queue/useQueueOperations';
import { useQueueDiagnostics } from './queue/useQueueDiagnostics';

export const useCompanyQueue = () => {
  const { 
    companies, 
    isLoading, 
    error: dataError, 
    fetchCompanies 
  } = useQueueData();
  
  const { 
    error: operationsError, 
    fixQueuePositions, 
    resetQueue, 
    moveCompanyToEnd 
  } = useQueueOperations(fetchCompanies);
  
  const {
    diagnostics,
    diagnosticsLoading,
    error: diagnosticsError,
    runDiagnostics
  } = useQueueDiagnostics();
  
  // Combine errors from different hooks
  const error = dataError || operationsError || diagnosticsError;
  
  return {
    // Data
    companies,
    isLoading,
    error,
    
    // Operations
    fetchCompanies,
    fixQueuePositions,
    resetQueue,
    moveCompanyToEnd,
    
    // Diagnostics
    diagnostics,
    diagnosticsLoading,
    runDiagnostics
  };
};
