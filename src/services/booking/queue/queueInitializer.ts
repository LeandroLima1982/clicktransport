
import { fixInvalidQueuePositions } from './queuePositionService';
import { processUnassignedBookings } from './bookingProcessorService';

// Automatic startup initialization to fix any queue issues
// This function runs more frequently to catch any pending bookings
const initQueueService = async () => {
  try {
    // Fix any invalid queue positions on startup
    const { fixed } = await fixInvalidQueuePositions();
    if (fixed > 0) {
      console.log(`Fixed ${fixed} companies with invalid queue positions on startup`);
    }
    
    // Process any unassigned bookings that might have been missed
    const { processed } = await processUnassignedBookings();
    if (processed > 0) {
      console.log(`Processed ${processed} unassigned bookings on startup`);
    }
    
    // Set up periodic check for unassigned bookings (every 5 minutes)
    setInterval(async () => {
      const result = await processUnassignedBookings();
      if (result.processed > 0) {
        console.log(`[Periodic check] Processed ${result.processed} unassigned bookings`);
      }
    }, 5 * 60 * 1000); // 5 minutes
  } catch (err) {
    console.error('Error during queue service initialization:', err);
  }
};

// Run initialization
initQueueService();
