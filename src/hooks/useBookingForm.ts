
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
  
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset error count after a period to allow retrying
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
    
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }
    
    // Só buscar sugestões se o usuário já digitou pelo menos 3 caracteres
    // e não tivemos muitos erros recentes
    if (value.length >= 3 && errorCount < 5) {
      setIsLoadingSuggestions(true);
      
      originTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await fetchAddressSuggestions(value);
          setOriginSuggestions(suggestions);
          
          // Se não encontrou nada, sugerir adicionar mais informações
          if (suggestions.length === 0 && value.length > 5) {
            console.log("Sem resultados para: " + value);
          }
        } catch (error) {
          console.error('Erro ao buscar sugestões:', error);
          setErrorCount(prev => prev + 1);
          
          // Avisar o usuário apenas na primeira falha
          if (errorCount === 0) {
            toast.error('Erro ao buscar sugestões de endereço. Tente um formato diferente.', {
              description: 'Exemplo: "Rua Nome, 123, Bairro, Cidade"'
            });
          }
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 300);
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
    
    if (value.length >= 3 && errorCount < 5) {
      setIsLoadingSuggestions(true);
      
      destinationTimeoutRef.current = setTimeout(async () => {
        try {
          const suggestions = await fetchAddressSuggestions(value);
          setDestinationSuggestions(suggestions);
        } catch (error) {
          console.error('Erro ao buscar sugestões:', error);
          setErrorCount(prev => prev + 1);
        } finally {
          setIsLoadingSuggestions(false);
        }
      }, 300);
    } else {
      setDestinationSuggestions([]);
    }
  };

  const handleOriginNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOriginNumber(e.target.value);
  };

  const handleDestinationNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinationNumber(e.target.value);
  };

  const selectSuggestion = (suggestion: any, isOrigin: boolean) => {
    const placeName = suggestion.place_name;
    if (isOrigin) {
      setOriginValue(placeName);
      setOriginSuggestions([]);
    } else {
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
