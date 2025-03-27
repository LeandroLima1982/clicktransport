
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchAddressSuggestions } from '@/utils/mapbox';

export interface PassengerInfo {
  name: string;
  phone: string;
}

export interface BookingFormData {
  originValue: string;
  destinationValue: string;
  originNumber?: string;
  destinationNumber?: string;
  date: Date | undefined;
  returnDate: Date | undefined;
  tripType: 'oneway' | 'roundtrip';
  passengers: string;
  time: string;
  returnTime: string;
  passengerData: PassengerInfo[];
  distance?: number;
}

export const useBookingForm = () => {
  const [originValue, setOriginValue] = useState('');
  const [destinationValue, setDestinationValue] = useState('');
  const [originNumber, setOriginNumber] = useState('');
  const [destinationNumber, setDestinationNumber] = useState('');
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
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [lastQueryTime, setLastQueryTime] = useState(0);
  
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (errorCount > 0) {
      const timer = setTimeout(() => {
        setErrorCount(0);
      }, 30000); // Reset after 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [errorCount]);
  
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
    
    // Controle de debounce para evitar chamadas excessivas
    const now = Date.now();
    if (now - lastQueryTime < 300) {
      if (originTimeoutRef.current) {
        clearTimeout(originTimeoutRef.current);
      }
    }
    setLastQueryTime(now);
    
    if (value.length >= 2 && errorCount < 5) {
      setIsLoadingSuggestions(true);
      
      if (originTimeoutRef.current) {
        clearTimeout(originTimeoutRef.current);
      }
      
      originTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('Fetching origin suggestions for:', value);
          const suggestions = await fetchAddressSuggestions(value);
          console.log('Received origin suggestions:', suggestions.length);
          setOriginSuggestions(suggestions);
          
          if (suggestions.length === 0 && value.length > 5) {
            console.log("Sem resultados para origem: " + value);
          }
        } catch (error) {
          console.error('Erro ao buscar sugestões de origem:', error);
          setErrorCount(prev => prev + 1);
          
          if (errorCount === 0) {
            toast.error('Erro ao buscar sugestões de endereço. Tente um formato diferente.', {
              description: 'Exemplo: "Rua Nome, 123, Bairro, Cidade"'
            });
          }
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 300);
    } else if (value.length < 2) {
      setOriginSuggestions([]);
      if (originTimeoutRef.current) {
        clearTimeout(originTimeoutRef.current);
      }
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationValue(value);
    
    // Controle de debounce para evitar chamadas excessivas
    const now = Date.now();
    if (now - lastQueryTime < 300) {
      if (destinationTimeoutRef.current) {
        clearTimeout(destinationTimeoutRef.current);
      }
    }
    setLastQueryTime(now);
    
    if (value.length >= 2 && errorCount < 5) {
      setIsLoadingSuggestions(true);
      
      if (destinationTimeoutRef.current) {
        clearTimeout(destinationTimeoutRef.current);
      }
      
      destinationTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('Fetching destination suggestions for:', value);
          const suggestions = await fetchAddressSuggestions(value);
          console.log('Received destination suggestions:', suggestions.length);
          setDestinationSuggestions(suggestions);
          
          if (suggestions.length === 0 && value.length > 5) {
            console.log("Sem resultados para destino: " + value);
          }
        } catch (error) {
          console.error('Erro ao buscar sugestões de destino:', error);
          setErrorCount(prev => prev + 1);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 300);
    } else if (value.length < 2) {
      setDestinationSuggestions([]);
      if (destinationTimeoutRef.current) {
        clearTimeout(destinationTimeoutRef.current);
      }
    }
  };

  const handleOriginNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOriginNumber(e.target.value);
  };

  const handleDestinationNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinationNumber(e.target.value);
  };

  const selectSuggestion = (suggestion: any, isOrigin: boolean) => {
    const placeName = suggestion.place_name || suggestion.text;
    if (isOrigin) {
      console.log('Selected origin suggestion:', placeName);
      setOriginValue(placeName);
      setOriginSuggestions([]);
    } else {
      console.log('Selected destination suggestion:', placeName);
      setDestinationValue(placeName);
      setDestinationSuggestions([]);
    }
  };

  const clearOrigin = () => {
    setOriginValue('');
    setOriginNumber('');
    setOriginSuggestions([]);
  };

  const clearDestination = () => {
    setDestinationValue('');
    setDestinationNumber('');
    setDestinationSuggestions([]);
  };

  const bookingData: BookingFormData = {
    originValue,
    destinationValue,
    originNumber,
    destinationNumber,
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
    originNumber,
    destinationNumber,
    date,
    returnDate,
    tripType,
    passengers,
    passengerData,
    time,
    returnTime,
    originSuggestions,
    destinationSuggestions,
    isLoadingSuggestions,
    showBookingSteps,
    setOriginValue,
    setDestinationValue,
    setTripType,
    setDate,
    setReturnDate,
    setPassengers,
    setPassengerData,
    setTime,
    setReturnTime,
    handleOriginChange,
    handleDestinationChange,
    handleOriginNumberChange,
    handleDestinationNumberChange,
    selectSuggestion,
    handleBooking,
    setShowBookingSteps,
    bookingData,
    clearOrigin,
    clearDestination
  };
};
