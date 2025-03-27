
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookingSteps } from './booking';
import { useBookingForm } from '@/hooks/useBookingForm';
import DateSelector from './booking/DateSelector';
import TripTypeTabs from './booking/TripTypeTabs';
import TimeSelector from './TimeSelector';
import PassengerSelector from './booking/PassengerSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { MapPin, Search, ArrowRight, Calendar, X, ChevronRight } from 'lucide-react';
import TransitionEffect from '@/components/TransitionEffect';
import LocationInput from './booking/LocationInput';
import MapPreview from './booking/MapPreview';

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
    setDestinationValue,
    handleOriginChange,
    handleDestinationChange,
    originSuggestions,
    destinationSuggestions,
    selectSuggestion,
    clearOrigin,
    clearDestination
  } = useBookingForm();
  
  const { cities, loading: citiesLoading, fetchCities } = useDestinationsService();
  
  const [distanceInfo, setDistanceInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  
  const isMobile = useIsMobile();
  
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formErrors, setFormErrors] = useState<{
    origin?: string;
    destination?: string;
    date?: string;
    time?: string;
    returnDate?: string;
    returnTime?: string;
  }>({});
  
  const [shouldShowMap, setShouldShowMap] = useState(false);
  
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);
  
  useEffect(() => {
    if (currentStep >= 2 && originValue.length > 5 && destinationValue.length > 5) {
      setShouldShowMap(true);
    } else {
      setShouldShowMap(false);
    }
  }, [originValue, destinationValue, currentStep]);
  
  const handleRouteCalculated = (routeData: { distance: number; duration: number }) => {
    console.log('Route calculation result:', routeData);
    setDistanceInfo(routeData);
  };

  const validateOriginStep = (): boolean => {
    const errors: {origin?: string} = {};
    
    if (!originValue) {
      errors.origin = "Por favor, informe o local de origem";
    }
    
    setFormErrors(prevErrors => ({...prevErrors, ...errors}));
    return Object.keys(errors).length === 0;
  };
  
  const validateDestinationStep = (): boolean => {
    const errors: {destination?: string} = {};
    
    if (!destinationValue) {
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
  
  const goToNextStep = () => {
    let isValid = false;
    
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
  
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Formatação do tempo estimado para exibição
  const formatEstimatedTime = (minutes?: number) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `~${hours}h ${mins > 0 ? `${mins}min` : ''}`;
  };

  // Função para renderizar a barra de progresso moderna
  const renderProgressSteps = () => {
    return (
      <div className="flex justify-center items-center w-full relative mb-4">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            {/* Círculo de etapa */}
            <div 
              className={`flex items-center justify-center w-8 h-8 rounded-full z-10 transition-all duration-300 ${
                currentStep === step 
                  ? 'bg-amber-400 text-white font-bold shadow-md' 
                  : currentStep > step
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {currentStep > step ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step
              )}
            </div>
            
            {/* Linha conectora */}
            {step < 3 && (
              <div className="flex-1 h-1 mx-2">
                <div 
                  className={`h-full transition-all duration-500 ${
                    currentStep > step 
                      ? 'bg-green-500' 
                      : 'bg-gray-200'
                  }`}
                ></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Renderização condicional do conteúdo baseado na etapa atual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TransitionEffect direction="fade" delay={100}>
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <div className="mb-3 text-center">
                <div className="text-lg font-bold text-gray-800">De onde você está saindo?</div>
                <div className="text-xs text-gray-500">Informe o endereço de origem</div>
              </div>
              
              <LocationInput
                id="origin"
                label=""
                placeholder="Digite seu endereço de origem"
                value={originValue}
                onChange={handleOriginChange}
                suggestions={originSuggestions}
                onSelectSuggestion={(suggestion) => selectSuggestion(suggestion, true)}
                onClear={clearOrigin}
              />
              
              {formErrors.origin && (
                <p className="text-red-500 text-sm mt-2">{formErrors.origin}</p>
              )}
              
              {originValue && (
                <div className="flex items-center mt-4 px-3 py-2 bg-blue-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800 font-medium truncate">{originValue}</div>
                </div>
              )}
            </div>
          </TransitionEffect>
        );
      case 2:
        return (
          <TransitionEffect direction="fade" delay={100}>
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <div className="mb-3 text-center">
                <div className="text-lg font-bold text-gray-800">Para onde você vai?</div>
                <div className="text-xs text-gray-500">Informe o endereço de destino</div>
              </div>
              
              <LocationInput
                id="destination"
                label=""
                placeholder="Digite o endereço de destino"
                value={destinationValue}
                onChange={handleDestinationChange}
                suggestions={destinationSuggestions}
                onSelectSuggestion={(suggestion) => selectSuggestion(suggestion, false)}
                onClear={clearDestination}
              />
              
              {formErrors.destination && (
                <p className="text-red-500 text-sm mt-2">{formErrors.destination}</p>
              )}
              
              {originValue && (
                <div className="flex items-center justify-between mt-4 px-3 py-2 bg-blue-50 rounded-t-lg border-b border-blue-100">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <MapPin className="h-3 w-3 text-green-600" />
                    </div>
                    <div className="text-sm text-blue-800 truncate max-w-[200px]">{originValue}</div>
                  </div>
                </div>
              )}
              
              {destinationValue && (
                <div className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded-b-lg">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mr-2">
                      <MapPin className="h-3 w-3 text-red-600" />
                    </div>
                    <div className="text-sm text-blue-800 truncate max-w-[200px]">{destinationValue}</div>
                  </div>
                </div>
              )}
              
              {distanceInfo && (
                <div className="mt-3 text-center text-sm text-gray-600">
                  <span className="font-medium">{Math.round(distanceInfo.distance)} km</span> • 
                  <span className="ml-1">{formatEstimatedTime(distanceInfo.duration)}</span>
                </div>
              )}
            </div>
          </TransitionEffect>
        );
      case 3:
        return (
          <TransitionEffect direction="fade" delay={100}>
            <div className="rounded-xl bg-white p-4 shadow-lg space-y-4">
              <div className="mb-3 text-center">
                <div className="text-lg font-bold text-gray-800">Quando você vai?</div>
                <div className="text-xs text-gray-500">Selecione data, horário e passageiros</div>
              </div>
              
              <div className="flex justify-center mb-4">
                <TripTypeTabs value={tripType} onChange={setTripType} />
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Data e hora da ida</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <DateSelector 
                        hideLabel 
                        date={date} 
                        onSelect={setDate} 
                        disabledDates={date => date < new Date()} 
                        isConnected={true} 
                        position="left" 
                      />
                    </div>
                    <TimeSelector 
                      value={time} 
                      onChange={setTime} 
                      connected 
                      position="right" 
                    />
                  </div>
                  
                  {(formErrors.date || formErrors.time) && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.date || formErrors.time}
                    </p>
                  )}
                </div>
                
                <div className="bg-gray-50 p-3 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Passageiros</span>
                  </div>
                  
                  <PassengerSelector value={passengers} onChange={setPassengers} />
                </div>
                
                {tripType === 'roundtrip' && (
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Data e hora de volta</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <DateSelector 
                          hideLabel 
                          date={returnDate} 
                          onSelect={setReturnDate} 
                          disabledDates={currentDate => currentDate < (date || new Date())} 
                          isConnected={true} 
                          position="left" 
                        />
                      </div>
                      <TimeSelector 
                        value={returnTime} 
                        onChange={setReturnTime} 
                        connected 
                        position="right" 
                      />
                    </div>
                    
                    {(formErrors.returnDate || formErrors.returnTime) && (
                      <p className="text-red-500 text-xs mt-1">
                        {formErrors.returnDate || formErrors.returnTime}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TransitionEffect>
        );
      default:
        return null;
    }
  };

  // Sumário da rota para mostrar enquanto o usuário avança
  const renderRouteSummary = () => {
    if (currentStep === 1 || (!originValue && !destinationValue)) return null;
    
    return (
      <div className="mb-4">
        {shouldShowMap && (
          <div className="rounded-xl overflow-hidden shadow-md mb-2 h-32">
            <MapPreview 
              origin={originValue}
              destination={destinationValue}
              onRouteCalculated={handleRouteCalculated}
            />
          </div>
        )}
        
        {distanceInfo && (
          <div className="bg-blue-900 text-white px-3 py-2 rounded-lg text-xs flex items-center justify-center">
            <div>Distância: <span className="font-medium">{Math.round(distanceInfo.distance)} km</span></div>
            <div className="mx-2">•</div>
            <div>Tempo estimado: <span className="font-medium">{formatEstimatedTime(distanceInfo.duration)}</span></div>
          </div>
        )}
      </div>
    );
  };

  // Ações de navegação (voltar/continuar)
  const renderNavigation = () => {
    return (
      <div className="flex justify-between items-center mt-6">
        {currentStep > 1 ? (
          <Button 
            onClick={goToPreviousStep} 
            variant="outline"
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 bg-white"
          >
            Voltar
          </Button>
        ) : (
          <div></div>
        )}
        
        <Button 
          onClick={goToNextStep}
          className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-medium flex items-center shadow-lg"
        >
          {currentStep === 3 ? 'Buscar Motorista' : 'Continuar'}
          <ChevronRight className="ml-1 h-5 w-5" />
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full bg-gradient-to-b from-blue-900 to-blue-800 rounded-2xl overflow-hidden border border-blue-700 shadow-xl">
      <div className="p-4">
        <div className="mb-2 text-white text-center">
          <h2 className="text-xl font-bold">Seu Transfer em 3 Passos Simples</h2>
        </div>
        
        {renderProgressSteps()}
        {renderRouteSummary()}
        {renderStepContent()}
        {renderNavigation()}

        {bookingData && showBookingSteps && (
          <BookingSteps 
            bookingData={{
              origin: originValue,
              destination: destinationValue,
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
