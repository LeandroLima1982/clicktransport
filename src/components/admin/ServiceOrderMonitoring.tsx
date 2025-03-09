
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/main';
import { toast } from 'sonner';
import { FileText, Search } from 'lucide-react';

interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  company: {
    name: string;
  };
  driver: {
    name: string;
  } | null;
}

const ServiceOrderMonitoring: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('service_orders')
        .select(`
          *,
          company:company_id(name),
          driver:driver_id(name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar ordens de serviço');
    } finally {
      setIsLoading(false);
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definido';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const filteredOrders = orders.filter(order => 
    (order.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.driver?.name && order.driver.name.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (!statusFilter || order.status === statusFilter)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Monitoramento de Ordens de Serviço
        </CardTitle>
        <CardDescription>
          Acompanhe todas as ordens de serviço da plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por origem, destino, empresa ou motorista..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="assigned">Atribuídos</SelectItem>
              <SelectItem value="in_progress">Em progresso</SelectItem>
              <SelectItem value="completed">Concluídos</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchOrders} variant="outline">
            Atualizar
          </Button>
        </div>
        
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <p>Carregando...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="h-40 flex items-center justify-center">
            <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origem/Destino</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Data de Coleta</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>{order.company?.name || 'N/A'}</TableCell>
                    <TableCell>{order.driver?.name || 'Não atribuído'}</TableCell>
                    <TableCell>{formatDate(order.pickup_date)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                        {translateStatus(order.status)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceOrderMonitoring;
