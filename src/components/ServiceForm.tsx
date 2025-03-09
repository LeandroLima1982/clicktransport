
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
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
    <section className="py-16 bg-white" id="request-service">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 text-center">
            <span className="inline-block text-sm font-semibold text-primary mb-2">AGENDE AGORA</span>
            <h2 className="section-title mb-6">Solicite Seu Transfer</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Preencha o formulário abaixo para solicitar seu transfer. Uma de nossas empresas parceiras 
              entrará em contato rapidamente com um orçamento.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium flex items-center">
                    Nome Completo <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Digite seu nome completo"
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium flex items-center">
                    Email <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Digite seu email"
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium flex items-center">
                    Telefone <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Digite seu telefone"
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="serviceType" className="text-sm font-medium flex items-center">
                    Tipo de Serviço <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Select
                    onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}
                    value={formData.serviceType}
                  >
                    <SelectTrigger id="serviceType" className="border-gray-300 focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Selecione o tipo de serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporate">Transfer Corporativo</SelectItem>
                      <SelectItem value="tourist">Transfer Turístico</SelectItem>
                      <SelectItem value="offshore">Transfer Offshore</SelectItem>
                      <SelectItem value="airport">Transfer Aeroporto</SelectItem>
                      <SelectItem value="executive">Transfer Executivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="origin" className="text-sm font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-1" /> Local de Embarque <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    id="origin"
                    name="origin"
                    value={formData.origin}
                    onChange={handleChange}
                    placeholder="Digite o endereço de embarque"
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="destination" className="text-sm font-medium flex items-center">
                    <MapPin className="w-4 h-4 mr-1" /> Destino <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="Digite o endereço de destino"
                    className="border-gray-300 focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" /> Data <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-gray-300"
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
                  <label htmlFor="passengers" className="text-sm font-medium flex items-center">
                    <Users className="w-4 h-4 mr-1" /> Número de Passageiros <span className="text-red-500 ml-1">*</span>
                  </label>
                  <Input
                    id="passengers"
                    name="passengers"
                    type="number"
                    min="1"
                    value={formData.passengers}
                    onChange={handleChange}
                    placeholder="Digite o número de passageiros"
                    className="border-gray-300 focus:border-primary focus:ring-primary"
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
                  className="border-gray-300 focus:border-primary focus:ring-primary"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full rounded-md py-6 font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
              
              <p className="text-xs text-center text-foreground/60 mt-4">
                * Ao enviar este formulário, você concorda com nossos termos e políticas de privacidade.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceForm;
