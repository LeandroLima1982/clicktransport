
import React from 'react';
import { Button } from '@/components/ui/button';
import { BookingSteps } from './booking';
import { useBookingForm } from '@/hooks/useBookingForm';
import LocationInput from './booking/LocationInput';
import DateSelector from './booking/DateSelector';
import TripTypeTabs from './booking/TripTypeTabs';

const BookingForm: React.FC = () => {
  const {
    originValue,
    destinationValue,
    date,
    returnDate,
    tripType,
    originSuggestions,
    destinationSuggestions,
    showBookingSteps,
    setTripType,
    setDate,
    setReturnDate,
    handleOriginChange,
    handleDestinationChange,
    selectSuggestion,
    handleBooking,
    setShowBookingSteps,
    bookingData
  } = useBookingForm();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-gray-800">Qual seu destino?</h3>
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

        <DateSelector
          label="Vai quando?"
          date={date}
          onSelect={setDate}
          disabledDates={(date) => date < new Date()}
        />

        {tripType === 'roundtrip' && (
          <DateSelector
            label="Volta quando?"
            date={returnDate}
            onSelect={setReturnDate}
            disabledDates={(currentDate) => currentDate < (date || new Date())}
          />
        )}
      </div>

      <Button 
        onClick={handleBooking} 
        className="w-full py-6 rounded-lg mt-4 bg-[#F8D748] hover:bg-[#F8D748]/90 text-black text-lg font-medium"
      >
        <span className="relative z-10 flex items-center justify-center">
          Buscar
        </span>
      </Button>

      {bookingData && (
        <BookingSteps
          bookingData={bookingData}
          isOpen={showBookingSteps}
          onClose={() => setShowBookingSteps(false)}
        />
      )}
    </div>
  );
};

export default BookingForm;
