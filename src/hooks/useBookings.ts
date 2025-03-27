
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { useAuth } from '@/hooks/useAuth';

export const useBookings = () => {
  const { user } = useAuth();
  
  const fetchBookings = async (): Promise<Booking[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Erro ao carregar reservas', {
          description: 'Ocorreu um erro ao buscar suas reservas. Tente novamente mais tarde.'
        });
        throw error;
      }
      
      return data as Booking[];
    } catch (error) {
      console.error('Exception fetching bookings:', error);
      toast.error('Erro ao carregar reservas');
      return [];
    }
  };
  
  const { 
    data: bookings = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['bookings', user?.id],
    queryFn: fetchBookings,
    enabled: !!user,
  });
  
  const cancelBooking = async (bookingId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      toast.success('Reserva cancelada com sucesso');
      refetch();
      return;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Erro ao cancelar reserva', {
        description: 'Não foi possível cancelar sua reserva. Tente novamente.'
      });
      throw error;
    }
  };
  
  // Add the createBooking function
  const createBooking = async (bookingData: any): Promise<{ booking: any; error: any }> => {
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate reference code
      const reference = 'TRF-' + Math.floor(100000 + Math.random() * 900000);
      
      const booking = {
        id: Math.random().toString(36).substring(2, 11),
        reference_code: reference,
        ...bookingData
      };
      
      toast.success('Reserva criada com sucesso!');
      refetch();
      
      return { booking, error: null };
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Erro ao criar reserva');
      return { booking: null, error };
    }
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
