
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';
import { format } from 'date-fns';
import { FileText, Plus, Search, Eye, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import OrderDetailSheet from './OrderDetailSheet';

// Define service order type
interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
}

interface Driver {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
}

interface ServiceOrderListProps {
  companyId: string;
}

const ServiceOrderList: React.FC<ServiceOrderListProps> = ({ companyId }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isNewOrderSheetOpen, setIsNewOrderSheetOpen] = useState(false);
  
  // Form state
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

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch service orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('service_orders')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Fetch drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('id, name')
        .eq('company_id', companyId);
      
      if (driversError) throw driversError;
      
      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id, model, license_plate')
        .eq('company_id', companyId);
      
      if (vehiclesError) throw vehiclesError;
      
      setOrders(ordersData || []);
      setDrivers(driversData || []);
      setVehicles(vehiclesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

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
      
      setIsNewOrderSheetOpen(false);
      fetchData();
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar ordem de serviço');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success('Status atualizado com sucesso');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ 
          driver_id: driverId,
          status: driverId ? 'assigned' : 'pending'
        })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success('Motorista atribuído com sucesso');
      fetchData();
    } catch (error) {
      console.error('Error assigning driver:', error);
      toast.error('Erro ao atribuir motorista');
    }
  };

  const handleAssignVehicle = async (orderId: string, vehicleId: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ vehicle_id: vehicleId })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success('Veículo atribuído com sucesso');
      fetchData();
    } catch (error) {
      console.error('Error assigning vehicle:', error);
      toast.error('Erro ao atribuir veículo');
    }
  };

  const handleViewOrderDetails = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsDetailSheetOpen(true);
  };

  const filteredOrders = orders.filter(order => 
    order.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definido';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const translateStatus = (status: string) => {
    const statusMap: {[key: string]: string} = {
      'pending': 'Pendente',
      'assigned': 'Atribuído',
      'in_progress': 'Em progresso',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ordens..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Sheet open={isNewOrderSheetOpen} onOpenChange={setIsNewOrderSheetOpen}>
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
                <Label htmlFor="pickup_date">Data de Coleta *</Label>
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
                <Label htmlFor="delivery_date">Data de Entrega (Estimada)</Label>
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
                onClick={() => setIsNewOrderSheetOpen(false)}
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
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <ClipboardList className="mr-2 h-5 w-5" />
            Ordens de Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <p>Carregando...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="h-40 flex items-center justify-center flex-col">
              <p className="text-muted-foreground mb-2">Nenhuma ordem encontrada</p>
              <Button onClick={() => setIsNewOrderSheetOpen(true)} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Criar Ordem
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origem/Destino</TableHead>
                    <TableHead>Data de Coleta</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.origin}</p>
                          <p className="text-muted-foreground">→ {order.destination}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(order.pickup_date)}
                      </TableCell>
                      <TableCell>
                        <select
                          className="px-2 py-1 border rounded text-sm w-full"
                          value={order.driver_id || ''}
                          onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                        >
                          <option value="">Não atribuído</option>
                          {drivers.map(driver => (
                            <option key={driver.id} value={driver.id}>
                              {driver.name}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell>
                        <Badge className={`px-2 py-1 ${getStatusBadgeClass(order.status)}`}>
                          {translateStatus(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <select
                            className="px-2 py-1 border rounded text-sm"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            <option value="pending">Pendente</option>
                            <option value="assigned">Atribuído</option>
                            <option value="in_progress">Em Progresso</option>
                            <option value="completed">Concluído</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailSheet
        order={selectedOrder}
        isOpen={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
        drivers={drivers}
        vehicles={vehicles}
      />
    </div>
  );
};

export default ServiceOrderList;
