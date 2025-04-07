
// Add the type assertion to fix the type error
await supabase
  .from('bookings')
  .update({ 
    has_service_order: true 
  } as any)
  .eq('id', booking.id);
