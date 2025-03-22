import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2, MapPin, Calendar, Clock } from 'lucide-react';
import { Trip } from '@/types/trip';

interface Trip {
  id: string;
  start_address: string;
  end_address: string;
  start_time: string;
  end_time: string;
  status: 'completed' | 'cancelled' | 'scheduled';
  price: number;
}

const TripHistory: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 5;
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchDriverId = async () => {
        setIsLoading(true);
        try {
          const { data: driverData, error: driverError } = await supabase
            .from('drivers')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (driverError) throw driverError;

          if (driverData) {
            const driverId = driverData.id;
            
            const { data, error } = await supabase
              .from('service_orders')
              .select('*')
              .eq('driver_id', driverId)
              .eq('status', 'completed')
              .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            const tripsData = data.map(order => ({
              id: order.id,
              origin: order.origin,
              destination: order.destination,
              pickup_date: order.pickup_date,
              status: order.status,
              driver_id: order.driver_id,
              company_id: order.company_id,
              created_at: order.created_at,
              notes: order.notes,
              start_address: order.origin,
              end_address: order.destination,
              start_time: order.pickup_date,
              end_time: order.delivery_date,
              price: 0 // Placeholder
            }));
            
            setTrips(tripsData);
          }
        } catch (error) {
          console.error('Error fetching trips:', error);
          toast.error('Erro ao carregar histórico de viagens');
        } finally {
          setIsLoading(false);
        }
      };

      fetchDriverId();
    }
  }, [user]);

  const filteredTrips = trips.filter(trip => {
    const searchStr = searchQuery.toLowerCase();
    return (
      trip.start_address.toLowerCase().includes(searchStr) ||
      trip.end_address.toLowerCase().includes(searchStr)
    );
  });

  const totalPages = Math.ceil(trips.length / tripsPerPage);

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline">Concluída</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelada</Badge>;
      case 'scheduled':
        return <Badge>Agendada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return <p>Carregando histórico de viagens...</p>;
  }

  if (error) {
    return <p>Erro ao carregar viagens: {error}</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Viagens</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar por local..."
              className="pl-8 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="completed">Concluídas</TabsTrigger>
            <TabsTrigger value="scheduled">Agendadas</TabsTrigger>
            <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-2">
            <TripTable trips={filteredTrips} formatDate={formatDate} getStatusBadge={getStatusBadge} />
          </TabsContent>
          <TabsContent value="completed" className="space-y-2">
            <TripTable trips={filteredTrips} formatDate={formatDate} getStatusBadge={getStatusBadge} />
          </TabsContent>
          <TabsContent value="scheduled" className="space-y-2">
            <TripTable trips={filteredTrips} formatDate={formatDate} getStatusBadge={getStatusBadge} />
          </TabsContent>
          <TabsContent value="cancelled" className="space-y-2">
            <TripTable trips={filteredTrips} formatDate={formatDate} getStatusBadge={getStatusBadge} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <span>Página {currentPage} de {totalPages}</span>
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === totalPages}>
            Próxima
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface TripTableProps {
  trips: Trip[];
  formatDate: (dateStr: string) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

const TripTable: React.FC<TripTableProps> = ({ trips, formatDate, getStatusBadge }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Início</TableHead>
            <TableHead>Fim</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trips.map((trip) => (
            <TableRow key={trip.id}>
              <TableCell>
                <div className="flex items-center">
                  <MapIcon className="mr-2 h-4 w-4" />
                  {trip.start_address}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapIcon className="mr-2 h-4 w-4" />
                  {trip.end_address}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDate(trip.start_time)}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(trip.status)}</TableCell>
              <TableCell>{trip.price.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  <InfoIcon className="mr-2 h-4 w-4" />
                  Detalhes
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TripHistory;
