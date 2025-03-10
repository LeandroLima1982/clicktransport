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
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Agende seu Transfer</h3>
        <Tabs defaultValue="oneway" className="w-[260px]" onValueChange={(value) => setTripType(value as 'oneway' | 'roundtrip')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="oneway">Ida</TabsTrigger>
            <TabsTrigger value="roundtrip">Ida e Volta</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="origin" className="text-white flex items-center">
            <MapPin className="w-4 h-4 mr-1" /> De onde vai sair?
          </Label>
          <div className="relative">
            <Input
              id="origin"
              placeholder="Endereço de origem ou ponto de interesse"
              value={originValue}
              onChange={handleOriginChange}
              className="bg-white/20 border-white/10 text-white placeholder:text-white/60 focus:ring-primary focus:border-primary"
            />
            
            {originSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-background/90 backdrop-blur-sm border border-border rounded-md shadow-lg">
                <ul className="py-1 max-h-60 overflow-auto">
                  {originSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
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
          <Label htmlFor="destination" className="text-white flex items-center">
            <MapPin className="w-4 h-4 mr-1" /> Para onde vai?
          </Label>
          <div className="relative">
            <Input
              id="destination"
              placeholder="Endereço de destino ou ponto de interesse"
              value={destinationValue}
              onChange={handleDestinationChange}
              className="bg-white/20 border-white/10 text-white placeholder:text-white/60 focus:ring-primary focus:border-primary"
            />
            
            {destinationSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-background/90 backdrop-blur-sm border border-border rounded-md shadow-lg">
                <ul className="py-1 max-h-60 overflow-auto">
                  {destinationSuggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      className="px-3 py-2 text-sm hover:bg-accent cursor-pointer"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label className="text-white flex items-center">
            <CalendarIcon2 className="w-4 h-4 mr-1" /> Vai quando?
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal bg-white/20 border-white/10 text-white hover:bg-white/30"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
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

        <div className="space-y-2">
          <Label className="text-white flex items-center">
            <Clock className="w-4 h-4 mr-1" /> Horário de ida
          </Label>
          <TimeSelector value={time} onChange={setTime} />
        </div>

        {tripType === 'roundtrip' && (
          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <CalendarIcon2 className="w-4 h-4 mr-1" /> Volta quando?
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white/20 border-white/10 text-white hover:bg-white/30"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? format(returnDate, "dd/MM/yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
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
        
        {tripType === 'roundtrip' && (
          <div className="space-y-2">
            <Label className="text-white flex items-center">
              <Clock className="w-4 h-4 mr-1" /> Horário de volta
            </Label>
            <TimeSelector value={returnTime} onChange={setReturnTime} />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="passengers" className="text-white flex items-center">
            <Users className="w-4 h-4 mr-1" /> Passageiros
          </Label>
          <Select value={passengers} onValueChange={setPassengers}>
            <SelectTrigger className="bg-white/20 border-white/10 text-white focus:ring-primary focus:border-primary">
              <SelectValue placeholder="Número de passageiros" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? 'passageiro' : 'passageiros'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={handleBooking} 
        className="w-full py-6 rounded-md mt-4 relative overflow-hidden group bg-gradient-to-r from-primary to-yellow-500"
      >
        <span className="relative z-10 flex items-center justify-center text-base font-bold">
          Buscar <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </span>
        <span className="absolute inset-0 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
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
