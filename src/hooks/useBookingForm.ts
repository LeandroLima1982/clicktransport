
import { useState } from 'react';
import { toast } from 'sonner';
import { useBookingAddress } from './booking/useBookingAddress';
import { useBookingDateTime } from './booking/useBookingDateTime';
import { usePassengerData } from './booking/usePassengerData';
import { BookingFormData } from '@/types/booking.types';

export const useBookingForm = () => {
  const addressState = useBookingAddress();
  const dateTimeState = useBookingDateTime();
  const passengerState = usePassengerData();
  const [showBookingSteps, setShowBookingSteps] = useState(false);
  
  const handleBooking = () => {
    if (!addressState.originValue) {
      toast.error('Por favor, informe o local de origem.');
      return;
    }
    
    if (!addressState.destinationValue) {
      toast.error('Por favor, informe o local de destino.');
      return;
    }
    
    if (!dateTimeState.date) {
      toast.error('Por favor, selecione a data da viagem.');
      return;
    }
    
    if (!dateTimeState.time) {
      toast.error('Por favor, selecione a hora da viagem.');
      return;
    }
    
    if (dateTimeState.tripType === 'roundtrip' && !dateTimeState.returnDate) {
      toast.error('Por favor, selecione a data de retorno.');
      return;
    }
    
    if (dateTimeState.tripType === 'roundtrip' && !dateTimeState.returnTime) {
      toast.error('Por favor, selecione a hora de retorno.');
      return;
    }
    
    setShowBookingSteps(true);
  };

  const bookingData: BookingFormData = {
    originValue: addressState.originValue,
    destinationValue: addressState.destinationValue,
    originNumber: addressState.originNumber,
    destinationNumber: addressState.destinationNumber,
    date: dateTimeState.date,
    returnDate: dateTimeState.returnDate,
    tripType: dateTimeState.tripType,
    passengers: passengerState.passengers,
    time: dateTimeState.time,
    returnTime: dateTimeState.returnTime,
    passengerData: passengerState.passengerData
  };

  return {
    // Address data
    originValue: addressState.originValue,
    destinationValue: addressState.destinationValue,
    originNumber: addressState.originNumber,
    destinationNumber: addressState.destinationNumber,
    originSuggestions: addressState.originSuggestions,
    destinationSuggestions: addressState.destinationSuggestions,
    isLoadingSuggestions: addressState.isLoadingSuggestions,
    setOriginValue: addressState.setOriginValue,
    setDestinationValue: addressState.setDestinationValue,
    handleOriginChange: addressState.handleOriginChange,
    handleDestinationChange: addressState.handleDestinationChange,
    handleOriginNumberChange: addressState.handleOriginNumberChange,
    handleDestinationNumberChange: addressState.handleDestinationNumberChange,
    selectSuggestion: addressState.selectSuggestion,
    clearOrigin: addressState.clearOrigin,
    clearDestination: addressState.clearDestination,
    
    // Date and time data
    date: dateTimeState.date,
    returnDate: dateTimeState.returnDate,
    time: dateTimeState.time,
    returnTime: dateTimeState.returnTime,
    tripType: dateTimeState.tripType,
    setDate: dateTimeState.setDate,
    setReturnDate: dateTimeState.setReturnDate, 
    setTime: dateTimeState.setTime,
    setReturnTime: dateTimeState.setReturnTime,
    setTripType: dateTimeState.setTripType,
    
    // Passenger data
    passengers: passengerState.passengers,
    passengerData: passengerState.passengerData,
    setPassengers: passengerState.setPassengers,
    setPassengerData: passengerState.setPassengerData,
    
    // Booking steps and data
    showBookingSteps,
    setShowBookingSteps,
    handleBooking,
    bookingData
  };
};

export type { PassengerInfo, BookingFormData } from '@/types/booking.types';
