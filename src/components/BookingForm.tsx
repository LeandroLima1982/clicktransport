
import React, { useState } from 'react';
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

const BookingForm: React.FC = () => {
  const [originValue, setOriginValue] = useState('');
  const [destinationValue, setDestinationValue] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('oneway');
  const [passengers, setPassengers] = useState('1');
  const [showBookingSteps, setShowBookingSteps] = useState(false);
  
  const handleBooking = () => {
    if (!originValue) {
      alert('Por favor, informe o local de origem.');
      return;
    }
    
    if (!destinationValue) {
      alert('Por favor, informe o local de destino.');
      return;
    }
    
    if (!date) {
      alert('Por favor, selecione a data da viagem.');
      return;
    }
    
    if (tripType === 'roundtrip' && !returnDate) {
      alert('Por favor, selecione a data de retorno.');
      return;
    }
    
    // All validations passed, open booking steps
    setShowBookingSteps(true);
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
              placeholder="Endereço de origem"
              value={originValue}
              onChange={(e) => setOriginValue(e.target.value)}
              className="bg-white/20 border-white/10 text-white placeholder:text-white/60 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="destination" className="text-white flex items-center">
            <MapPin className="w-4 h-4 mr-1" /> Para onde vai?
          </Label>
          <div className="relative">
            <Input
              id="destination"
              placeholder="Endereço de destino"
              value={destinationValue}
              onChange={(e) => setDestinationValue(e.target.value)}
              className="bg-white/20 border-white/10 text-white placeholder:text-white/60 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          passengers
        }}
        isOpen={showBookingSteps}
        onClose={() => setShowBookingSteps(false)}
      />
    </div>
  );
};

export default BookingForm;
