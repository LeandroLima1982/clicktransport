
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';
import { format } from 'date-fns';
import { FileText, MapPin, Calendar } from 'lucide-react';

interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date: string | null;
  status: string;
  notes: string | null;
  company_id: string;
  company_name?: string;
}

const TripHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);

  useEffect(() => {
    if (user) {
      fetchDriverId();
    }
  }, [user]);

  useEffect(() => {
    if (driverId) {
      fetchCompletedOrders();
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

  const fetchCompletedOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*, companies(name)')
        .eq('driver_id', driverId)
        .eq('status', 'completed')
        .order('pickup_date', { ascending: false });

      if (error) throw error;

      // Format the data
      const formattedOrders = data?.map((order: any) => ({
        ...order,
        company_name: order.companies?.name
      })) || [];

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching completed orders:', error);
    } finally {
      setIsLoading(false);
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
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-4">Carregando histórico...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Histórico de Corridas</h2>
        <div className="text-sm text-muted-foreground">
          Total: {orders.length} corridas
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium mb-1">Sem histórico de corridas</h3>
          <p className="text-muted-foreground">
            Você ainda não completou nenhuma corrida. Quando finalizar alguma, ela aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold mb-2">Ordem #{order.id.slice(0, 8)}</h3>
                      <div className="flex items-center space-x-3 mb-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(order.pickup_date)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Empresa: {order.company_name}</p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Origem:</p>
                          <p className="text-sm">{order.origin}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Destino:</p>
                          <p className="text-sm">{order.destination}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-end">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                          >
                            Ver Detalhes
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          {selectedOrder && (
                            <>
                              <SheetHeader>
                                <SheetTitle>Detalhes da Corrida</SheetTitle>
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
                                      <span>{selectedOrder.id.slice(0, 8)}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                      <span className="text-muted-foreground">Empresa:</span>
                                      <span>{selectedOrder.company_name}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                      <span className="text-muted-foreground">Status:</span>
                                      <span>{getStatusBadge(selectedOrder.status)}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                      <span className="text-muted-foreground">Data de Coleta:</span>
                                      <span>{formatDate(selectedOrder.pickup_date)}</span>
                                    </p>
                                    <p className="text-sm flex justify-between">
                                      <span className="text-muted-foreground">Data de Entrega:</span>
                                      <span>{formatDate(selectedOrder.delivery_date)}</span>
                                    </p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Localização</h4>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Origem:</p>
                                      <p className="font-medium">{selectedOrder.origin}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Destino:</p>
                                      <p className="font-medium">{selectedOrder.destination}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                {selectedOrder.notes && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Observações</h4>
                                    <p>{selectedOrder.notes}</p>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripHistory;
