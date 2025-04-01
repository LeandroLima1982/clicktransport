import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider } from '@/components/ui/sidebar';
import DriverSidebar from '@/components/driver/DriverSidebar';
import DriverHeader from '@/components/driver/DriverHeader';
import DriverMap from '@/components/driver/DriverMap';
import TransitionEffect from '@/components/TransitionEffect';
import { Loader2, AlertOctagon, Check, MapPin, Clock, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { updateOrderStatus } from '@/services/booking/serviceOrderService';
import { useDriverLocation } from '@/hooks/useDriverLocation';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { ServiceOrder } from '@/types/serviceOrder';

interface Order {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  status: string;
  company_id: string;
  company_name?: string | null;
  notes: string | null;
  passenger_data?: {
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  } | null;
}

const DriverNavigation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location, isTracking, lastUpdateTime, startTracking, stopTracking, updateNow } = useDriverLocation('');
  const { user } = useAuth();
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDriverId();
    }
  }, [user]);

  const fetchDriverId = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Erro ao buscar ID do motorista:', error);
        toast.error('Erro ao buscar perfil do motorista');
        return;
      }

      if (data) {
        setDriverId(data.id);
      } else {
        toast.error('Perfil de motorista não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar ID do motorista:', error);
      toast.error('Erro ao carregar perfil do motorista');
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies:company_id(name)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      if (data) {
        setOrder({
          id: data.id,
          origin: data.origin,
          destination: data.destination,
          pickup_date: data.pickup_date,
          status: data.status,
          company_id: data.company_id,
          company_name: data.companies?.name || null,
          notes: data.notes || null,
          passenger_data: data.passenger_data || null
        });
      } else {
        setError('Ordem não encontrada');
        toast.error('Ordem não encontrada');
      }
    } catch (err: any) {
      console.error('Erro ao buscar ordem:', err);
      setError(err.message || 'Erro ao carregar ordem');
      toast.error(err.message || 'Erro ao carregar ordem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: ServiceOrder['status']) => {
    if (!orderId) {
      toast.error('ID da ordem não encontrado');
      return;
    }

    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Status atualizado para ${newStatus}`);
      fetchOrder();
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      toast.error(err.message || 'Erro ao atualizar status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando detalhes da ordem...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <TransitionEffect>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <DriverSidebar />
            <div className="flex-1 flex flex-col">
              <DriverHeader />
              <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
                <div className="flex items-center justify-center h-full">
                  <Card className="w-full max-w-md">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">Erro</CardTitle>
                      <CardDescription>Não foi possível carregar os detalhes da ordem.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AlertOctagon className="h-6 w-6 text-red-500" />
                      <p className="mt-2 text-sm text-muted-foreground">{error || 'Ordem não encontrada.'}</p>
                      <Button variant="link" onClick={() => navigate('/driver/assignments')}>
                        Voltar para Atribuições
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </TransitionEffect>
    );
  }

  return (
    <TransitionEffect>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DriverSidebar />
          <div className="flex-1 flex flex-col">
            <DriverHeader />
            <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
              <div className="mb-6 space-y-2">
                <h1 className="text-2xl font-bold">Navegação</h1>
                <p className="text-muted-foreground">Detalhes da ordem de serviço</p>
              </div>

              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Detalhes da Ordem</CardTitle>
                  <CardDescription>Informações sobre a ordem de serviço</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Origem</p>
                      <p className="text-gray-600">{order?.origin}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Destino</p>
                      <p className="text-gray-600">{order?.destination}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Data de Coleta</p>
                      <p className="text-gray-600">{order?.pickup_date ? new Date(order.pickup_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Empresa</p>
                      <p className="text-gray-600">{order?.company_name || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Notas</p>
                    <p className="text-gray-600">{order?.notes || 'Nenhuma nota adicional'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Passageiro</p>
                    <p className="text-gray-600">{order?.passenger_data?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <Badge
                      variant={
                        order?.status === 'pending' || order?.status === 'created'
                          ? 'secondary'
                          : order?.status === 'assigned'
                            ? 'default'
                            : order?.status === 'in_progress'
                              ? 'secondary'
                              : order?.status === 'completed'
                                ? 'success'
                                : 'destructive'
                      }
                    >
                      {order?.status}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  {order?.status === 'assigned' && (
                    <Button onClick={() => handleUpdateStatus('in_progress')}>
                      <Clock className="mr-2 h-4 w-4" />
                      Iniciar Viagem
                    </Button>
                  )}
                  {order?.status === 'in_progress' && (
                    <Button onClick={() => handleUpdateStatus('completed')}>
                      <Check className="mr-2 h-4 w-4" />
                      Concluir Viagem
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => navigate('/driver/assignments')}>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Mapa</CardTitle>
                  <CardDescription>Localização atual e rota</CardDescription>
                </CardHeader>
                <CardContent>
                  {location ? (
                    <>
                      <div className="mb-4">
                        <p className="text-sm font-medium">Sua Localização</p>
                        <p className="text-gray-600">
                          Latitude: {location.coords.latitude}, Longitude: {location.coords.longitude}
                        </p>
                      </div>
                      <DriverMap 
                        origin={order?.origin || ''} 
                        destination={order?.destination || ''} 
                        currentLocation={[location.coords.longitude, location.coords.latitude]} 
                      />
                    </>
                  ) : (
                    <div className="flex items-center justify-center">
                      {isTracking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Buscando sua localização...
                        </>
                      ) : (
                        <>
                          <AlertOctagon className="mr-2 h-4 w-4" />
                          Localização não disponível.
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TransitionEffect>
  );
};

export default DriverNavigation;
