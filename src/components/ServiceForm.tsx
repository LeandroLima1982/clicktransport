
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import TimeSelector from './TimeSelector';
import { toast } from 'sonner';
import { fetchAddressSuggestions, getPlaceIcon, formatPlaceName } from '@/utils/mapbox';

const ServiceForm: React.FC = () => {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    origin: '',
    destination: '',
    passengers: '',
    additionalInfo: ''
  });
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    submitServiceRequest,
    isSubmitting
  } = useServiceRequests();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Trigger address suggestions for origin and destination fields
    if (name === 'origin') {
      if (originTimeoutRef.current) {
        clearTimeout(originTimeoutRef.current);
      }
      originTimeoutRef.current = setTimeout(async () => {
        setIsLoadingSuggestions(true);
        const suggestions = await fetchAddressSuggestions(value);
        setOriginSuggestions(suggestions);
        setIsLoadingSuggestions(false);
      }, 500);
    }
    if (name === 'destination') {
      if (destinationTimeoutRef.current) {
        clearTimeout(destinationTimeoutRef.current);
      }
      destinationTimeoutRef.current = setTimeout(async () => {
        setIsLoadingSuggestions(true);
        const suggestions = await fetchAddressSuggestions(value);
        setDestinationSuggestions(suggestions);
        setIsLoadingSuggestions(false);
      }, 500);
    }
  };
  
  const selectSuggestion = (suggestion: any, isOrigin: boolean) => {
    const placeName = suggestion.place_name;
    if (isOrigin) {
      setFormData(prev => ({
        ...prev,
        origin: placeName
      }));
      setOriginSuggestions([]);
    } else {
      setFormData(prev => ({
        ...prev,
        destination: placeName
      }));
      setDestinationSuggestions([]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data for submission
    const requestData = {
      ...formData,
      requestDate: date ? format(date, 'yyyy-MM-dd') : '',
      requestTime: time
    };

    // Submit to Supabase
    const success = await submitServiceRequest(requestData);

    // Reset form if submission was successful
    if (success) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        origin: '',
        destination: '',
        passengers: '',
        additionalInfo: ''
      });
      setDate(undefined);
      setTime('');
    }
  };
  
  // Fixed: Return JSX instead of void
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Solicitar Serviço</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Seu nome completo"
            required
          />
        </div>
        
        {/* Basic contact info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
            />
          </div>
        </div>
        
        {/* Service type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Serviço</label>
          <Select 
            value={formData.serviceType} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tourism">Turismo</SelectItem>
              <SelectItem value="airport">Translado Aeroporto</SelectItem>
              <SelectItem value="event">Eventos</SelectItem>
              <SelectItem value="corporate">Corporativo</SelectItem>
              <SelectItem value="other">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Origin and destination */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Origem</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                className="pl-10"
                placeholder="Endereço de origem"
              />
              {originSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                  {originSuggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectSuggestion(suggestion, true)}
                    >
                      {suggestion.place_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Destino</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="pl-10"
                placeholder="Endereço de destino"
              />
              {destinationSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                  {destinationSuggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectSuggestion(suggestion, false)}
                    >
                      {suggestion.place_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Date and time selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Data</label>
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left pl-10 py-6 font-normal"
                  >
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    {date ? (
                      format(date, 'PPP', { locale: ptBR })
                    ) : (
                      <span className="text-gray-500">Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Horário</label>
            <TimeSelector
              value={time}
              onChange={setTime}
            />
          </div>
        </div>
        
        {/* Passenger count */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Número de Passageiros</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              name="passengers"
              type="number"
              min="1"
              value={formData.passengers}
              onChange={handleChange}
              className="pl-10"
              placeholder="Quantidade de passageiros"
            />
          </div>
        </div>
        
        {/* Additional information */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Informações Adicionais</label>
          <Textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            placeholder="Descreva detalhes adicionais sobre o serviço..."
            rows={4}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-6 bg-[#F8D748] hover:bg-[#F8D748]/90 text-black font-medium"
        >
          {isSubmitting ? 'Enviando...' : 'Solicitar Orçamento'}
        </Button>
      </form>
    </div>
  );
};

export default ServiceForm;
