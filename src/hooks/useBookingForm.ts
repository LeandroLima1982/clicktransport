
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { cityService, City } from '@/services/db/cityService';

export interface PassengerInfo {
  name: string;
  phone: string;
}

export interface BookingFormData {
  originValue: string;
  destinationValue: string;
  originCity?: string;
  destinationCity?: string;
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
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [passengers, setPassengers] = useState('1');
  const [passengerData, setPassengerData] = useState<PassengerInfo[]>([{ name: '', phone: '' }]);
  const [showBookingSteps, setShowBookingSteps] = useState(false);
  const [time, setTime] = useState<string>('');
  const [returnTime, setReturnTime] = useState<string>('');
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  
  useEffect(() => {
    fetchAvailableCities();
  }, []);
  
  const fetchAvailableCities = async () => {
    setIsLoadingCities(true);
    try {
      const cities = await cityService.getActiveCities();
      setAvailableCities(cities);
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.error('Erro ao carregar cidades disponíveis');
    } finally {
      setIsLoadingCities(false);
    }
  };
  
  const handleBooking = () => {
    if (!originValue) {
      toast.error('Por favor, informe o endereço de origem.');
      return;
    }
    
    if (!originCity) {
      toast.error('Por favor, selecione a cidade de origem.');
      return;
    }
    
    if (!destinationValue) {
      toast.error('Por favor, informe o endereço de destino.');
      return;
    }
    
    if (!destinationCity) {
      toast.error('Por favor, selecione a cidade de destino.');
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
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationValue(value);
  };

  const bookingData: BookingFormData = {
    originValue,
    destinationValue,
    originCity,
    destinationCity,
    date,
    returnDate,
    tripType,
    passengers,
    time,
    returnTime,
    passengerData
  };

  // Calculate distance between cities if both are selected
  const calculateDistanceBetweenCities = (): number | null => {
    if (!originCity || !destinationCity) return null;
    
    const originCityObj = availableCities.find(city => city.id === originCity);
    const destCityObj = availableCities.find(city => city.id === destinationCity);
    
    if (!originCityObj || !destCityObj) return null;
    
    return cityService.calculateDistance(
      originCityObj.latitude, 
      originCityObj.longitude, 
      destCityObj.latitude, 
      destCityObj.longitude
    );
  };

  const estimatedDistance = calculateDistanceBetweenCities();

  return {
    originValue,
    destinationValue,
    originCity,
    destinationCity,
    date,
    returnDate,
    tripType,
    passengers,
    passengerData,
    time,
    returnTime,
    showBookingSteps,
    availableCities,
    isLoadingCities,
    estimatedDistance,
    setOriginCity,
    setDestinationCity,
    setTripType,
    setDate,
    setReturnDate,
    setPassengers,
    setPassengerData,
    setTime,
    setReturnTime,
    handleOriginChange,
    handleDestinationChange,
    handleBooking,
    setShowBookingSteps,
    fetchAvailableCities,
    bookingData,
  };
};
