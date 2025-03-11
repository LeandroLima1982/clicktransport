
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
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Erro ao carregar reservas', {
        description: 'Ocorreu um erro ao buscar suas reservas. Tente novamente mais tarde.'
      });
      throw error;
    }
    
    return data as Booking[];
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
  
  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      toast.success('Reserva cancelada com sucesso');
      refetch();
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Erro ao cancelar reserva', {
        description: 'Não foi possível cancelar sua reserva. Tente novamente.'
      });
      return false;
    }
  };
  
  return {
    bookings,
    isLoading,
    isError,
    refetch,
    cancelBooking
  };
};
