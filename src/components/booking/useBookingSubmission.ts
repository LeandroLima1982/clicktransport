
import { useState } from 'react';
import { createBooking } from '@/services/booking/bookingService';
import { createServiceOrderFromBooking } from '@/services/booking/serviceOrderCreationService';
import { NavigateFunction } from 'react-router-dom';
import { ToastT } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';

interface UseBookingSubmissionProps {
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    returnDate: Date | undefined;
    tripType: 'oneway' | 'roundtrip';
    passengers: string;
    time?: string;
    returnTime?: string;
    passengerData?: {name: string; phone: string}[];
  };
  totalPrice: number;
  selectedVehicle: string | null;
  passengerData: {name: string; phone: string}[];
  vehicleOptions: any[];
  setBookingReference: (reference: string) => void;
  setBookingComplete: (complete: boolean) => void;
  setPendingBooking: (pending: boolean) => void;
  navigate: NavigateFunction;
  toast: ToastT;
  user: any;
  setShowLoginForm: (show: boolean) => void;
  supabase: SupabaseClient;
}

export const useBookingSubmission = ({
  bookingData,
  totalPrice,
  selectedVehicle,
  passengerData,
  vehicleOptions,
  setBookingReference,
  setBookingComplete,
  setPendingBooking,
  navigate,
  toast,
  user,
  setShowLoginForm,
  supabase
}: UseBookingSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getNextCompanyInQueue = async () => {
    try {
      // Get the first active company in the queue based on queue_position
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'active')
        .order('queue_position', { ascending: true })
        .limit(1);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log('No active companies found in queue');
        return null;
      }
      
      console.log('Next company in queue:', data[0]);
      return data[0];
    } catch (error) {
      console.error('Error fetching next company in queue:', error);
      return null;
    }
  };
  
  const updateCompanyQueuePosition = async (companyId: string) => {
    try {
      // Get the highest queue position
      const { data: maxPositionResult, error: maxPosError } = await supabase
        .from('companies')
        .select('queue_position')
        .order('queue_position', { ascending: false })
        .limit(1)
        .single();
      
      if (maxPosError && maxPosError.code !== 'PGRST116') throw maxPosError;
      
      const maxPosition = maxPositionResult?.queue_position || 0;
      const newPosition = maxPosition + 1;
      
      // Move this company to the end of the queue
      const { error: updateError } = await supabase
        .from('companies')
        .update({ 
          queue_position: newPosition,
          last_order_assigned: new Date().toISOString()
        })
        .eq('id', companyId);
      
      if (updateError) throw updateError;
      
      console.log(`Updated company ${companyId} queue position to ${newPosition}`);
      return true;
    } catch (error) {
      console.error('Error updating company queue position:', error);
      return false;
    }
  };

  const handleSubmitBooking = async () => {
    if (!user) {
      console.log('User not logged in, showing login form');
      setShowLoginForm(true);
      return;
    }
    
    if (!selectedVehicle) {
      toast.error('Selecione um veículo para continuar');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Get the next company in queue
      const nextCompany = await getNextCompanyInQueue();
      
      if (!nextCompany) {
        toast.error('Não foi possível encontrar uma empresa disponível. Por favor, tente novamente mais tarde.');
        setIsSubmitting(false);
        return;
      }
      
      // Generate a booking reference
      const reference = 'TRF-' + Math.floor(100000 + Math.random() * 900000);
      
      // Get the selected vehicle details
      const vehicle = vehicleOptions.find(v => v.id === selectedVehicle);
      
      if (!vehicle) {
        throw new Error('Veículo selecionado não encontrado');
      }
      
      // Format travel date with time
      let travelDate = new Date();
      if (bookingData.date) {
        if (bookingData.time) {
          const [hours, minutes] = bookingData.time.split(':').map(Number);
          travelDate = new Date(bookingData.date);
          travelDate.setHours(hours, minutes, 0, 0);
        } else {
          travelDate = new Date(bookingData.date);
        }
      }
      
      // Format return date with time if roundtrip
      let returnDate = null;
      if (bookingData.tripType === 'roundtrip' && bookingData.returnDate) {
        if (bookingData.returnTime) {
          const [hours, minutes] = bookingData.returnTime.split(':').map(Number);
          returnDate = new Date(bookingData.returnDate);
          returnDate.setHours(hours, minutes, 0, 0);
        } else {
          returnDate = new Date(bookingData.returnDate);
        }
      }
      
      // Prepare booking data
      const bookingPayload = {
        reference_code: reference,
        user_id: user.id,
        company_id: nextCompany.id, // Assign to the first company in queue
        company_name: nextCompany.name, // Store company name for reference
        origin: bookingData.origin,
        destination: bookingData.destination,
        booking_date: new Date().toISOString(),
        travel_date: travelDate.toISOString(),
        return_date: returnDate ? returnDate.toISOString() : null,
        total_price: totalPrice,
        passengers: parseInt(bookingData.passengers) || 1,
        vehicle_type: vehicle.name,
        status: 'pending' as 'confirmed' | 'pending' | 'completed' | 'cancelled',
        passenger_data: passengerData,
        additional_notes: `Veículo: ${vehicle.name}`
      };
      
      console.log('Creating booking with data:', bookingPayload);
      
      // Create the booking
      const { booking, error } = await createBooking(bookingPayload);
      
      if (error) {
        console.error('Error creating booking:', error);
        toast.error('Erro ao criar reserva. Por favor, tente novamente.');
        setIsSubmitting(false);
        return;
      }
      
      if (booking) {
        setBookingReference(booking.reference_code);
        
        // Create a service order from the booking
        const { serviceOrder, error: serviceOrderError } = await createServiceOrderFromBooking(booking);
        
        if (serviceOrderError) {
          console.error('Error creating service order:', serviceOrderError);
          toast.warning('Reserva confirmada, mas houve um erro ao criar a ordem de serviço', {
            description: 'Nossa equipe será notificada para resolver o problema.'
          });
        } else {
          console.log('Service order created successfully:', serviceOrder);
        }
        
        // Update company queue position
        await updateCompanyQueuePosition(nextCompany.id);
        
        toast.success('Reserva confirmada com sucesso!', {
          description: `Seu código de reserva é ${booking.reference_code}`
        });
        
        setBookingComplete(true);
        setPendingBooking(false);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Erro ao enviar reserva. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmitBooking
  };
};

export default useBookingSubmission;
