
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock, Car, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  company_id: string;
  company_name?: string;
}

const ServiceOrderList: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDriverId();
    }
  }, [user]);

  useEffect(() => {
    if (driverId) {
      fetchOrders();
    }
  }, [driverId]);

  const fetchDriverId = async () => {
    try {
      const { data } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (data) {
        setDriverId(data.id);
      }
    } catch (error) {
      console.error('Error fetching driver ID:', error);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Fetch orders assigned to this driver
      const { data: assignedOrders, error: assignedError } = await supabase
        .from('service_orders')
        .select('*, companies(name)')
        .eq('driver_id', driverId)
        .in('status', ['assigned', 'in_progress'])
        .order('pickup_date', { ascending: true });

      if (assignedError) throw assignedError;

      // Fetch pending orders that could be assigned to a driver
      // In a real app, you might want to limit this to orders from companies the driver works with
      const { data: availableOrders, error: availableError } = await supabase
        .from('service_orders')
        .select('*, companies(name)')
        .eq('status', 'pending')
        .is('driver_id', null)
        .order('pickup_date', { ascending: true });

      if (availableError) throw availableError;

      // Format the data to include company name
      const formattedAssigned = assignedOrders?.map((order: any) => ({
        ...order,
        company_name: order.companies?.name
      })) || [];

      const formattedAvailable = availableOrders?.map((order: any) => ({
        ...order,
        company_name: order.companies?.name
      })) || [];

      // Combine both sets of orders
      setOrders([...formattedAssigned, ...formattedAvailable]);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erro ao carregar ordens de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ 
          driver_id: driverId,
          status: 'assigned'
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Ordem de serviço aceita com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Erro ao aceitar ordem de serviço');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      // In this implementation, rejecting just means we won't assign it to ourselves
      // The order remains available for other drivers
      toast.info('Ordem de serviço rejeitada');
      // We could also update the order status or log the rejection
      // For now, just refresh the orders
      fetchOrders();
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast.error('Erro ao rejeitar ordem de serviço');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Status atualizado com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definido';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Atribuído</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Em Progresso</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-4">Carregando ordens de serviço...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="assigned">
        <TabsList>
          <TabsTrigger value="assigned">Minhas Corridas</TabsTrigger>
          <TabsTrigger value="available">Disponíveis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assigned" className="mt-4">
          <div className="space-y-4">
            {orders.filter(order => ['assigned', 'in_progress'].includes(order.status) && order.driver_id === driverId).length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">Você não tem ordens de serviço atribuídas no momento.</p>
              </div>
            ) : (
              orders
                .filter(order => ['assigned', 'in_progress'].includes(order.status) && order.driver_id === driverId)
                .map(order => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold mb-2">Ordem #{order.id.slice(0, 8)}</h3>
                              <p className="text-sm text-muted-foreground mb-1">Empresa: {order.company_name}</p>
                              <p className="text-sm text-muted-foreground">Data: {formatDate(order.pickup_date)}</p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Origem:</p>
                                <p>{order.origin}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Destino:</p>
                                <p>{order.destination}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col justify-end">
                          <div className="space-y-2">
                            {order.status === 'assigned' && (
                              <Button 
                                className="w-full" 
                                onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                              >
                                <Car className="mr-2 h-4 w-4" />
                                Iniciar Corrida
                              </Button>
                            )}
                            
                            {order.status === 'in_progress' && (
                              <Button 
                                className="w-full" 
                                variant="default" 
                                onClick={() => handleUpdateStatus(order.id, 'completed')}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Finalizar Corrida
                              </Button>
                            )}
                            
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button variant="outline" className="w-full">Ver Detalhes</Button>
                              </SheetTrigger>
                              <SheetContent>
                                <SheetHeader>
                                  <SheetTitle>Detalhes da Ordem</SheetTitle>
                                  <SheetDescription>
                                    Informações completas da ordem de serviço.
                                  </SheetDescription>
                                </SheetHeader>
                                
                                <div className="mt-6 space-y-6">
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Informações Gerais</h4>
                                    <div className="space-y-1">
                                      <p className="text-sm flex justify-between">
                                        <span className="text-muted-foreground">ID:</span>
                                        <span>{order.id.slice(0, 8)}</span>
                                      </p>
                                      <p className="text-sm flex justify-between">
                                        <span className="text-muted-foreground">Empresa:</span>
                                        <span>{order.company_name}</span>
                                      </p>
                                      <p className="text-sm flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <span>{getStatusBadge(order.status)}</span>
                                      </p>
                                      <p className="text-sm flex justify-between">
                                        <span className="text-muted-foreground">Data de Coleta:</span>
                                        <span>{formatDate(order.pickup_date)}</span>
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Localização</h4>
                                    <div className="space-y-3">
                                      <div>
                                        <p className="text-sm text-muted-foreground">Origem:</p>
                                        <p className="font-medium">{order.origin}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Destino:</p>
                                        <p className="font-medium">{order.destination}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {order.notes && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">Observações</h4>
                                      <p>{order.notes}</p>
                                    </div>
                                  )}
                                  
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Ações</h4>
                                    <div className="space-y-2">
                                      {order.status === 'assigned' && (
                                        <Button 
                                          className="w-full" 
                                          onClick={() => {
                                            handleUpdateStatus(order.id, 'in_progress');
                                          }}
                                        >
                                          <Car className="mr-2 h-4 w-4" />
                                          Iniciar Corrida
                                        </Button>
                                      )}
                                      
                                      {order.status === 'in_progress' && (
                                        <Button 
                                          className="w-full" 
                                          variant="default" 
                                          onClick={() => {
                                            handleUpdateStatus(order.id, 'completed');
                                          }}
                                        >
                                          <CheckCircle className="mr-2 h-4 w-4" />
                                          Finalizar Corrida
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </SheetContent>
                            </Sheet>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="available" className="mt-4">
          <div className="space-y-4">
            {orders.filter(order => order.status === 'pending' && !order.driver_id).length === 0 ? (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">Não há ordens de serviço disponíveis no momento.</p>
              </div>
            ) : (
              orders
                .filter(order => order.status === 'pending' && !order.driver_id)
                .map(order => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold mb-2">Ordem #{order.id.slice(0, 8)}</h3>
                              <p className="text-sm text-muted-foreground mb-1">Empresa: {order.company_name}</p>
                              <p className="text-sm text-muted-foreground">Data: {formatDate(order.pickup_date)}</p>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          
                          <div className="mt-4 space-y-2">
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Origem:</p>
                                <p>{order.origin}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-start space-x-2">
                              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-sm text-muted-foreground">Destino:</p>
                                <p>{order.destination}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col justify-end">
                          <div className="space-y-2">
                            <Button 
                              className="w-full" 
                              onClick={() => handleAcceptOrder(order.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Aceitar Corrida
                            </Button>
                            
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleRejectOrder(order.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Rejeitar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceOrderList;
