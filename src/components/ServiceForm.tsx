
import React, { useState } from 'react';
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

const ServiceForm: React.FC = () => {
  const [date, setDate] = useState<Date>();
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare data for submission
    const requestData = {
      ...formData,
      requestDate: date ? format(date, 'yyyy-MM-dd') : ''
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
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 w-full">
      <div>
        <h3 className="text-xl font-bold mb-4">Solicite seu Serviço</h3>
        <p className="text-muted-foreground mb-6">
          Preencha o formulário abaixo para solicitar um serviço de transporte para sua empresa ou evento.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Nome</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Telefone</label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data de Serviço</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione uma data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ptBR}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="serviceType" className="text-sm font-medium">Tipo de Serviço</label>
            <Select
              onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
              value={formData.serviceType}
            >
              <SelectTrigger id="serviceType">
                <SelectValue placeholder="Selecione o tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corporate">Transfer Corporativo</SelectItem>
                <SelectItem value="airport">Transfer Aeroporto</SelectItem>
                <SelectItem value="events">Transfer para Eventos</SelectItem>
                <SelectItem value="vip">Transfer VIP</SelectItem>
                <SelectItem value="offshore">Transfer Offshore</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="origin" className="text-sm font-medium">Origem</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                className="pl-10"
                placeholder="Endereço de origem"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="destination" className="text-sm font-medium">Destino</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="pl-10"
                placeholder="Endereço de destino"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="passengers" className="text-sm font-medium">Número de Passageiros</label>
            <div className="relative">
              <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="passengers"
                name="passengers"
                type="number"
                min="1"
                value={formData.passengers}
                onChange={handleChange}
                className="pl-10"
                placeholder="Quantidade de passageiros"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="additionalInfo" className="text-sm font-medium">Informações Adicionais</label>
            <Textarea
              id="additionalInfo"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="Compartilhe detalhes adicionais sobre sua solicitação"
              rows={3}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Solicitar Serviço'}
          </Button>
        </form>
      </div>
      
      <div className="hidden md:block bg-primary/5 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Por que escolher nosso serviço?</h3>
        <ul className="space-y-4">
          <li className="flex items-start">
            <Clock className="h-5 w-5 text-primary mr-2 mt-0.5" />
            <span>Pontualidade garantida em todos os serviços</span>
          </li>
          <li className="flex items-start">
            <Users className="h-5 w-5 text-primary mr-2 mt-0.5" />
            <span>Motoristas profissionais e treinados</span>
          </li>
          <li className="flex items-start">
            <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
            <span>Atendemos toda a região metropolitana</span>
          </li>
        </ul>
        
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
          <p className="font-medium mb-2">Atendimento ao cliente</p>
          <p className="text-sm text-muted-foreground mb-4">
            Estamos disponíveis para ajudar com qualquer dúvida sobre nossos serviços.
          </p>
          <div className="space-y-2">
            <p className="text-sm">✉️ contato@clicktransfer.com.br</p>
            <p className="text-sm">📞 (21) 99999-9999</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceForm;
