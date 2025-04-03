
import { getCompanyQueueStatus, resetCompanyQueuePositions } from './queueStatusService';
import { getNextCompanyInQueue, updateCompanyQueuePosition, fixInvalidQueuePositions } from './queuePositionService';
import { getQueueDiagnostics } from './queueDiagnosticsService';
import { processUnassignedBookings } from './bookingProcessorService';

// Initialize queue service
import './queueInitializer';

// Export all functions
export {
  getCompanyQueueStatus,
  resetCompanyQueuePositions,
  getNextCompanyInQueue,
  updateCompanyQueuePosition,
  fixInvalidQueuePositions,
  getQueueDiagnostics,
  processUnassignedBookings
};

export default {
  getCompanyQueueStatus,
  resetCompanyQueuePositions,
  getNextCompanyInQueue,
  updateCompanyQueuePosition,
  fixInvalidQueuePositions,
  getQueueDiagnostics,
  processUnassignedBookings
};
