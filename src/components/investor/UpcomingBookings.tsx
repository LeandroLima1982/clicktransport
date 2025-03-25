
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, MapPin, Car } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UpcomingBookingsProps {
  companies: any[];
}

const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({ companies }) => {
  const [upcomingOrders, setUpcomingOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (companies.length > 0) {
      fetchUpcomingOrders();
    } else {
      setIsLoading(false);
      setUpcomingOrders([]);
    }
  }, [companies]);

  const fetchUpcomingOrders = async () => {
    setIsLoading(true);
    try {
      const companyIds = companies.map(c => c.id);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('service_orders')
        .select('*, companies:company_id(name)')
        .in('company_id', companyIds)
        .gte('pickup_date', now)
        .order('pickup_date', { ascending: true })
        .limit(10);
      
      if (error) throw error;
      
      setUpcomingOrders(data || []);
    } catch (error) {
      console.error('Erro ao buscar próximos agendamentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">Em Progresso</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Carregando agendamentos...</p>
      </div>
    );
  }

  if (upcomingOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhum agendamento futuro encontrado</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor Est.</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {upcomingOrders.map((order) => {
            const company = companies.find(c => c.id === order.company_id);
            const estimatedValue = 100; // Valor estimado da ordem
            const investorShare = company ? (estimatedValue * company.percentage / 100) : 0;
            
            return (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.companies?.name || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <CalendarClock className="h-4 w-4 mr-2 text-blue-500" />
                    {formatDate(order.pickup_date)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {order.origin}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {order.destination}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Car className="h-4 w-4 mr-2 text-green-500" />
                    R$ {investorShare.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UpcomingBookings;
