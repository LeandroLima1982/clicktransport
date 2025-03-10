
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Clock, MapPin, Users, Building, Landmark, Home, Navigation, MapPinned } from 'lucide-react';
import { useServiceRequests } from '@/hooks/useServiceRequests';
import TimeSelector from './TimeSelector';
import { toast } from 'sonner';

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
  
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(true);
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
      
      originTimeoutRef.current = setTimeout(() => {
        fetchAddressSuggestions(value, true);
      }, 500);
    }
    
    if (name === 'destination') {
      if (destinationTimeoutRef.current) {
        clearTimeout(destinationTimeoutRef.current);
      }
      
      destinationTimeoutRef.current = setTimeout(() => {
        fetchAddressSuggestions(value, false);
      }, 500);
    }
  };
  
  const fetchAddressSuggestions = async (query: string, isOrigin: boolean) => {
    if (!mapboxToken || query.length < 3) return;
    
    try {
      setIsLoadingSuggestions(true);
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
      const params = new URLSearchParams({
        access_token: mapboxToken,
        country: 'br',
        language: 'pt',
        limit: '5',
        types: 'poi,address,place,region,district', // Include POIs and other place types
        proximity: '-43.1729,-22.9068', // Bias results toward Rio de Janeiro (or user's location if available)
        bbox: '-73.9872354,-33.7683777,-34.7299934,5.24448639' // Limit to Brazil's bounding box
      });
      
      const response = await fetch(`${endpoint}?${params.toString()}`);
      const data = await response.json();
      
      if (data.features) {
        if (isOrigin) {
          setOriginSuggestions(data.features);
        } else {
          setDestinationSuggestions(data.features);
        }
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };
  
  const getPlaceIcon = (place: any) => {
    const category = place.properties?.category;
    const placeType = place.place_type?.[0];
    
    if (category === 'airport' || category?.includes('airport')) return <Landmark className="h-4 w-4" />;
    if (category === 'hotel' || category?.includes('hotel') || category?.includes('lodging')) return <Building className="h-4 w-4" />;
    if (category?.includes('restaurant') || category?.includes('food')) return <MapPinned className="h-4 w-4" />;
    
    if (placeType === 'poi') return <Landmark className="h-4 w-4" />;
    if (placeType === 'address') return <Home className="h-4 w-4" />;
    if (placeType === 'place') return <Navigation className="h-4 w-4" />;
    
    return <MapPin className="h-4 w-4" />; // Default icon
  };
  
  const formatPlaceName = (place: any) => {
    const mainText = place.text;
    const context = place.context?.map((c: any) => c.text).join(', ') || '';
    
    return (
      <div>
        <div className="font-medium">{mainText}</div>
        {context && <div className="text-xs text-gray-400">{context}</div>}
      </div>
    );
  };
  
  const selectSuggestion = (suggestion: any, isOrigin: boolean) => {
    const placeName = suggestion.place_name;
    if (isOrigin) {
      setFormData(prev => ({ ...prev, origin: placeName }));
      setOriginSuggestions([]);
    } else {
      setFormData(prev => ({ ...prev, destination: placeName }));
      setDestinationSuggestions([]);
    }
  };
  
  const handleMapboxTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      toast.success('Token do Mapbox configurado com sucesso!');
    } else {
      toast.error('Por favor, insira um token válido.');
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
  
  return (
    <section id="contact" className="py-16 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Solicite um Serviço</h2>
          <p className="mt-2 text-slate-300">Preencha o formulário abaixo para solicitar nossos serviços de transporte</p>
        </div>
        
        {showTokenInput && (
          <div className="max-w-3xl mx-auto mb-8 bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/20">
            <h4 className="text-white font-semibold mb-2">Configuração do Mapbox</h4>
            <p className="text-white/80 text-sm mb-3">
              Para utilizar as sugestões de endereço, é necessário fornecer um token de acesso do Mapbox.
            </p>
            <form onSubmit={handleMapboxTokenSubmit} className="flex gap-2">
              <Input
                placeholder="Insira seu token do Mapbox"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="bg-white/20 border-white/10 text-white placeholder:text-white/60"
              />
              <Button type="submit" size="sm">Salvar</Button>
            </form>
            <p className="text-xs text-white/60 mt-2">
              Obtenha um token em <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
            </p>
          </div>
        )}
        
        <div className="max-w-3xl mx-auto bg-slate-800/50 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">Nome Completo</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-white/10 border-white/10 text-white focus:ring-primary focus:border-primary"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white/10 border-white/10 text-white focus:ring-primary focus:border-primary"
                  placeholder="seu.email@exemplo.com"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium">Telefone</label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="bg-white/10 border-white/10 text-white focus:ring-primary focus:border-primary"
                  placeholder="(00) 00000-0000"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="serviceType" className="block text-sm font-medium">Tipo de Serviço</label>
                <Select 
                  value={formData.serviceType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
                >
                  <SelectTrigger className="bg-white/10 border-white/10 text-white focus:ring-primary focus:border-primary">
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Transfer Aeroporto</SelectItem>
                    <SelectItem value="tourism">Turismo</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                    <SelectItem value="wedding">Casamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="origin" className="block text-sm font-medium">Origem</label>
                <div className="relative">
                  <Input
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border-white/10 text-white focus:ring-primary focus:border-primary pl-10"
                    placeholder="Endereço de origem ou ponto de interesse"
                  />
                  <MapPin className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  
                  {originSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-md shadow-lg">
                      <ul className="py-1 max-h-60 overflow-auto">
                        {originSuggestions.map((suggestion) => (
                          <li
                            key={suggestion.id}
                            className="px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer"
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
                <label htmlFor="destination" className="block text-sm font-medium">Destino</label>
                <div className="relative">
                  <Input
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border-white/10 text-white focus:ring-primary focus:border-primary pl-10"
                    placeholder="Endereço de destino ou ponto de interesse"
                  />
                  <MapPin className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                  
                  {destinationSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-md shadow-lg">
                      <ul className="py-1 max-h-60 overflow-auto">
                        {destinationSuggestions.map((suggestion) => (
                          <li
                            key={suggestion.id}
                            className="px-3 py-2 text-sm hover:bg-slate-700 cursor-pointer"
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
                <label className="block text-sm font-medium">Data</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/10 text-white hover:bg-white/20 w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 opacity-60" />
                      {date ? format(date, 'PPP', { locale: ptBR }) : <span className="text-white/60">Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Horário</label>
                <TimeSelector 
                  value={time} 
                  onChange={setTime} 
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="passengers" className="block text-sm font-medium">Número de Passageiros</label>
                <div className="relative">
                  <Input
                    id="passengers"
                    name="passengers"
                    type="number"
                    min="1"
                    value={formData.passengers}
                    onChange={handleChange}
                    required
                    className="bg-white/10 border-white/10 text-white focus:ring-primary focus:border-primary pl-10"
                    placeholder="Quantidade de passageiros"
                  />
                  <Users className="absolute top-1/2 left-3 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="additionalInfo" className="block text-sm font-medium">Informações Adicionais</label>
              <Textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                className="bg-white/10 border-white/10 text-white focus:ring-primary focus:border-primary h-32"
                placeholder="Forneça detalhes adicionais sobre o serviço desejado"
              />
            </div>
            
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-md"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ServiceForm;
