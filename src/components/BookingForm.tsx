
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookingSteps } from './booking';
import { useBookingForm } from '@/hooks/useBookingForm';
import DateSelector from './booking/DateSelector';
import TripTypeTabs from './booking/TripTypeTabs';
import TimeSelector from './TimeSelector';
import PassengerSelector from './booking/PassengerSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDestinationsService } from '@/hooks/useDestinationsService';
import { calculateRoute } from '@/utils/routeUtils';
import { MapPin, RotateCw, ArrowDown, ArrowRight, ArrowRightCircle } from 'lucide-react';
import { Separator } from './ui/separator';
import { AnimatePresence, motion } from 'framer-motion';
import BookingProgress from './booking/BookingProgress';
import StepTransition from './booking/StepTransition';

interface BookingData {
  origin: string;
  destination: string;
  date: Date;
  returnDate: Date;
  tripType: "oneway" | "roundtrip";
  passengers: string;
  time?: string;
  returnTime?: string;
  passengerData?: {
    name: string;
    phone: string;
  }[];
  distance?: number;
}

const BookingForm: React.FC = () => {
  const {
    originValue,
    destinationValue,
    date,
    returnDate,
    tripType,
    time,
    returnTime,
    passengers,
    passengerData,
    setPassengers,
    setPassengerData,
    setTripType,
    setDate,
    setReturnDate,
    setTime,
    setReturnTime,
    handleBooking,
    setShowBookingSteps,
    bookingData,
    showBookingSteps,
    setOriginValue,
    setDestinationValue
  } = useBookingForm();
  
  const {
    cities,
    loading: citiesLoading,
    fetchCities,
    getDistanceBetweenCities
  } = useDestinationsService();
  
  const [originCityId, setOriginCityId] = useState<string>('');
  const [destinationCityId, setDestinationCityId] = useState<string>('');
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  const [originCity, setOriginCity] = useState<string>('');
  const [destinationCity, setDestinationCity] = useState<string>('');
  const isMobile = useIsMobile();
  
  // New state for step-by-step booking process
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  
  const totalSteps = 3;
  
  // Function to move to next step
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Function to go back to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Check if location fields are filled to enable next button
  const canProceedFromStep1 = () => {
    return originCityId && destinationCityId && originValue && destinationValue;
  };
  
  // Check if date and time fields are filled to enable next button
  const canProceedFromStep2 = () => {
    if (tripType === 'oneway') {
      return date && time;
    } else {
      return date && time && returnDate && returnTime;
    }
  };
  
  // Final step validation before search
  const canFinishBooking = () => {
    return passengers && canProceedFromStep1() && canProceedFromStep2();
  };
  
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);
  
  useEffect(() => {
    const calculateDistance = async () => {
      if (originCityId && destinationCityId) {
        const originCityObj = cities.find(city => city.id === originCityId);
        const destinationCityObj = cities.find(city => city.id === destinationCityId);
        if (originCityObj && destinationCityObj) {
          setOriginCity(formatCityLabel(originCityObj));
          setDestinationCity(formatCityLabel(destinationCityObj));
          try {
            const savedDistance = await getDistanceBetweenCities(originCityId, destinationCityId);
            if (savedDistance && savedDistance.exists) {
              setDistanceInfo({
                distance: savedDistance.distance,
                duration: savedDistance.duration
              });
              return;
            }
            const originCoords = `${originCityObj.longitude},${originCityObj.latitude}`;
            const destinationCoords = `${destinationCityObj.longitude},${destinationCityObj.latitude}`;
            const routeInfo = await calculateRoute(originCoords, destinationCoords);
            if (routeInfo) {
              setDistanceInfo({
                distance: routeInfo.distance,
                duration: routeInfo.duration
              });
            }
          } catch (error) {
            console.error('Erro ao calcular rota:', error);
            setDistanceInfo(null);
          }
        }
      } else {
        setDistanceInfo(null);
      }
    };
    calculateDistance();
  }, [originCityId, destinationCityId, cities, getDistanceBetweenCities]);
  
  const formatCityLabel = (city: any) => {
    const stateAbbreviation = city.state ? city.state.length > 2 ? city.state.substring(0, 2).toUpperCase() : city.state.toUpperCase() : '';
    return `${city.name}${stateAbbreviation ? `, ${stateAbbreviation}` : ''}`;
  };
  
  const handleRefreshCities = () => {
    fetchCities();
  };
  
  const handleManualOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOriginValue(e.target.value);
  };
  
  const handleManualDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDestinationValue(e.target.value);
  };
  
  const getFullOriginAddress = () => {
    if (originValue && originCity) {
      return `${originValue}, ${originCity}`;
    }
    return originValue;
  };
  
  const getFullDestinationAddress = () => {
    if (destinationValue && destinationCity) {
      return `${destinationValue}, ${destinationCity}`;
    }
    return destinationValue;
  };
  
  const renderDistanceInfo = () => {
    if (!distanceInfo) return null;
    const totalMinutes = Math.round(distanceInfo.duration);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepTransition step={currentStep} direction={direction}>
            <div className="space-y-5 md:space-y-6">
              <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                <div className="booking-input-container p-3 hover:bg-white/20 transition-colors duration-200 shadow-lg input-shadow">
                  <Label className="block text-sm font-semibold booking-label mb-2">
                    De onde vai sair?
                  </Label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <MapPin className="h-4 w-4 text-[#F8D748]" />
                        </div>
                        <Input 
                          placeholder="Digite seu endereço: rua, número, bairro" 
                          value={originValue} 
                          onChange={handleManualOriginChange} 
                          className="pl-9 pr-3 py-2.5 text-sm booking-input h-10 focus:border-[#F8D748] focus:ring-[#F8D748] placeholder:text-white/50" 
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-[180px]">
                      <div className="flex">
                        <Select value={originCityId} onValueChange={setOriginCityId}>
                          <SelectTrigger className="h-10 booking-input text-white border-[#D4AF37]/60 focus:border-[#F8D748] focus:ring-[#F8D748]">
                            <SelectValue placeholder="Selecione cidade" className="text-white/50" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#002366] border border-[#D4AF37] text-white">
                            {cities.filter(city => city.is_active !== false).map(city => (
                              <SelectItem key={city.id} value={city.id} className="hover:bg-white/10 text-white">
                                {formatCityLabel(city)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="booking-input-container p-3 hover:bg-white/20 transition-colors duration-200 shadow-lg input-shadow">
                  <Label className="block text-sm font-semibold booking-label mb-2">
                    Para onde vai?
                  </Label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="flex-1">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <MapPin className="h-4 w-4 text-[#F8D748]" />
                        </div>
                        <Input 
                          placeholder="Digite seu destino: rua, número, bairro" 
                          value={destinationValue} 
                          onChange={handleManualDestinationChange} 
                          className="pl-9 pr-3 py-2.5 text-sm booking-input h-10 focus:border-[#F8D748] focus:ring-[#F8D748] placeholder:text-white/50" 
                        />
                      </div>
                    </div>
                    <div className="w-full sm:w-[180px]">
                      <Select value={destinationCityId} onValueChange={setDestinationCityId}>
                        <SelectTrigger className="h-10 booking-input text-white border-[#D4AF37]/60 focus:border-[#F8D748] focus:ring-[#F8D748]">
                          <SelectValue placeholder="Selecione cidade" className="text-white/50" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#002366] border border-[#D4AF37] text-white">
                          {cities.filter(city => city.is_active !== false).map(city => (
                            <SelectItem key={city.id} value={city.id} className="hover:bg-white/10 text-white">
                              {formatCityLabel(city)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={goToNextStep} 
                  disabled={!canProceedFromStep1()} 
                  className="px-6 rounded-lg text-[#002366] font-medium h-10 transition-all duration-300 
                            shadow-xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                            hover:from-amber-300 hover:to-amber-200 border border-amber-300 flex items-center"
                >
                  Próximo
                  <ArrowRightCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </StepTransition>
        );
      
      case 2:
        return (
          <StepTransition step={currentStep} direction={direction}>
            <div className="space-y-5 md:space-y-6">
              <div className="flex justify-center mb-6 mt-1">
                <TripTypeTabs value={tripType} onChange={setTripType} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                <div className="md:col-span-2 booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow">
                  <Label className="booking-label block text-sm font-semibold mb-2">
                    Vai quando?
                  </Label>
                  <div className="flex flex-col sm:flex-row sm:space-x-0">
                    <div className="sm:w-1/2 mb-2 sm:mb-0">
                      <DateSelector hideLabel date={date} onSelect={setDate} disabledDates={date => date < new Date()} isConnected={true} position="left" />
                    </div>
                    <div className="sm:w-1/2">
                      <TimeSelector value={time} onChange={setTime} connected position="right" />
                    </div>
                  </div>
                </div>
              </div>

              {tripType === 'roundtrip' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 mt-1 border-t border-[#D4AF37]">
                  <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow">
                    <Label className="booking-label block text-sm font-semibold mb-2">
                      Volta quando?
                    </Label>
                    <div className="flex flex-col sm:flex-row sm:space-x-0">
                      <div className="sm:w-1/2 mb-2 sm:mb-0">
                        <DateSelector hideLabel date={returnDate} onSelect={setReturnDate} disabledDates={currentDate => currentDate < (date || new Date())} isConnected={true} position="left" />
                      </div>
                      <div className="sm:w-1/2">
                        <TimeSelector value={returnTime} onChange={setReturnTime} connected position="right" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button 
                  onClick={goToPreviousStep}
                  variant="outline" 
                  className="px-4 rounded-lg text-white border-amber-300/50 hover:bg-white/10 hover:text-amber-300"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={goToNextStep} 
                  disabled={!canProceedFromStep2()} 
                  className="px-6 rounded-lg text-[#002366] font-medium h-10 transition-all duration-300 
                            shadow-xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                            hover:from-amber-300 hover:to-amber-200 border border-amber-300 flex items-center"
                >
                  Próximo
                  <ArrowRightCircle className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </StepTransition>
        );
      
      case 3:
        return (
          <StepTransition step={currentStep} direction={direction}>
            <div className="space-y-5 md:space-y-6">
              <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow">
                <PassengerSelector value={passengers} onChange={setPassengers} />
              </div>

              <div className="flex justify-between">
                <Button 
                  onClick={goToPreviousStep}
                  variant="outline" 
                  className="px-4 rounded-lg text-white border-amber-300/50 hover:bg-white/10 hover:text-amber-300"
                >
                  Voltar
                </Button>
                <Button 
                  onClick={handleBooking} 
                  disabled={!canFinishBooking()} 
                  className="w-40 rounded-lg text-[#002366] text-lg font-medium h-12 transition-all duration-300 
                            shadow-xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                            hover:from-amber-300 hover:to-amber-200 border border-amber-300"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Buscar Motorista
                  </span>
                </Button>
              </div>
            </div>
          </StepTransition>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-[#002366] rounded-xl md:rounded-2xl overflow-hidden backdrop-blur-md border-b border-l border-r border-[#D4AF37] shadow-[0_15px_50px_rgba(0,0,0,0.5)] glass-morphism transition-all duration-300">
      <div className="relative pt-6 md:pt-7 pb-6 md:pb-8 px-5 md:px-6 lg:px-8">
        <BookingProgress currentStep={currentStep} totalSteps={totalSteps} />
        
        <div className="mt-6">
          {renderStep()}
        </div>

        {bookingData && showBookingSteps && (
          <BookingSteps 
            bookingData={{
              origin: getFullOriginAddress(),
              destination: getFullDestinationAddress(),
              date: date,
              returnDate: returnDate,
              tripType: tripType,
              passengers: passengers,
              time: time,
              returnTime: returnTime,
              passengerData: passengerData,
              distance: distanceInfo?.distance
            } as BookingData} 
            isOpen={showBookingSteps} 
            onClose={() => setShowBookingSteps(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default BookingForm;
