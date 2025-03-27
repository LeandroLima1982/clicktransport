
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
import TransitionEffect from '@/components/TransitionEffect';

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
  
  // New state for the multi-step booking process
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{
    origin?: string;
    destination?: string;
    date?: string;
    time?: string;
    returnDate?: string;
    returnTime?: string;
  }>({});
  
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

  // Validation functions for each step
  const validateOriginStep = (): boolean => {
    const errors: {origin?: string} = {};
    
    if (!originValue || !originCityId) {
      errors.origin = "Por favor, informe o local de origem";
    }
    
    setFormErrors(prevErrors => ({...prevErrors, ...errors}));
    return Object.keys(errors).length === 0;
  };
  
  const validateDestinationStep = (): boolean => {
    const errors: {destination?: string} = {};
    
    if (!destinationValue || !destinationCityId) {
      errors.destination = "Por favor, informe o local de destino";
    }
    
    setFormErrors(prevErrors => ({...prevErrors, ...errors}));
    return Object.keys(errors).length === 0;
  };
  
  const validateTripDetailsStep = (): boolean => {
    const errors: {
      date?: string;
      time?: string;
      returnDate?: string;
      returnTime?: string;
    } = {};
    
    if (!date) {
      errors.date = "Por favor, selecione a data da viagem";
    }
    
    if (!time) {
      errors.time = "Por favor, selecione o horário da viagem";
    }
    
    if (tripType === 'roundtrip') {
      if (!returnDate) {
        errors.returnDate = "Por favor, selecione a data de retorno";
      }
      
      if (!returnTime) {
        errors.returnTime = "Por favor, selecione o horário de retorno";
      }
    }
    
    setFormErrors(prevErrors => ({...prevErrors, ...errors}));
    return Object.keys(errors).length === 0;
  };
  
  // Function to handle going to the next step
  const goToNextStep = () => {
    let isValid = false;
    
    // Validate current step
    if (currentStep === 1) {
      isValid = validateOriginStep();
    } else if (currentStep === 2) {
      isValid = validateDestinationStep();
    } else if (currentStep === 3) {
      isValid = validateTripDetailsStep();
      if (isValid) {
        handleBooking();
        return;
      }
    }
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };
  
  // Function to handle going to the previous step
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  // Render progress indicator
  const renderProgressIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center w-full max-w-xs">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div 
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                  currentStep >= step 
                    ? 'bg-amber-400 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div 
                  className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    currentStep > step 
                      ? 'bg-amber-400' 
                      : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TransitionEffect direction="fade" delay={100}>
            <div className="booking-input-container p-3 hover:bg-white/20 transition-colors duration-200 shadow-lg input-shadow">
              <Label className="block text-lg font-semibold booking-label mb-3 text-center">
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
              {formErrors.origin && (
                <p className="text-red-300 text-sm mt-2">{formErrors.origin}</p>
              )}
            </div>
          </TransitionEffect>
        );
      case 2:
        return (
          <TransitionEffect direction="fade" delay={100}>
            <div className="booking-input-container p-3 hover:bg-white/20 transition-colors duration-200 shadow-lg input-shadow">
              <Label className="block text-lg font-semibold booking-label mb-3 text-center">
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
              {formErrors.destination && (
                <p className="text-red-300 text-sm mt-2">{formErrors.destination}</p>
              )}
            </div>
          </TransitionEffect>
        );
      case 3:
        return (
          <TransitionEffect direction="fade" delay={100}>
            <div className="space-y-5">
              <div className="flex justify-center mb-4 mt-1">
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
                  {(formErrors.date || formErrors.time) && (
                    <p className="text-red-300 text-sm mt-2">
                      {formErrors.date || formErrors.time}
                    </p>
                  )}
                </div>

                <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow">
                  <PassengerSelector value={passengers} onChange={setPassengers} />
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
                    {(formErrors.returnDate || formErrors.returnTime) && (
                      <p className="text-red-300 text-sm mt-2">
                        {formErrors.returnDate || formErrors.returnTime}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TransitionEffect>
        );
      default:
        return null;
    }
  };

  // Render summary (visible after step 1)
  const renderSummary = () => {
    if (currentStep === 1) return null;
    
    return (
      <div className="mb-4 p-3 bg-white/10 rounded-md border border-[#D4AF37]/30">
        {currentStep >= 2 && originValue && originCityId && (
          <div className="flex items-center text-sm">
            <span className="font-semibold mr-2">De:</span>
            <span className="text-white/90">{getFullOriginAddress()}</span>
          </div>
        )}
        
        {currentStep >= 3 && destinationValue && destinationCityId && (
          <div className="flex items-center text-sm mt-1">
            <span className="font-semibold mr-2">Para:</span>
            <span className="text-white/90">{getFullDestinationAddress()}</span>
          </div>
        )}
        
        {distanceInfo && currentStep >= 3 && (
          <div className="text-xs text-amber-200 mt-2">
            Distância: ~{Math.round(distanceInfo.distance)} km • Tempo estimado: ~{Math.floor(distanceInfo.duration / 60)}h{distanceInfo.duration % 60 > 0 ? ` ${Math.round(distanceInfo.duration % 60)}min` : ''}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full bg-[#002366] rounded-xl md:rounded-2xl overflow-hidden backdrop-blur-md border-b border-l border-r border-[#D4AF37] shadow-[0_15px_50px_rgba(0,0,0,0.5)] glass-morphism transition-all duration-300">
      <div className="relative pt-6 md:pt-7 pb-6 md:pb-8 px-5 md:px-6 lg:px-8">
        {renderProgressIndicator()}
        {renderSummary()}
        <div className="space-y-6">
          {renderStepContent()}
        </div>

        <div className="flex justify-between mt-6">
          {currentStep > 1 ? (
            <Button 
              onClick={goToPreviousStep}
              className="rounded-lg text-[#002366] font-medium py-2 px-4
                        shadow-md bg-white/80 hover:bg-white
                        border border-white/60 transition-all duration-300"
            >
              Voltar
            </Button>
          ) : (
            <div></div>
          )}
          
          <Button 
            onClick={goToNextStep}
            className="rounded-lg text-[#002366] text-base font-medium py-2 px-4 md:py-2.5 md:px-5 
                    shadow-xl relative overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 
                    hover:from-amber-300 hover:to-amber-200 border border-amber-300 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center justify-center">
              {currentStep === 3 ? 'Buscar Motorista' : 'Continuar'}
              <ArrowRightCircle className="ml-2 h-4 w-4" />
            </span>
          </Button>
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
