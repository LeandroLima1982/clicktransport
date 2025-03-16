import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createBooking, createServiceOrderFromBooking } from '@/services/booking/bookingService';
import { notifyBookingCreated } from '@/services/notifications/workflowNotificationService';

export const useServiceRequests = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitServiceRequest = async (requestData: {
    name: string;
    email: string;
    phone: string;
    serviceType: string;
    origin: string;
    destination: string;
    passengers: string;
    additionalInfo?: string;
    requestDate?: string;
    requestTime?: string;
    userId: string; // Make sure we're requiring the user ID
  }) => {
    if (!requestData.userId) {
      toast.error('Você precisa estar logado para fazer uma solicitação');
      return false;
    }

    setIsSubmitting(true);
    
    try {
      // Generate a booking reference
      const reference = 'TRF-' + Math.floor(100000 + Math.random() * 900000);
      
      // Format travel date with time if provided
      let travelDate = new Date();
      if (requestData.requestDate) {
        if (requestData.requestTime) {
          travelDate = new Date(`${requestData.requestDate} ${requestData.requestTime}`);
        } else {
          travelDate = new Date(requestData.requestDate);
        }
      }
      
      // Prepare booking data
      const bookingData = {
        reference_code: reference,
        user_id: requestData.userId,
        origin: requestData.origin,
        destination: requestData.destination,
        booking_date: new Date().toISOString(),
        travel_date: travelDate.toISOString(),
        return_date: null,
        total_price: calculateEstimatedPrice(requestData),
        passengers: parseInt(requestData.passengers) || 1,
        vehicle_type: getVehicleTypeFromPassengers(requestData.passengers),
        status: 'pending' as 'confirmed' | 'pending' | 'completed' | 'cancelled',
        additional_notes: `${requestData.additionalInfo || ''} 
                          ${requestData.requestTime ? 'Horário: ' + requestData.requestTime : ''}`
      };
      
      console.log('Creating booking with data:', bookingData);
      
      // Create the booking
      const { booking, error } = await createBooking(bookingData);
      
      if (error) {
        console.error('Error creating booking:', error);
        toast.error('Erro ao criar reserva. Por favor, tente novamente.');
        return false;
      }
      
      if (booking) {
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
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error submitting service request:', error);
      toast.error('Erro ao enviar solicitação. Por favor, tente novamente.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to calculate estimated price based on service type and passengers
  const calculateEstimatedPrice = (requestData: any) => {
    const basePrice = 100;
    const passengerCount = parseInt(requestData.passengers) || 1;
    const passengerMultiplier = passengerCount > 4 ? 1.5 : 1;
    
    let serviceTypeMultiplier = 1;
    switch (requestData.serviceType) {
      case 'transfer':
        serviceTypeMultiplier = 1;
        break;
      case 'dayRent':
        serviceTypeMultiplier = 2.5;
        break;
      case 'tourism':
        serviceTypeMultiplier = 1.8;
        break;
      case 'event':
        serviceTypeMultiplier = 1.3;
        break;
      default:
        serviceTypeMultiplier = 1;
    }
    
    return Math.round(basePrice * passengerMultiplier * serviceTypeMultiplier);
  };
  
  // Helper function to determine vehicle type based on passenger count
  const getVehicleTypeFromPassengers = (passengers: string) => {
    const count = parseInt(passengers) || 1;
    
    if (count <= 4) {
      return 'Sedan Executivo';
    } else if (count <= 6) {
      return 'SUV Premium';
    } else {
      return 'Van Executiva';
    }
  };

  return {
    submitServiceRequest,
    isSubmitting
  };
};

export default useServiceRequests;
