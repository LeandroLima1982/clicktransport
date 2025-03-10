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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';
import { format } from 'date-fns';
import { FileText, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

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

interface ServiceOrderListProps {
  companyId: string;
}

const ServiceOrderList: React.FC<ServiceOrderListProps> = ({ companyId }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
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
    fetchData();
  }, [user, companyId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (companyId) {
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
          .select('*')
          .eq('company_id', companyId);
        
        if (driversError) throw driversError;
        
        // Fetch vehicles
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('company_id', companyId);
        
        if (vehiclesError) throw vehiclesError;
        
        setOrders(ordersData || []);
        setDrivers(driversData || []);
        setVehicles(vehiclesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get company ID from user ID
  const getCompanyId = async () => {
    return companyId;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewOrder({ ...newOrder, [name]: value });
  };

  const handleCreateOrder = async () => {
    try {
      const companyId = await getCompanyId();
      
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
        
        <Sheet>
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
              <div>
                <label htmlFor="origin" className="block text-sm font-medium mb-1">
                  Origem *
                </label>
                <Input
                  id="origin"
                  name="origin"
                  value={newOrder.origin}
                  onChange={handleInputChange}
                  placeholder="Endereço de origem"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="destination" className="block text-sm font-medium mb-1">
                  Destino *
                </label>
                <Input
                  id="destination"
                  name="destination"
                  value={newOrder.destination}
                  onChange={handleInputChange}
                  placeholder="Endereço de destino"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="pickup_date" className="block text-sm font-medium mb-1">
                  Data de Coleta *
                </label>
                <Input
                  id="pickup_date"
                  name="pickup_date"
                  type="datetime-local"
                  value={newOrder.pickup_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="delivery_date" className="block text-sm font-medium mb-1">
                  Data de Entrega (Estimada)
                </label>
                <Input
                  id="delivery_date"
                  name="delivery_date"
                  type="datetime-local"
                  value={newOrder.delivery_date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="driver_id" className="block text-sm font-medium mb-1">
                  Motorista
                </label>
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
              
              <div>
                <label htmlFor="vehicle_id" className="block text-sm font-medium mb-1">
                  Veículo
                </label>
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
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-1">
                  Observações
                </label>
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
            
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <Button onClick={handleCreateOrder}>Criar Ordem</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <FileText className="mr-2 h-5 w-5" />
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Ordem
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  {/* Same form content as above */}
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origem/Destino</TableHead>
                    <TableHead>Data de Coleta</TableHead>
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
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                          {translateStatus(order.status)}
                        </span>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceOrderList;
