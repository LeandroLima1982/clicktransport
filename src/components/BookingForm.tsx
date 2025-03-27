
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
import { MapPin, RotateCw, ArrowDown, ArrowRight } from 'lucide-react';
import { Separator } from './ui/separator';
import TransitionEffect from './TransitionEffect';

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

  return (
    <TransitionEffect direction="scale" duration={500}>
      <div className="pt-8 md:pt-10 pb-8 md:pb-12 bg-gradient-to-b from-[#002366] via-[#002d80] to-[#003399] rounded-t-xl shadow-lg md:px-[62px] px-[20px] transition-all duration-300 border-t border-blue-300/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
          <h3 className="font-extrabold text-2xl md:text-3xl text-white">Solicitar Motorista</h3>
          <TripTypeTabs value={tripType} onChange={setTripType} />
        </div>

        <div className="space-y-5 md:space-y-6">
          <div className="grid md:grid-cols-2 gap-4 md:gap-5">
            <div className="rounded-lg border border-[#D4AF37]/50 p-4 bg-white/[0.15] shadow-sm transform transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <Label className="block text-sm font-semibold text-white mb-3">
                De onde vai sair?
              </Label>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <MapPin className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                    <Input 
                      placeholder="Digite seu endereço: rua, número, bairro" 
                      value={originValue} 
                      onChange={handleManualOriginChange} 
                      className="pl-9 pr-3 py-2.5 text-sm bg-white border-gray-100 h-12 focus:border-[#D4AF37] focus:ring-[#D4AF37] placeholder:text-gray-400 rounded-md" 
                    />
                  </div>
                </div>
                <div className="w-full sm:w-[180px]">
                  <div className="flex">
                    <Select value={originCityId} onValueChange={setOriginCityId}>
                      <SelectTrigger className="h-12 bg-white text-gray-700 border-gray-100 focus:border-[#D4AF37] focus:ring-[#D4AF37] rounded-md">
                        <SelectValue placeholder="Selecione cidade" className="text-gray-500" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {cities.filter(city => city.is_active !== false).map(city => 
                          <SelectItem key={city.id} value={city.id}>
                            {formatCityLabel(city)}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#D4AF37]/50 p-4 bg-white/[0.15] shadow-sm transform transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <Label className="block text-sm font-semibold text-white mb-3">
                Para onde vai?
              </Label>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <MapPin className="h-4 w-4 text-[#D4AF37]" />
                    </div>
                    <Input 
                      placeholder="Digite seu destino: rua, número, bairro" 
                      value={destinationValue} 
                      onChange={handleManualDestinationChange} 
                      className="pl-9 pr-3 py-2.5 text-sm bg-white border-gray-100 h-12 focus:border-[#D4AF37] focus:ring-[#D4AF37] placeholder:text-gray-400 rounded-md"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-[180px]">
                  <Select value={destinationCityId} onValueChange={setDestinationCityId}>
                    <SelectTrigger className="h-12 bg-white text-gray-700 border-gray-100 focus:border-[#D4AF37] focus:ring-[#D4AF37] rounded-md">
                      <SelectValue placeholder="Selecione cidade" className="text-gray-500" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {cities.filter(city => city.is_active !== false).map(city => 
                        <SelectItem key={city.id} value={city.id}>
                          {formatCityLabel(city)}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex justify-center items-center h-8 relative">
            <Separator className="w-full bg-[#D4AF37]/60" />
            <div className="absolute bg-white rounded-full p-1.5 shadow-md">
              <ArrowRight className="h-5 w-5 text-[#002366]" />
            </div>
          </div>

          <div className="flex md:hidden justify-center items-center h-8 relative mb-2">
            <Separator className="w-full bg-[#D4AF37]/60" />
            <div className="absolute bg-white rounded-full p-1.5 shadow-md">
              <ArrowDown className="h-5 w-5 text-[#002366]" />
            </div>
          </div>

          {renderDistanceInfo()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div>
              <Label className="text-white block text-sm font-medium mb-3">
                Vai quando?
              </Label>
              <div className="flex flex-col sm:flex-row sm:space-x-0">
                <div className="sm:w-1/2 mb-3 sm:mb-0">
                  <DateSelector 
                    hideLabel 
                    date={date} 
                    onSelect={setDate} 
                    disabledDates={date => date < new Date()} 
                    isConnected={true} 
                    position="left" 
                  />
                </div>
                <div className="sm:w-1/2">
                  <TimeSelector 
                    value={time} 
                    onChange={setTime} 
                    connected 
                    position="right" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <PassengerSelector value={passengers} onChange={setPassengers} />
            </div>
          </div>

          {tripType === 'roundtrip' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 mt-2 border-t border-[#D4AF37]/40">
              <div>
                <Label className="text-white block text-sm font-medium mb-3">
                  Volta quando?
                </Label>
                <div className="flex flex-col sm:flex-row sm:space-x-0">
                  <div className="sm:w-1/2 mb-3 sm:mb-0">
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
          disabled={!originCityId || !destinationCityId} 
          className="w-full rounded-lg mt-8 text-white text-lg font-medium h-14 transition-all duration-300 shadow-lg relative overflow-hidden bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 active:scale-[0.98]"
        >
          <span className="relative z-10 flex items-center justify-center">
            Buscar
          </span>
        </Button>

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
    </TransitionEffect>
  );
};

export default BookingForm;
