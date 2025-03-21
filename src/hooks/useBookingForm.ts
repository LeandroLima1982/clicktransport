import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchAddressSuggestions, loadGoogleMapsScript, isGoogleMapsLoaded } from '@/utils/maps';

export interface PassengerInfo {
  name: string;
  phone: string;
}

export interface BookingFormData {
  originValue: string;
  destinationValue: string;
  date: Date | undefined;
  returnDate: Date | undefined;
  tripType: 'oneway' | 'roundtrip';
  passengers: string;
  time: string;
  returnTime: string;
  passengerData: PassengerInfo[];
}

export const useBookingForm = () => {
  const [originValue, setOriginValue] = useState('');
  const [destinationValue, setDestinationValue] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [passengers, setPassengers] = useState('1');
  const [passengerData, setPassengerData] = useState<PassengerInfo[]>([{ name: '', phone: '' }]);
  const [showBookingSteps, setShowBookingSteps] = useState(false);
  const [time, setTime] = useState<string>('');
  const [returnTime, setReturnTime] = useState<string>('');
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isLoadingOriginSuggestions, setIsLoadingOriginSuggestions] = useState(false);
  const [isLoadingDestinationSuggestions, setIsLoadingDestinationSuggestions] = useState(false);
  
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      loadGoogleMapsScript()
        .then(() => {
          console.log('Google Maps API carregada com sucesso no useBookingForm');
        })
        .catch(error => {
          console.error('Erro ao carregar Google Maps API no useBookingForm:', error);
        });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const checkApiAvailability = useCallback(() => {
    return isGoogleMapsLoaded();
  }, []);
  
  const handleBooking = () => {
    if (!originValue) {
      toast.error('Por favor, informe o local de origem.');
      return;
    }
    
    if (!destinationValue) {
      toast.error('Por favor, informe o local de destino.');
      return;
    }
    
    if (!date) {
      toast.error('Por favor, selecione a data da viagem.');
      return;
    }
    
    if (!time) {
      toast.error('Por favor, selecione a hora da viagem.');
      return;
    }
    
    if (tripType === 'roundtrip' && !returnDate) {
      toast.error('Por favor, selecione a data de retorno.');
      return;
    }
    
    if (tripType === 'roundtrip' && !returnTime) {
      toast.error('Por favor, selecione a hora de retorno.');
      return;
    }
    
    setShowBookingSteps(true);
  };

  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOriginValue(value);
    
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }
    
    if (value.length >= 3) {
      setIsLoadingOriginSuggestions(true);
      originTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await fetchAddressSuggestions(value);
          console.log(`Recebidas ${suggestions.length} sugestões para origem: "${value}"`);
          setOriginSuggestions(suggestions);
        } catch (error) {
          console.error('Erro ao buscar sugestões de origem:', error);
          if (originSuggestions.length === 0) {
            toast.error('Erro ao buscar sugestões de endereço de origem');
          }
        } finally {
          setIsLoadingOriginSuggestions(false);
        }
      }, 400);
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationValue(value);
    
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current);
    }
    
    if (value.length >= 3) {
      setIsLoadingDestinationSuggestions(true);
      destinationTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await fetchAddressSuggestions(value);
          console.log(`Recebidas ${suggestions.length} sugestões para destino: "${value}"`);
          setDestinationSuggestions(suggestions);
        } catch (error) {
          console.error('Erro ao buscar sugestões de destino:', error);
          if (destinationSuggestions.length === 0) {
            toast.error('Erro ao buscar sugestões de endereço de destino');
          }
        } finally {
          setIsLoadingDestinationSuggestions(false);
        }
      }, 400);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion: any, isOrigin: boolean) => {
    const description = suggestion.description || suggestion.formatted_address || '';
    
    if (isOrigin) {
      console.log(`Selecionado para origem: "${description}"`);
      setOriginValue(description);
      setOriginSuggestions([]);
    } else {
      console.log(`Selecionado para destino: "${description}"`);
      setDestinationValue(description);
      setDestinationSuggestions([]);
    }
  };

  const clearOrigin = () => {
    setOriginValue('');
    setOriginSuggestions([]);
  };

  const clearDestination = () => {
    setDestinationValue('');
    setDestinationSuggestions([]);
  };

  const bookingData: BookingFormData = {
    originValue,
    destinationValue,
    date,
    returnDate,
    tripType,
    passengers,
    time,
    returnTime,
    passengerData
  };

  return {
    originValue,
    destinationValue,
    date,
    returnDate,
    tripType,
    passengers,
    passengerData,
    time,
    returnTime,
    originSuggestions,
    destinationSuggestions,
    isLoadingOriginSuggestions,
    isLoadingDestinationSuggestions,
    showBookingSteps,
    setTripType,
    setDate,
    setReturnDate,
    setPassengers,
    setPassengerData,
    setTime,
    setReturnTime,
    handleOriginChange,
    handleDestinationChange,
    selectSuggestion,
    handleBooking,
    setShowBookingSteps,
    bookingData,
    clearOrigin,
    clearDestination,
    checkApiAvailability,
  };
};
