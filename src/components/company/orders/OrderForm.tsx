
import React from 'react';
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
import { Plus } from 'lucide-react';
import { supabase } from '@/main';
import { toast } from 'sonner';
import { Driver, Vehicle } from './types';

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
  const [newOrder, setNewOrder] = React.useState({
    origin: '',
    destination: '',
    pickup_date: '',
    delivery_date: '',
    notes: '',
    status: 'pending',
    driver_id: '',
    vehicle_id: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewOrder({ ...newOrder, [name]: value });
  };

  const handleCreateOrder = async () => {
    try {
      if (!companyId) {
        toast.error('ID da empresa não encontrado');
        return;
      }
      
      // Validate form
      if (!newOrder.origin || !newOrder.destination || !newOrder.pickup_date) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }
      
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
            status: newOrder.status,
            driver_id: newOrder.driver_id || null,
            vehicle_id: newOrder.vehicle_id || null
          }
        ]);
      
      if (error) throw error;
      
      toast.success('Ordem de serviço criada com sucesso');
      
      // Reset form and refresh data
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
      onOrderCreated();
      
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
            <Input
              id="origin"
              name="origin"
              value={newOrder.origin}
              onChange={handleInputChange}
              placeholder="Endereço de origem"
              required
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="destination">Destino *</Label>
            <Input
              id="destination"
              name="destination"
              value={newOrder.destination}
              onChange={handleInputChange}
              placeholder="Endereço de destino"
              required
            />
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
