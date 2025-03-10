import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, ArrowRight, MapPin, Calendar as CalendarIcon2, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookingSteps } from './booking';
import TimeSelector from './TimeSelector';
import { toast } from 'sonner';
import { fetchAddressSuggestions, getPlaceIcon, formatPlaceName } from '@/utils/mapbox';

const BookingForm: React.FC = () => {
  const [originValue, setOriginValue] = useState('');
  const [destinationValue, setDestinationValue] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [passengers, setPassengers] = useState('1');
  const [showBookingSteps, setShowBookingSteps] = useState(false);
  const [time, setTime] = useState<string>('');
  const [returnTime, setReturnTime] = useState<string>('');
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleBooking = () => {
    if (!originValue) {
      toast.error('Por favor, informe o local de origem.');
      return;
    }
    
    if (!destinationValue) {
      toast.error('Por favor, informe o local de destino.');
      return;
    }
    
    if (!date) {
      toast.error('Por favor, selecione a data da viagem.');
      return;
    }
    
    if (!time) {
      toast.error('Por favor, selecione a hora da viagem.');
      return;
    }
    
    if (tripType === 'roundtrip' && !returnDate) {
      toast.error('Por favor, selecione a data de retorno.');
      return;
    }
    
    if (tripType === 'roundtrip' && !returnTime) {
      toast.error('Por favor, selecione a hora de retorno.');
      return;
    }
    
    setShowBookingSteps(true);
  };

  const handleOriginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOriginValue(value);
    
    if (originTimeoutRef.current) {
      clearTimeout(originTimeoutRef.current);
    }
    
    originTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      const suggestions = await fetchAddressSuggestions(value);
      setOriginSuggestions(suggestions);
      setIsLoadingSuggestions(false);
    }, 500);
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestinationValue(value);
    
    if (destinationTimeoutRef.current) {
      clearTimeout(destinationTimeoutRef.current);
    }
    
    destinationTimeoutRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      const suggestions = await fetchAddressSuggestions(value);
      setDestinationSuggestions(suggestions);
      setIsLoadingSuggestions(false);
    }, 500);
  };

  const selectSuggestion = (suggestion: any, isOrigin: boolean) => {
    const placeName = suggestion.place_name;
    if (isOrigin) {
      setOriginValue(placeName);
      setOriginSuggestions([]);
    } else {
      setDestinationValue(placeName);
      setDestinationSuggestions([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-semibold text-gray-800">Qual seu destino?</h3>
        <Tabs defaultValue="oneway" className="w-[200px]" onValueChange={(value) => setTripType(value as 'oneway' | 'roundtrip')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="oneway">Ida</TabsTrigger>
            <TabsTrigger value="roundtrip">Ida e Volta</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="origin" className="text-gray-700 flex items-center text-sm font-medium">
            De onde vai sair?
          </Label>
          <div className="relative">
            <Input
              id="origin"
              placeholder="Endereço origem"
              value={originValue}
              onChange={handleOriginChange}
              className="pl-10 py-6 rounded-lg border-gray-200"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            
            {originSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                <ul className="py-1 max-h-60 overflow-auto">
                  {originSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectSuggestion(suggestion, true)}
                    >
                      <div className="flex items-center gap-2">
                        {getPlaceIcon(suggestion)}
                        {formatPlaceName(suggestion)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="destination" className="text-gray-700 flex items-center text-sm font-medium">
            Para onde vai?
          </Label>
          <div className="relative">
            <Input
              id="destination"
              placeholder="Endereço destino"
              value={destinationValue}
              onChange={handleDestinationChange}
              className="pl-10 py-6 rounded-lg border-gray-200"
            />
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            
            {destinationSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                <ul className="py-1 max-h-60 overflow-auto">
                  {destinationSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectSuggestion(suggestion, false)}
                    >
                      <div className="flex items-center gap-2">
                        {getPlaceIcon(suggestion)}
                        {formatPlaceName(suggestion)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700 flex items-center text-sm font-medium">
            Vai quando?
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal py-6 pl-10 rounded-lg border-gray-200 text-gray-500"
              >
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Data e hora</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {tripType === 'roundtrip' && (
          <div className="space-y-2">
            <Label className="text-gray-700 flex items-center text-sm font-medium">
              Volta quando?
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal py-6 pl-10 rounded-lg border-gray-200 text-gray-500"
                >
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {returnDate ? format(returnDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Data e hora</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  disabled={(currentDate) => currentDate < (date || new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>
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

      <BookingSteps
        bookingData={{
          origin: originValue,
          destination: destinationValue,
          date,
          returnDate,
          tripType,
          passengers,
          time,
          returnTime
        }}
        isOpen={showBookingSteps}
        onClose={() => setShowBookingSteps(false)}
      />
    </div>
  );
};

export default BookingForm;
