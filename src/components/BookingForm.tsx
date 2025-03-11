
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookingSteps } from './booking';
import { useBookingForm } from '@/hooks/useBookingForm';
import LocationInput from './booking/LocationInput';
import DateSelector from './booking/DateSelector';
import TripTypeTabs from './booking/TripTypeTabs';
import TimeSelector from './TimeSelector';
import { useIsMobile } from '@/hooks/use-mobile';

const BookingForm: React.FC = () => {
  const {
    originValue,
    destinationValue,
    date,
    returnDate,
    tripType,
    time,
    returnTime,
    originSuggestions,
    destinationSuggestions,
    showBookingSteps,
    setTripType,
    setDate,
    setReturnDate,
    setTime,
    setReturnTime,
    handleOriginChange,
    handleDestinationChange,
    selectSuggestion,
    handleBooking,
    setShowBookingSteps,
    bookingData
  } = useBookingForm();
  
  const isMobile = useIsMobile();

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-3 md:space-y-0">
        <h3 className="text-xl font-bold text-gray-800">Qual seu destino?</h3>
        <TripTypeTabs 
          value={tripType}
          onChange={setTripType}
        />
      </div>

      <div className="space-y-4">
        <LocationInput
          id="origin"
          label="De onde vai sair?"
          placeholder="Endereço origem"
          value={originValue}
          onChange={handleOriginChange}
          suggestions={originSuggestions}
          onSelectSuggestion={(suggestion) => selectSuggestion(suggestion, true)}
        />
        
        <LocationInput
          id="destination"
          label="Para onde vai?"
          placeholder="Endereço destino"
          value={destinationValue}
          onChange={handleDestinationChange}
          suggestions={destinationSuggestions}
          onSelectSuggestion={(suggestion) => selectSuggestion(suggestion, false)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateSelector
            label="Vai quando?"
            date={date}
            onSelect={setDate}
            disabledDates={(date) => date < new Date()}
          />

          <div className="space-y-2">
            <label className="text-gray-700 flex items-center text-sm font-medium">
              Horário de ida
            </label>
            <TimeSelector
              value={time}
              onChange={setTime}
            />
          </div>
        </div>

        {tripType === 'roundtrip' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <DateSelector
              label="Volta quando?"
              date={returnDate}
              onSelect={setReturnDate}
              disabledDates={(currentDate) => currentDate < (date || new Date())}
            />
            
            <div className="space-y-2">
              <label className="text-gray-700 flex items-center text-sm font-medium">
                Horário de volta
              </label>
              <TimeSelector
                value={returnTime}
                onChange={setReturnTime}
              />
            </div>
          </div>
        )}
      </div>

      <Button 
        onClick={handleBooking} 
        className="w-full py-6 rounded-lg mt-6 bg-[#F8D748] hover:bg-[#F8D748]/90 text-black text-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <span className="relative z-10 flex items-center justify-center">
          Buscar
        </span>
      </Button>

      {bookingData && showBookingSteps && (
        <BookingSteps
          bookingData={{
            origin: originValue,
            destination: destinationValue,
            date: date,
            returnDate: returnDate,
            tripType: tripType,
            passengers: bookingData.passengers,
            time: time,
            returnTime: returnTime
          }}
          isOpen={showBookingSteps}
          onClose={() => setShowBookingSteps(false)}
        />
      )}
    </div>
  );
};

export default BookingForm;
