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
import { MapPin, RotateCw } from 'lucide-react';
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
  useEffect(() => {
    fetchCities();
  }, [fetchCities]);
  useEffect(() => {
    const calculateDistance = async () => {
      if (originCityId && destinationCityId) {
        const originCityObj = cities.find(city => city.id === originCityId);
        const destinationCityObj = cities.find(city => city.id === destinationCityId);
        if (originCityObj && destinationCityObj) {
          // Set city names for later use in the combined address
          setOriginCity(formatCityLabel(originCityObj));
          setDestinationCity(formatCityLabel(destinationCityObj));
          try {
            // First check if we have this distance in our database
            const savedDistance = await getDistanceBetweenCities(originCityId, destinationCityId);
            if (savedDistance && savedDistance.exists) {
              setDistanceInfo({
                distance: savedDistance.distance,
                duration: savedDistance.duration
              });
              return;
            }

            // If not in database, calculate using the API
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
    // Format with state as abbreviation
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

  // Get the full address combining the manual input with the selected city
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
  return <div className="w-full bg-[#FEF7E4] rounded-lg md:rounded-2xl shadow-lg overflow-hidden">
      <div className="pt-5 md:pt-7 pb-6 md:pb-8 bg-gradient-to-b from-amber-300 to-amber-200 py-0 px-[20px] md:px-[54px] bg-amber-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 space-y-3 md:space-y-0">
          <h3 className="font-extrabold text-xl md:text-2xl text-stone-700">Agendar viagem</h3>
          <TripTypeTabs value={tripType} onChange={setTripType} />
        </div>

        <div className="space-y-5 md:space-y-6">
          {/* Simplified Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin Section */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                De onde vai sair?
              </Label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <MapPin className="h-4 w-4 text-amber-400" />
                    </div>
                    <Input placeholder="Av, Rua, Travessa, Aeroporto, Rodoviária, Número, Bairro" value={originValue} onChange={handleManualOriginChange} className="pl-9 pr-3 py-2.5 text-sm bg-white border-gray-100 h-11 focus:border-amber-300 focus:ring-amber-300" />
                  </div>
                </div>
                <div className="w-full sm:w-[180px]">
                  <div className="flex">
                    <Select value={originCityId} onValueChange={setOriginCityId}>
                      <SelectTrigger className="h-11 bg-white">
                        <SelectValue placeholder="Cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.filter(city => city.is_active !== false).map(city => <SelectItem key={city.id} value={city.id}>
                            {formatCityLabel(city)}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Destination Section */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Para onde vai?
              </Label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <MapPin className="h-4 w-4 text-amber-400" />
                    </div>
                    <Input placeholder="Av, Rua, Travessa, Aeroporto, Rodoviária, Número, Bairro" value={destinationValue} onChange={handleManualDestinationChange} className="pl-9 pr-3 py-2.5 text-sm bg-white border-gray-100 h-11 focus:border-amber-300 focus:ring-amber-300" />
                  </div>
                </div>
                <div className="w-full sm:w-[180px]">
                  <Select value={destinationCityId} onValueChange={setDestinationCityId}>
                    <SelectTrigger className="h-11 bg-white">
                      <SelectValue placeholder="Cidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.filter(city => city.is_active !== false).map(city => <SelectItem key={city.id} value={city.id}>
                          {formatCityLabel(city)}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          {distanceInfo}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {tripType === 'roundtrip' && <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 mt-1 border-t border-amber-200">
              <div>
                <Label className="text-gray-700 block text-sm font-medium mb-2">
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
            </div>}
        </div>

        <Button onClick={handleBooking} className="w-full rounded-lg mt-6 text-black text-lg font-medium h-12 md:h-14 bg-amber-400 hover:bg-amber-500 transition-all duration-300 shadow-md relative overflow-hidden my-[39px]" disabled={!originCityId || !destinationCityId}>
          <span className="relative z-10 flex items-center justify-center">
            Buscar
          </span>
        </Button>

        {bookingData && showBookingSteps && <BookingSteps bookingData={{
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
      } as BookingData} isOpen={showBookingSteps} onClose={() => setShowBookingSteps(false)} />}
      </div>
    </div>;
};
export default BookingForm;