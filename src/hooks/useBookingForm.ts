
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchAddressSuggestions, setGoogleMapsApiKey } from '@/utils/googleMaps';

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
  const [apiKey, setApiKey] = useState<string>('');
  
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Show API key input if not set
  useEffect(() => {
    // Optional: you can prompt for API key here or handle it elsewhere
    // For now, we'll just check local storage
    const savedApiKey = localStorage.getItem('google_maps_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setGoogleMapsApiKey(savedApiKey);
    }
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
    
    if (!apiKey) {
      toast.error('Chave da API do Google Maps não configurada');
      return;
    }
    
    if (value.length >= 3) {
      setIsLoadingOriginSuggestions(true);
      originTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await fetchAddressSuggestions(value);
          setOriginSuggestions(suggestions);
        } catch (error) {
          console.error('Error fetching origin suggestions:', error);
          toast.error('Erro ao buscar sugestões de endereço de origem');
          setOriginSuggestions([]);
        } finally {
          setIsLoadingOriginSuggestions(false);
        }
      }, 500);
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
    
    if (!apiKey) {
      toast.error('Chave da API do Google Maps não configurada');
      return;
    }
    
    if (value.length >= 3) {
      setIsLoadingDestinationSuggestions(true);
      destinationTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await fetchAddressSuggestions(value);
          setDestinationSuggestions(suggestions);
        } catch (error) {
          console.error('Error fetching destination suggestions:', error);
          toast.error('Erro ao buscar sugestões de endereço de destino');
          setDestinationSuggestions([]);
        } finally {
          setIsLoadingDestinationSuggestions(false);
        }
      }, 500);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion: any, isOrigin: boolean) => {
    if (isOrigin) {
      setOriginValue(suggestion.description);
      setOriginSuggestions([]);
    } else {
      setDestinationValue(suggestion.description);
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

  const setGoogleApiKey = (key: string) => {
    setApiKey(key);
    setGoogleMapsApiKey(key);
    localStorage.setItem('google_maps_api_key', key);
    toast.success('Chave da API do Google Maps configurada!');
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
    apiKey,
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
    setGoogleApiKey
  };
};
