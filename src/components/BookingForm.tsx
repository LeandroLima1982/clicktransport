import React from 'react';
import { Button } from '@/components/ui/button';
import { BookingSteps } from './booking';
import { useBookingForm } from '@/hooks/useBookingForm';
import LocationInput from './booking/LocationInput';
import DateSelector from './booking/DateSelector';
import TripTypeTabs from './booking/TripTypeTabs';
import TimeSelector from './TimeSelector';
import PassengerSelector from './booking/PassengerSelector';
import PassengerInfoFields from './booking/PassengerInfoFields';
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
    passengers,
    passengerData,
    setPassengers,
    setPassengerData,
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
    bookingData,
    clearOrigin,
    clearDestination
  } = useBookingForm();
  const isMobile = useIsMobile();
  return <div className="w-full bg-[#FEF7E4] rounded-lg md:rounded-2xl shadow-lg overflow-hidden">
      <div className="px-4 md:px-8 pt-5 md:pt-7 pb-6 md:pb-8 bg-amber-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-3 md:space-y-0">
          <h3 className="font-extrabold text-2xl text-stone-700">Agendar</h3>
          <TripTypeTabs value={tripType} onChange={setTripType} />
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocationInput id="origin" label="De onde vai sair?" placeholder="Endereço origem" value={originValue} onChange={handleOriginChange} suggestions={originSuggestions} onSelectSuggestion={suggestion => selectSuggestion(suggestion, true)} onClear={clearOrigin} />
            
            <LocationInput id="destination" label="Para onde vai?" placeholder="Endereço destino" value={destinationValue} onChange={handleDestinationChange} suggestions={destinationSuggestions} onSelectSuggestion={suggestion => selectSuggestion(suggestion, false)} onClear={clearDestination} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DateSelector label="Vai quando?" date={date} onSelect={setDate} disabledDates={date => date < new Date()} />

            <div className="space-y-2">
              <label className="text-gray-700 block text-sm font-medium">
                Horário de ida
              </label>
              <TimeSelector value={time} onChange={setTime} />
            </div>

            <PassengerSelector value={passengers} onChange={setPassengers} />
          </div>

          {tripType === 'roundtrip' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-1 border-t border-amber-200">
              <DateSelector label="Volta quando?" date={returnDate} onSelect={setReturnDate} disabledDates={currentDate => currentDate < (date || new Date())} />
              
              <div className="space-y-2">
                <label className="text-gray-700 block text-sm font-medium">
                  Horário de volta
                </label>
                <TimeSelector value={returnTime} onChange={setReturnTime} />
              </div>
            </div>}
          
          {passengers && parseInt(passengers) > 0 && <PassengerInfoFields passengerCount={parseInt(passengers)} passengerData={passengerData} onPassengerDataChange={setPassengerData} />}
        </div>

        <Button onClick={handleBooking} className="w-full rounded-lg mt-7 text-black text-lg font-medium h-14 bg-amber-400 hover:bg-amber-500 transition-all duration-300 my-[49px]">
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
        passengers: passengers,
        time: time,
        returnTime: returnTime,
        passengerData: passengerData
      }} isOpen={showBookingSteps} onClose={() => setShowBookingSteps(false)} />}
      </div>
    </div>;
};
export default BookingForm;