
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createBooking } from '@/services/booking/bookingService';
import { createServiceOrderFromBooking } from '@/services/booking/serviceOrderCreationService';
import { notifyBookingCreated } from '@/services/notifications/workflowNotificationService';
import { VehicleRate, getVehicleRates } from '@/utils/routeUtils';

export const useServiceRequests = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicleRates, setVehicleRates] = useState<VehicleRate[]>([]);

  useEffect(() => {
    // Carregar taxas de veículos ao inicializar o hook
    const loadVehicleRates = async () => {
      try {
        const rates = await getVehicleRates();
        setVehicleRates(rates);
      } catch (error) {
        console.error('Error loading vehicle rates:', error);
      }
    };
    
    loadVehicleRates();
  }, []);

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
      
      // Calcular o preço estimado com base nas taxas atualizadas
      const estimatedPrice = calculateEstimatedPrice(requestData);
      
      // Prepare booking data
      const bookingData = {
        reference_code: reference,
        user_id: requestData.userId,
        origin: requestData.origin,
        destination: requestData.destination,
        booking_date: new Date().toISOString(),
        travel_date: travelDate.toISOString(),
        return_date: null,
        total_price: estimatedPrice,
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
    const passengerCount = parseInt(requestData.passengers) || 1;
    const vehicleType = getVehicleTypeId(passengerCount);
    
    // Encontrar a taxa de veículo correspondente ao tipo de veículo
    const vehicleRate = vehicleRates.find(rate => rate.id === vehicleType) || 
      { id: 'sedan', name: 'Sedan Executivo', basePrice: 79.90, pricePerKm: 2.10 };
    
    // Estimar a distância com base no tipo de serviço
    let estimatedDistance = 30; // valor padrão
    switch (requestData.serviceType) {
      case 'transfer':
        estimatedDistance = 30;
        break;
      case 'dayRent':
        estimatedDistance = 100;
        break;
      case 'tourism':
        estimatedDistance = 80;
        break;
      case 'event':
        estimatedDistance = 50;
        break;
    }
    
    // Calcular o preço com base na tarifa do veículo
    const distancePrice = estimatedDistance * vehicleRate.pricePerKm;
    const totalPrice = vehicleRate.basePrice + distancePrice;
    
    // Ajustar com multiplicadores de serviço
    let serviceTypeMultiplier = 1;
    switch (requestData.serviceType) {
      case 'transfer':
        serviceTypeMultiplier = 1;
        break;
      case 'dayRent':
        serviceTypeMultiplier = 1.5;
        break;
      case 'tourism':
        serviceTypeMultiplier = 1.3;
        break;
      case 'event':
        serviceTypeMultiplier = 1.2;
        break;
    }
    
    return Math.round(totalPrice * serviceTypeMultiplier);
  };
  
  // Helper function to determine vehicle ID based on passenger count
  const getVehicleTypeId = (passengerCount: number): string => {
    if (passengerCount <= 4) {
      return 'sedan';
    } else if (passengerCount <= 6) {
      return 'suv';
    } else {
      return 'van';
    }
  };
  
  // Helper function to determine vehicle type name based on passenger count
  const getVehicleTypeFromPassengers = (passengers: string): string => {
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
