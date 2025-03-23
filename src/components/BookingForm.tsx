
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookingSteps } from './booking';
import { useBookingForm } from '@/hooks/useBookingForm';
import AddressInput from './booking/AddressInput';
import CitySelector from './booking/CitySelector';
import DateSelector from './booking/DateSelector';
import TripTypeTabs from './booking/TripTypeTabs';
import TimeSelector from './TimeSelector';
import PassengerSelector from './booking/PassengerSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const BookingForm: React.FC = () => {
  const {
    originValue,
    destinationValue,
    originCity,
    destinationCity,
    date,
    returnDate,
    tripType,
    time,
    returnTime,
    passengers,
    passengerData,
    availableCities,
    isLoadingCities,
    estimatedDistance,
    setPassengers,
    setPassengerData,
    setTripType,
    setDate,
    setReturnDate,
    setTime,
    setReturnTime,
    handleOriginChange,
    handleDestinationChange,
    handleBooking,
    setShowBookingSteps,
    bookingData,
    showBookingSteps,
    setOriginCity,
    setDestinationCity
  } = useBookingForm();
  
  const isMobile = useIsMobile();

  const handleOriginCityChange = (value: string) => {
    setOriginCity(value);
  };

  const handleDestinationCityChange = (value: string) => {
    setDestinationCity(value);
  };

  return (
    <div className="w-full bg-[#FEF7E4] rounded-lg md:rounded-2xl shadow-lg overflow-hidden">
      <div className="pt-5 md:pt-7 pb-6 md:pb-8 bg-gradient-to-b from-amber-300 to-amber-200 py-0 px-[20px] md:px-[54px] bg-amber-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 space-y-3 md:space-y-0">
          <h3 className="font-extrabold text-xl md:text-2xl text-stone-700 mx-[19px] my-[14px]">Agendar viagem</h3>
          <TripTypeTabs value={tripType} onChange={setTripType} />
        </div>

        <div className="space-y-4 md:space-y-5">
          {/* Address inputs with responsive layout - side by side on larger screens */}
          <div className="md:max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:gap-4 space-y-4 md:space-y-0">
              {/* Origin address and city */}
              <div className="flex-1 space-y-4">
                <AddressInput 
                  id="origin" 
                  label="Endereço de origem" 
                  placeholder="Rua, Av, Travessa, Aeroporto, etc." 
                  value={originValue} 
                  onChange={handleOriginChange} 
                />
                <CitySelector 
                  id="originCity" 
                  label="Cidade de origem" 
                  value={originCity} 
                  onChange={handleOriginCityChange} 
                  cities={availableCities} 
                  isLoading={isLoadingCities}
                />
              </div>
              
              {/* Destination address and city */}
              <div className="flex-1 space-y-4">
                <AddressInput 
                  id="destination" 
                  label="Endereço de destino" 
                  placeholder="Rua, Av, Travessa, Aeroporto, etc." 
                  value={destinationValue} 
                  onChange={handleDestinationChange} 
                />
                <CitySelector 
                  id="destinationCity" 
                  label="Cidade de destino" 
                  value={destinationCity} 
                  onChange={handleDestinationCityChange} 
                  cities={availableCities} 
                  isLoading={isLoadingCities}
                />
              </div>
            </div>
          </div>

          {/* Display estimated distance if available */}
          {estimatedDistance && (
            <div className="flex justify-center">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Distância estimada: {Math.round(estimatedDistance)} km
              </Badge>
            </div>
          )}

          {/* Combined Date & Time selector with Passengers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date & Time combined inline */}
            <div>
              <Label className="text-gray-700 block text-sm font-medium mb-2">
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

            <div className="space-y-2">
              <PassengerSelector value={passengers} onChange={setPassengers} />
            </div>
          </div>

          {/* Return trip fields */}
          {tripType === 'roundtrip' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 mt-1 border-t border-amber-200">
              <div>
                <Label className="text-gray-700 block text-sm font-medium mb-2">
                  Volta quando?
                </Label>
                <div className="flex flex-col sm:flex-row sm:space-x-0">
                  <div className="sm:w-1/2 mb-2 sm:mb-0">
                    <DateSelector 
                      hideLabel 
                      date={returnDate} 
                      onSelect={setReturnDate} 
                      disabledDates={currentDate => currentDate < (date || new Date())} 
                      isConnected={true} 
                      position="left" 
                    />
                  </div>
                  <div className="sm:w-1/2">
                    <TimeSelector 
                      value={returnTime} 
                      onChange={setReturnTime} 
                      connected 
                      position="right" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={handleBooking} 
          className="w-full rounded-lg mt-6 text-black text-lg font-medium h-12 md:h-14 bg-amber-400 hover:bg-amber-500 transition-all duration-300 shadow-md relative overflow-hidden my-[39px]"
        >
          <span className="relative z-10 flex items-center justify-center">
            Buscar
          </span>
        </Button>

        {bookingData && showBookingSteps && (
          <BookingSteps 
            bookingData={{
              origin: `${originValue}, ${availableCities.find(city => city.id === originCity)?.name || ''}`,
              destination: `${destinationValue}, ${availableCities.find(city => city.id === destinationCity)?.name || ''}`,
              date: date,
              returnDate: returnDate,
              tripType: tripType,
              passengers: passengers,
              time: time,
              returnTime: returnTime,
              passengerData: passengerData
            }} 
            isOpen={showBookingSteps} 
            onClose={() => setShowBookingSteps(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default BookingForm;
