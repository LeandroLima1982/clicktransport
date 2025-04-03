
// This file now serves as an aggregation point for all service order related functions
// to maintain backward compatibility with existing imports

// Re-export functions from the new modular files
export { getUserBookings, getBookingById, cancelBooking, createBooking } from './bookingService';
export { createServiceOrderFromBooking } from './serviceOrderCreationService';
export { updateOrderStatus } from './serviceOrderStatusService';
export { assignDriverToOrder } from './serviceOrderAssignmentService';
