import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookingSteps } from './booking';
import { useBookingForm } from '@/hooks/useBookingForm';
import LocationInput from './booking/LocationInput';
import DateSelector from './booking/DateSelector';
import TripTypeTabs from './booking/TripTypeTabs';
import TimeSelector from './TimeSelector';
import PassengerSelector from './booking/PassengerSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDestinationsService } from '@/hooks/useDestinationsService';
import { calculateRoute } from '@/utils/routeUtils';
import { Check, ChevronDown, MapPin, RotateCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface BookingData {
  origin: string;
  destination: string;
  date: Date;
  returnDate: Date;
  tripType: "oneway" | "roundtrip";
  passengers: string;
  time?: string;
  returnTime?: string;
  passengerData?: { name: string; phone: string; }[];
  distance?: number;
}

const BookingForm: React.FC = () => {
  const {
    originValue,
    destinationValue,
    originNumber,
    destinationNumber,
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
    handleOriginChange,
    handleDestinationChange,
    handleOriginNumberChange,
    handleDestinationNumberChange,
    selectSuggestion,
    handleBooking,
    setShowBookingSteps,
    bookingData,
    showBookingSteps,
    originSuggestions,
    destinationSuggestions,
    clearOrigin,
    clearDestination,
    setOriginValue,
    setDestinationValue
  } = useBookingForm();
  
  const { cities, loading: citiesLoading, fetchCities } = useDestinationsService();
  const [originCityId, setOriginCityId] = useState<string>('');
  const [destinationCityId, setDestinationCityId] = useState<string>('');
  const [useCitySelection, setUseCitySelection] = useState(false);
  const [manualAddressInput, setManualAddressInput] = useState(false);
  const [manualOriginAddress, setManualOriginAddress] = useState('');
  const [manualDestinationAddress, setManualDestinationAddress] = useState('');
  const [distanceInfo, setDistanceInfo] = useState<{ distance: number, duration: number } | null>(null);
  const [inputType, setInputType] = useState<'search' | 'cities' | 'manual'>('search');
  
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  useEffect(() => {
    if (originCityId && inputType === 'cities') {
      const selectedCity = cities.find(city => city.id === originCityId);
      if (selectedCity) {
        const cityAddress = `${selectedCity.name}${selectedCity.state ? `, ${selectedCity.state}` : ''}`;
        setOriginValue(cityAddress);
      }
    }
  }, [originCityId, cities, inputType]);

  useEffect(() => {
    if (destinationCityId && inputType === 'cities') {
      const selectedCity = cities.find(city => city.id === destinationCityId);
      if (selectedCity) {
        const cityAddress = `${selectedCity.name}${selectedCity.state ? `, ${selectedCity.state}` : ''}`;
        setDestinationValue(cityAddress);
      }
    }
  }, [destinationCityId, cities, inputType]);

  useEffect(() => {
    const calculateDistance = async () => {
      if (originCityId && destinationCityId && inputType === 'cities') {
        const originCity = cities.find(city => city.id === originCityId);
        const destinationCity = cities.find(city => city.id === destinationCityId);
        
        if (originCity && destinationCity) {
          try {
            const originCoords = `${originCity.longitude},${originCity.latitude}`;
            const destinationCoords = `${destinationCity.longitude},${destinationCity.latitude}`;
            
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
  }, [originCityId, destinationCityId, cities, inputType]);

  const formatCityLabel = (city: any) => {
    return `${city.name}${city.state ? `, ${city.state}` : ''}`;
  };

  const handleManualOriginChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualOriginAddress(e.target.value);
    setOriginValue(e.target.value);
  };

  const handleManualDestinationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualDestinationAddress(e.target.value);
    setDestinationValue(e.target.value);
  };

  const handleRefreshCities = () => {
    fetchCities();
  };

  return (
    <div className="w-full bg-[#FEF7E4] rounded-lg md:rounded-2xl shadow-lg overflow-hidden">
      <div className="pt-5 md:pt-7 pb-6 md:pb-8 bg-gradient-to-b from-amber-300 to-amber-200 py-0 px-[20px] md:px-[54px] bg-amber-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 space-y-3 md:space-y-0">
          <h3 className="font-extrabold text-xl md:text-2xl text-stone-700">Agendar viagem</h3>
          <TripTypeTabs value={tripType} onChange={setTripType} />
        </div>

        <div className="space-y-5 md:space-y-6">
          <Tabs
            value={inputType}
            onValueChange={(value) => setInputType(value as 'search' | 'cities' | 'manual')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="search" className="text-xs sm:text-sm">
                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                Buscar endere��o
              </TabsTrigger>
              <TabsTrigger value="cities" className="text-xs sm:text-sm">
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Cidades cadastradas
              </TabsTrigger>
              <TabsTrigger value="manual" className="text-xs sm:text-sm">
                <ChevronDown className="h-3.5 w-3.5 mr-1.5" />
                Entrada manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <div className="md:max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:gap-4 space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <LocationInput 
                      id="origin" 
                      label="De onde vai sair?" 
                      placeholder="CEP ou endereço" 
                      value={originValue} 
                      onChange={handleOriginChange} 
                      suggestions={originSuggestions} 
                      onSelectSuggestion={suggestion => selectSuggestion(suggestion, true)} 
                      onClear={clearOrigin} 
                      showNumberField={true} 
                      numberValue={originNumber} 
                      onNumberChange={handleOriginNumberChange} 
                    />
                  </div>
                  
                  <div className="flex-1">
                    <LocationInput 
                      id="destination" 
                      label="Para onde vai?" 
                      placeholder="CEP ou endereço" 
                      value={destinationValue} 
                      onChange={handleDestinationChange} 
                      suggestions={destinationSuggestions} 
                      onSelectSuggestion={suggestion => selectSuggestion(suggestion, false)} 
                      onClear={clearDestination} 
                      showNumberField={true} 
                      numberValue={destinationNumber} 
                      onNumberChange={handleDestinationNumberChange} 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cities">
              <div className="md:max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:gap-4 space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <div className="mb-1.5 flex justify-between items-center">
                      <Label htmlFor="origin-city" className="block text-sm font-medium text-gray-700">
                        De onde vai sair?
                      </Label>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs text-amber-700"
                        onClick={handleRefreshCities}
                      >
                        <RotateCw className="h-3 w-3 mr-1" />
                        Atualizar
                      </Button>
                    </div>
                    <Select
                      value={originCityId}
                      onValueChange={setOriginCityId}
                    >
                      <SelectTrigger id="origin-city" className="bg-white">
                        <SelectValue placeholder="Selecione a cidade de origem" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.filter(city => city.is_active !== false).map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {formatCityLabel(city)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor="destination-city" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Para onde vai?
                    </Label>
                    <Select
                      value={destinationCityId}
                      onValueChange={setDestinationCityId}
                    >
                      <SelectTrigger id="destination-city" className="bg-white">
                        <SelectValue placeholder="Selecione a cidade de destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.filter(city => city.is_active !== false).map((city) => (
                          <SelectItem key={city.id} value={city.id}>
                            {formatCityLabel(city)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {distanceInfo && (
                  <div className="mt-2 text-sm font-medium text-amber-800 bg-amber-50 p-2 rounded-md border border-amber-100">
                    <p>Distância: {distanceInfo.distance.toFixed(2)} km • Tempo estimado: {Math.floor(distanceInfo.duration / 60) > 0 ? `${Math.floor(distanceInfo.duration / 60)}h ` : ''}{Math.round(distanceInfo.duration % 60)}min</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual">
              <div className="md:max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:gap-4 space-y-4 md:space-y-0">
                  <div className="flex-1">
                    <Label htmlFor="manual-origin" className="block text-sm font-medium text-gray-700 mb-1.5">
                      De onde vai sair? (Endereço completo)
                    </Label>
                    <Textarea
                      id="manual-origin"
                      placeholder="Digite o endereço completo de origem"
                      value={manualOriginAddress}
                      onChange={handleManualOriginChange}
                      className="resize-none bg-white border-gray-200 min-h-[80px]"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <Label htmlFor="manual-destination" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Para onde vai? (Endereço completo)
                    </Label>
                    <Textarea
                      id="manual-destination"
                      placeholder="Digite o endereço completo de destino"
                      value={manualDestinationAddress}
                      onChange={handleManualDestinationChange}
                      className="resize-none bg-white border-gray-200 min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

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

        <Button onClick={handleBooking} className="w-full rounded-lg mt-6 text-black text-lg font-medium h-12 md:h-14 bg-amber-400 hover:bg-amber-500 transition-all duration-300 shadow-md relative overflow-hidden my-[39px]">
          <span className="relative z-10 flex items-center justify-center">
            Buscar
          </span>
        </Button>

        {bookingData && showBookingSteps && <BookingSteps bookingData={{
          origin: originValue + (originNumber ? `, ${originNumber}` : ''),
          destination: destinationValue + (destinationNumber ? `, ${destinationNumber}` : ''),
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
    </div>
  );
};

export default BookingForm;
