
import { useState } from 'react';

// Define the Booking type
export interface Booking {
  id: string;
  reference_code: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  origin: string;
  destination: string;
  travel_date: string;
  booking_date: string;
  total_price: number;
  passengers: number;
  user_id: string;
  additional_notes?: string;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Fetch bookings
  const fetchBookings = async () => {
    setIsLoading(true);
    setIsError(false);
    
    try {
      // Simulate API call
      setTimeout(() => {
        setBookings([
          {
            id: '1',
            reference_code: 'BK12345',
            status: 'confirmed',
            origin: 'Aeroporto Galeão, Rio de Janeiro',
            destination: 'Copacabana, Rio de Janeiro',
            travel_date: '2025-04-15T10:00:00Z',
            booking_date: '2025-03-28T15:23:00Z',
            total_price: 120.00,
            passengers: 2,
            user_id: 'user123',
            additional_notes: 'Preciso de ajuda com as malas'
          },
          {
            id: '2',
            reference_code: 'BK12346',
            status: 'pending',
            origin: 'Aeroporto Santos Dumont, Rio de Janeiro',
            destination: 'Barra da Tijuca, Rio de Janeiro',
            travel_date: '2025-05-20T14:30:00Z',
            booking_date: '2025-03-29T09:15:00Z',
            total_price: 85.00,
            passengers: 1,
            user_id: 'user123',
          }
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  // Cancel a booking
  const cancelBooking = async (bookingId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the local state to reflect the cancellation
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' as const } 
            : booking
        )
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Create a booking
  const createBooking = async (bookingData: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a reference code
      const referenceCode = `BK${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Create a new booking
      const newBooking: Booking = {
        id: Date.now().toString(),
        reference_code: referenceCode,
        status: 'confirmed',
        origin: bookingData.origin,
        destination: bookingData.destination,
        travel_date: bookingData.travel_date,
        booking_date: new Date().toISOString(),
        total_price: bookingData.total_price || 0,
        passengers: bookingData.passengers || 1,
        user_id: bookingData.user_id || 'guest',
        additional_notes: bookingData.additional_notes
      };
      
      // Add it to the bookings list
      setBookings(prevBookings => [...prevBookings, newBooking]);
      
      return { 
        success: true, 
        booking: newBooking,
        referenceCode
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refetch bookings
  const refetch = async (options?: any) => {
    await fetchBookings();
    return {
      data: bookings,
      isLoading,
      isError
    };
  };

  return {
    bookings,
    isLoading,
    isError,
    refetch,
    cancelBooking,
    createBooking
  };
};

export default useBookings;
