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
import { useAuth } from '@/hooks/useAuth';

const ServiceForm: React.FC = () => {
  const { user } = useAuth();
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

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

    if (!user) {
      toast.error("Você precisa estar logado para solicitar um serviço");
      return;
    }

    const requestData = {
      ...formData,
      requestDate: date ? format(date, 'yyyy-MM-dd') : '',
      requestTime: time,
      userId: user.id
    };

    const success = await submitServiceRequest(requestData);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <Input 
              id="name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email} 
              onChange={handleChange} 
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <Input 
              id="phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              required
            />
          </div>
          
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Serviço</label>
            <Select 
              name="serviceType" 
              value={formData.serviceType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
            >
              <SelectTrigger id="serviceType">
                <SelectValue placeholder="Selecione o tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="dayRent">Diária</SelectItem>
                <SelectItem value="tourism">Turismo</SelectItem>
                <SelectItem value="event">Evento</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="h-4 w-4 inline mr-1" /> Origem
          </label>
          <div className="relative">
            <Input 
              id="origin" 
              name="origin" 
              value={formData.origin} 
              onChange={handleChange} 
              required
              placeholder="Digite o endereço de origem"
            />
            {originSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {originSuggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                    onClick={() => selectSuggestion(suggestion, true)}
                  >
                    <div className="mr-2 mt-1">
                      {getPlaceIcon(suggestion.place_type[0])}
                    </div>
                    <div>
                      <div className="font-medium">{formatPlaceName(suggestion.place_name)}</div>
                      <div className="text-xs text-gray-500">{suggestion.place_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="h-4 w-4 inline mr-1" /> Destino
          </label>
          <div className="relative">
            <Input 
              id="destination" 
              name="destination" 
              value={formData.destination} 
              onChange={handleChange} 
              required
              placeholder="Digite o endereço de destino"
            />
            {destinationSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {destinationSuggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                    onClick={() => selectSuggestion(suggestion, false)}
                  >
                    <div className="mr-2 mt-1">
                      {getPlaceIcon(suggestion.place_type[0])}
                    </div>
                    <div>
                      <div className="font-medium">{formatPlaceName(suggestion.place_name)}</div>
                      <div className="text-xs text-gray-500">{suggestion.place_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CalendarIcon className="h-4 w-4 inline mr-1" /> Data
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {date ? format(date, 'PPP', { locale: ptBR }) : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="h-4 w-4 inline mr-1" /> Horário
            </label>
            <TimeSelector value={time} onChange={setTime} />
          </div>
        </div>
        
        <div>
          <label htmlFor="passengers" className="block text-sm font-medium text-gray-700 mb-1">
            <Users className="h-4 w-4 inline mr-1" /> Número de Passageiros
          </label>
          <Input 
            id="passengers" 
            name="passengers" 
            type="number" 
            min="1"
            value={formData.passengers} 
            onChange={handleChange} 
            required
          />
        </div>
        
        <div>
          <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
            Informações Adicionais
          </label>
          <Textarea 
            id="additionalInfo" 
            name="additionalInfo" 
            value={formData.additionalInfo} 
            onChange={handleChange} 
            rows={4}
            placeholder="Bagagens, necessidades especiais, etc."
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Enviando...' : 'Solicitar Serviço'}
      </Button>
    </form>
  );
};

export default ServiceForm;
