
import React, { useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Plus, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Driver, Vehicle } from './types';
import { fetchAddressSuggestions, getPlaceIcon, formatPlaceName } from '@/utils/mapbox';

interface OrderFormProps {
  companyId: string;
  drivers: Driver[];
  vehicles: Vehicle[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOrderCreated: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  companyId,
  drivers,
  vehicles,
  isOpen,
  setIsOpen,
  onOrderCreated
}) => {
  const [newOrder, setNewOrder] = useState({
    origin: '',
    destination: '',
    pickup_date: '',
    delivery_date: '',
    notes: '',
    status: 'pending',
    driver_id: '',
    vehicle_id: ''
  });
  
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const originTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const destinationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewOrder({ ...newOrder, [name]: value });
    
    if (name === 'origin') {
      if (originTimeoutRef.current) {
        clearTimeout(originTimeoutRef.current);
      }
      
      originTimeoutRef.current = setTimeout(async () => {
        if (value.length >= 3) {
          setIsLoadingSuggestions(true);
          const suggestions = await fetchAddressSuggestions(value);
          setOriginSuggestions(suggestions);
          setIsLoadingSuggestions(false);
        } else {
          setOriginSuggestions([]);
        }
      }, 500);
    }
    
    if (name === 'destination') {
      if (destinationTimeoutRef.current) {
        clearTimeout(destinationTimeoutRef.current);
      }
      
      destinationTimeoutRef.current = setTimeout(async () => {
        if (value.length >= 3) {
          setIsLoadingSuggestions(true);
          const suggestions = await fetchAddressSuggestions(value);
          setDestinationSuggestions(suggestions);
          setIsLoadingSuggestions(false);
        } else {
          setDestinationSuggestions([]);
        }
      }, 500);
    }
  };
  
  const selectSuggestion = (suggestion: any, isOrigin: boolean) => {
    const placeName = suggestion.place_name;
    if (isOrigin) {
      setNewOrder({ ...newOrder, origin: placeName });
      setOriginSuggestions([]);
    } else {
      setNewOrder({ ...newOrder, destination: placeName });
      setDestinationSuggestions([]);
    }
  };

  const handleCreateOrder = async () => {
    try {
      if (!companyId) {
        toast.error('ID da empresa não encontrado');
        return;
      }
      
      if (!newOrder.origin || !newOrder.destination || !newOrder.pickup_date) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }
      
      // Determine if we should set the status to 'assigned' when a driver is selected
      const orderStatus = newOrder.driver_id ? 'assigned' : 'pending';
      
      const { error } = await supabase
        .from('service_orders')
        .insert([
          {
            company_id: companyId,
            origin: newOrder.origin,
            destination: newOrder.destination,
            pickup_date: newOrder.pickup_date,
            delivery_date: newOrder.delivery_date || null,
            notes: newOrder.notes || null,
            status: orderStatus,
            driver_id: newOrder.driver_id || null,
            vehicle_id: newOrder.vehicle_id || null
          }
        ]);
      
      if (error) throw error;
      
      toast.success('Ordem de serviço criada com sucesso');
      
      setNewOrder({
        origin: '',
        destination: '',
        pickup_date: '',
        delivery_date: '',
        notes: '',
        status: 'pending',
        driver_id: '',
        vehicle_id: ''
      });
      
      setIsOpen(false);
      await onOrderCreated();
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar ordem de serviço');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="ml-4">
          <Plus className="mr-2 h-4 w-4" />
          Nova Ordem
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Criar Nova Ordem de Serviço</SheetTitle>
          <SheetDescription>
            Preencha os dados para criar uma nova ordem de transporte.
          </SheetDescription>
        </SheetHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <Label htmlFor="origin">Origem *</Label>
            <div className="relative">
              <Input
                id="origin"
                name="origin"
                value={newOrder.origin}
                onChange={handleInputChange}
                placeholder="Endereço de origem"
                required
                className="pl-9"
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              
              {originSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-background border border-input rounded-md shadow-lg">
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
          
          <div className="space-y-1">
            <Label htmlFor="destination">Destino *</Label>
            <div className="relative">
              <Input
                id="destination"
                name="destination"
                value={newOrder.destination}
                onChange={handleInputChange}
                placeholder="Endereço de destino"
                required
                className="pl-9"
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              
              {destinationSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-background border border-input rounded-md shadow-lg">
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
          
          <div className="space-y-1">
            <Label htmlFor="pickup_date">Data/Hora Saída *</Label>
            <Input
              id="pickup_date"
              name="pickup_date"
              type="datetime-local"
              value={newOrder.pickup_date}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="delivery_date">Data/Hora (Estimativa)</Label>
            <Input
              id="delivery_date"
              name="delivery_date"
              type="datetime-local"
              value={newOrder.delivery_date}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="driver_id">Motorista</Label>
            <select
              id="driver_id"
              name="driver_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newOrder.driver_id}
              onChange={handleInputChange}
            >
              <option value="">Selecione um motorista</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="vehicle_id">Veículo</Label>
            <select
              id="vehicle_id"
              name="vehicle_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={newOrder.vehicle_id}
              onChange={handleInputChange}
            >
              <option value="">Selecione um veículo</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.model} ({vehicle.license_plate})
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              name="notes"
              value={newOrder.notes}
              onChange={handleInputChange}
              placeholder="Informações adicionais"
              rows={3}
            />
          </div>
        </div>
        
        <SheetFooter className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateOrder}
            className="w-full sm:w-auto"
          >
            Criar Ordem
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default OrderForm;
