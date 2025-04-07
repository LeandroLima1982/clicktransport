
// Find the specific issue at line 137
// Change from:
// if (assignError) {
//   console.error('Error assigning company from queue:', assignError);
// }
// if (assignedCompanyId) {

// To:
if (assignError) {
  console.error('Error assigning company from queue:', assignError);
}

// If we got a company id assigned, refresh the booking
if (typeof assignedCompanyId === 'string' && assignedCompanyId) {
  const { data: updatedBooking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', booking.id)
    .single();
    
  if (updatedBooking) {
    Object.assign(booking, updatedBooking);
  }
}
