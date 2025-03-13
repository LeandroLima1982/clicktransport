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
  return <div className="w-full space-y-4 md:space-y-5 md:px-[26px] rounded-2xl my-0 mx-[8px] px-[37px] py-[48px] bg-yellow-400">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 md:mb-4 space-y-2 md:space-y-0">
        <h3 className="text-lg md:text-xl font-bold text-gray-800">Qual seu destino?</h3>
        <TripTypeTabs value={tripType} onChange={setTripType} />
      </div>

      <div className="space-y-3 md:space-y-4">
        <LocationInput id="origin" label="De onde vai sair?" placeholder="Endereço origem" value={originValue} onChange={handleOriginChange} suggestions={originSuggestions} onSelectSuggestion={suggestion => selectSuggestion(suggestion, true)} />
        
        <LocationInput id="destination" label="Para onde vai?" placeholder="Endereço destino" value={destinationValue} onChange={handleDestinationChange} suggestions={destinationSuggestions} onSelectSuggestion={suggestion => selectSuggestion(suggestion, false)} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <DateSelector label="Vai quando?" date={date} onSelect={setDate} disabledDates={date => date < new Date()} />

          <div className="space-y-1 md:space-y-2">
            <label className="text-gray-700 flex items-center text-sm font-medium">
              Horário de ida
            </label>
            <TimeSelector value={time} onChange={setTime} />
          </div>
        </div>

        {tripType === 'roundtrip' && <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pt-2 border-t border-gray-100">
            <DateSelector label="Volta quando?" date={returnDate} onSelect={setReturnDate} disabledDates={currentDate => currentDate < (date || new Date())} />
            
            <div className="space-y-1 md:space-y-2">
              <label className="text-gray-700 flex items-center text-sm font-medium">
                Horário de volta
              </label>
              <TimeSelector value={returnTime} onChange={setReturnTime} />
            </div>
          </div>}
      </div>

      <Button onClick={handleBooking} className="w-full rounded-lg mt-4 md:mt-6 text-black text-base md:text-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg h-14 md:h-16 my-[33px] px-0 py-0 mx-0 text-center bg-amber-400 hover:bg-amber-300">
        <span className="relative z-10 flex items-center justify-center">
          Buscar
        </span>
      </Button>

      {bookingData && showBookingSteps && <BookingSteps bookingData={{
      origin: originValue,
      destination: destinationValue,
      date: date,
      returnDate: returnDate,
      tripType: tripType,
      passengers: bookingData.passengers,
      time: time,
      returnTime: returnTime
    }} isOpen={showBookingSteps} onClose={() => setShowBookingSteps(false)} />}
    </div>;
};
export default BookingForm;