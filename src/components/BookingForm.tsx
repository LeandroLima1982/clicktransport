import React, { useState, useEffect } from 'react';
import { useBookingForm } from '@/hooks/useBookingForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDestinationsService } from '@/hooks/useDestinationsService';
import { calculateRoute } from '@/utils/routeUtils';
import BookingProgress from './booking/BookingProgress';
import { useBookingFormSteps } from './booking/useBookingFormSteps';
import RouteSelectionStep from './booking/RouteSelectionStep';
import DateTimeSelectionStep from './booking/DateTimeSelectionStep';
import VehicleSelectionStep from './booking/VehicleSelectionStep';
import PaymentSelectionStep from './booking/PaymentSelectionStep';
import PassengerSelectionStep from './booking/PassengerSelectionStep';
import BookingConfirmationStep from './booking/BookingConfirmationStep';
import BookingCompleteStep from './booking/BookingCompleteStep';
import { toast } from 'sonner';

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
  
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>('');
  
  const { 
    currentStep, 
    direction, 
    totalSteps, 
    goToNextStep, 
    goToPreviousStep, 
    setCurrentStep,
    goToStep,
    isFirstStep,
    isLastStep
  } = useBookingFormSteps();
  
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

  const canProceedFromStep1 = (): boolean => {
    return !!(originCityId && destinationCityId && originValue && destinationValue);
  };
  
  const canProceedFromStep2 = (): boolean => {
    if (tripType === 'oneway') {
      return !!(date && time && passengers);
    } else {
      return !!(date && time && returnDate && returnTime && passengers);
    }
  };
  
  const canProceedFromStep3 = (): boolean => {
    return !!selectedVehicle;
  };
  
  const canProceedFromStep4 = (): boolean => {
    return !!selectedPaymentMethod;
  };
  
  const canProceedFromStep5 = (): boolean => {
    const passengerCount = parseInt(passengers, 10);
    for (let i = 0; i < passengerCount; i++) {
      if (!passengerData[i]?.name || !passengerData[i]?.phone) {
        return false;
      }
    }
    return true;
  };
  
  const canProceedFromStep6 = (): boolean => {
    return true;
  };
  
  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reference = 'TRF-' + Math.floor(100000 + Math.random() * 900000);
      setBookingReference(reference);
      setBookingComplete(true);
      
      toast.success('Reserva confirmada com sucesso!');
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Ocorreu um erro ao confirmar a reserva. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RouteSelectionStep 
            originValue={originValue}
            destinationValue={destinationValue}
            originCityId={originCityId}
            destinationCityId={destinationCityId}
            cities={cities}
            handleManualOriginChange={handleManualOriginChange}
            handleManualDestinationChange={handleManualDestinationChange}
            setOriginCityId={setOriginCityId}
            setDestinationCityId={setDestinationCityId}
            goToNextStep={goToNextStep}
            canProceedFromStep1={canProceedFromStep1}
            direction={direction}
            currentStep={currentStep}
            formatCityLabel={formatCityLabel}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
          />
        );
      
      case 2:
        return (
          <DateTimeSelectionStep 
            date={date}
            returnDate={returnDate}
            time={time}
            returnTime={returnTime}
            tripType={tripType}
            passengers={passengers}
            setDate={setDate}
            setReturnDate={setReturnDate}
            setTime={setTime}
            setReturnTime={setReturnTime}
            setTripType={setTripType}
            setPassengers={setPassengers}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
            canProceedFromStep2={canProceedFromStep2}
            direction={direction}
            currentStep={currentStep}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
          />
        );
      
      case 3:
        return (
          <VehicleSelectionStep
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
            canProceedFromStep4={canProceedFromStep3}
            direction={direction}
            currentStep={currentStep}
            distanceInfo={distanceInfo}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
          />
        );
        
      case 4:
        return (
          <PaymentSelectionStep
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            goToNextStep={goToNextStep}
            goToPreviousStep={goToPreviousStep}
            canProceedFromStep5={canProceedFromStep4}
            direction={direction}
            currentStep={currentStep}
            selectedVehicle={selectedVehicle}
            distanceInfo={distanceInfo}
            tripType={tripType}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
          />
        );
        
      case 5:
        return (
          <PassengerSelectionStep 
            passengers={passengers}
            setPassengers={setPassengers}
            passengerData={passengerData}
            setPassengerData={setPassengerData}
            goToPreviousStep={goToPreviousStep}
            goToNextStep={goToNextStep}
            canProceedFromStep3={canProceedFromStep5}
            direction={direction}
            currentStep={currentStep}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
          />
        );
        
      case 6:
        return (
          <BookingConfirmationStep
            origin={getFullOriginAddress()}
            destination={getFullDestinationAddress()}
            date={date}
            returnDate={returnDate}
            time={time}
            returnTime={returnTime}
            tripType={tripType}
            passengers={passengers}
            selectedVehicle={selectedVehicle}
            selectedPaymentMethod={selectedPaymentMethod}
            distanceInfo={distanceInfo}
            goToPreviousStep={goToPreviousStep}
            handleSubmitBooking={handleSubmitBooking}
            isSubmitting={isSubmitting}
            canProceedFromStep6={canProceedFromStep6}
            direction={direction}
            currentStep={currentStep}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
          />
        );
        
      case 7:
        return (
          <BookingCompleteStep
            bookingReference={bookingReference}
            origin={getFullOriginAddress()}
            destination={getFullDestinationAddress()}
            date={date}
            selectedVehicle={selectedVehicle}
            distanceInfo={distanceInfo}
            direction={direction}
            currentStep={currentStep}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-[#002366] rounded-xl md:rounded-2xl overflow-hidden backdrop-blur-md border-b border-l border-r border-[#D4AF37] shadow-[0_15px_50px_rgba(0,0,0,0.5)] glass-morphism transition-all duration-300">
      <div className="relative pt-3 md:pt-5 pb-4 md:pb-6 px-3 md:px-5 lg:px-6">
        <BookingProgress 
          currentStep={currentStep} 
          totalSteps={7} 
          onStepClick={(step) => {
            if (step < currentStep) {
              goToStep(step);
            }
          }} 
        />
        
        <div className="mt-2 md:mt-3 min-h-[360px]">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
