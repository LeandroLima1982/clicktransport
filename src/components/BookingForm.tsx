import React, { useState, useEffect } from 'react';
import { BookingSteps } from './booking';
import { useBookingForm } from '@/hooks/useBookingForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDestinationsService } from '@/hooks/useDestinationsService';
import { calculateRoute } from '@/utils/routeUtils';
import BookingProgress from './booking/BookingProgress';
import { useBookingFormSteps } from './booking/useBookingFormSteps';
import RouteSelectionStep from './booking/RouteSelectionStep';
import DateTimeSelectionStep from './booking/DateTimeSelectionStep';
import PassengerSelectionStep from './booking/PassengerSelectionStep';

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
  
  const { currentStep, direction, totalSteps, goToNextStep, goToPreviousStep } = useBookingFormSteps();
  
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
  
  const canFinishBooking = (): boolean => {
    return true;
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
          />
        );
      
      case 3:
        return (
          <PassengerSelectionStep 
            passengers={passengers}
            setPassengers={setPassengers}
            goToPreviousStep={goToPreviousStep}
            handleBooking={handleBooking}
            canFinishBooking={canFinishBooking}
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
