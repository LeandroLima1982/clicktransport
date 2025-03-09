
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
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
    additionalInfo: '',
  });
  
  const { submitServiceRequest, isSubmitting } = useServiceRequests();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for submission
    const requestData = {
      ...formData,
      requestDate: date ? format(date, 'yyyy-MM-dd') : '',
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
        additionalInfo: '',
      });
      setDate(undefined);
    }
  };

  return (
    <section className="py-24 bg-gray-50" id="request-service">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="inline-block px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full mb-4">
              Book Your Transfer
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Request a Service</h2>
            <p className="text-lg text-foreground/70 mb-6">
              Fill out the form below to request a transfer service. One of our verified transportation companies will contact you shortly with a quote.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 rounded-full p-2 text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>Verified transportation companies</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 rounded-full p-2 text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>Corporate and tourist services</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 rounded-full p-2 text-primary">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p>Secure booking and payments</p>
              </div>
            </div>
          </div>
          
          <div className="glass-morphism rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome Completo
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Digite seu email"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Telefone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Digite seu telefone"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="serviceType" className="text-sm font-medium">
                    Tipo de Serviço
                  </label>
                  <Select
                    onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
                    value={formData.serviceType}
                  >
                    <SelectTrigger id="serviceType">
                      <SelectValue placeholder="Selecione o tipo de serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporate">Transfer Corporativo</SelectItem>
                      <SelectItem value="tourist">Transfer Turístico</SelectItem>
                      <SelectItem value="offshore">Transfer Offshore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="origin" className="text-sm font-medium">
                    Local de Embarque
                  </label>
                  <Input
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    placeholder="Digite o endereço de embarque"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="destination" className="text-sm font-medium">
                    Destino
                  </label>
                  <Input
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="Digite o endereço de destino"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "dd/MM/yyyy") : <span>Selecione a data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label htmlFor="passengers" className="text-sm font-medium">
                    Número de Passageiros
                  </label>
                  <Input
                    id="passengers"
                    name="passengers"
                    type="number"
                    min="1"
                    value={formData.passengers}
                    onChange={handleChange}
                    placeholder="Digite o número de passageiros"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="additionalInfo" className="text-sm font-medium">
                  Informações Adicionais
                </label>
                <Textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  placeholder="Digite quaisquer pedidos especiais ou informações adicionais"
                  rows={4}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full rounded-full py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceForm;
