import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Clock, Calendar, FileText, ArrowRight } from 'lucide-react';

interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  status: string;
}

interface ServiceOrderListProps {
  orders: ServiceOrder[];
  driverId: string | null;
  handleUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
}

const ServiceOrderList: React.FC<ServiceOrderListProps> = ({ orders, driverId, handleUpdateStatus }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTrip = async (orderId: string) => {
    setIsLoading(true);
    try {
      await handleUpdateStatus(orderId, 'in_progress');
      toast.success('Viagem iniciada!');
    } catch (error) {
      console.error('Error starting trip:', error);
      toast.error('Erro ao iniciar viagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTrip = async (orderId: string) => {
    setIsLoading(true);
    try {
      await handleUpdateStatus(orderId, 'completed');
      toast.success('Viagem concluída!');
    } catch (error) {
      console.error('Error completing trip:', error);
      toast.error('Erro ao concluir viagem');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma ordem atribuída</CardTitle>
          <CardContent>Não há ordens de serviço atribuídas a você no momento.</CardContent>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <CardTitle>
              <MapPin className="mr-2 h-4 w-4 inline-block" />
              {order.origin} - {order.destination}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>
              <Calendar className="mr-2 h-4 w-4 inline-block" />
              Data de Coleta: {formatDate(order.pickup_date)}
            </p>
            <p>
              <FileText className="mr-2 h-4 w-4 inline-block" />
              Status: <Badge variant="secondary">{order.status}</Badge>
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            {order.status === 'pending' && (
              <Button onClick={() => handleStartTrip(order.id)} disabled={isLoading}>
                {isLoading ? 'Iniciando...' : 'Iniciar Viagem'}
                <ArrowRight className="ml-2 h-4 w-4 inline-block" />
              </Button>
            )}
            {order.status === 'in_progress' && (
              <Button onClick={() => handleCompleteTrip(order.id)} disabled={isLoading}>
                {isLoading ? 'Concluindo...' : 'Concluir Viagem'}
                <ArrowRight className="ml-2 h-4 w-4 inline-block" />
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ServiceOrderList;
