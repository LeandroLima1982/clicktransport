import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { MapPin, Calendar, User, Truck, FileText, Users, CreditCard } from 'lucide-react';
import { ServiceOrder } from './ServiceOrderTable';

interface OrderDetailModalProps {
  order: ServiceOrder;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange
}) => {
  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ status: newStatus })
        .eq('id', order.id);
      
      if (error) throw error;
      
      toast.success(`Status da ordem atualizado para ${newStatus}`);
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Erro ao atualizar status da ordem');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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

  let passengerData = [];
  try {
    if (order.passenger_data) {
      passengerData = typeof order.passenger_data === 'string' 
        ? JSON.parse(order.passenger_data) 
        : order.passenger_data;
    }
  } catch (e) {
    console.error('Error parsing passenger data:', e);
  }

  const totalPrice = order.total_price || 0;
  const isRoundTrip = order.trip_type === 'roundtrip';
  const oneWayPrice = isRoundTrip ? totalPrice / 2 : totalPrice;
  const returnPrice = isRoundTrip ? totalPrice / 2 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Detalhes da Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre a ordem selecionada
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Empresa
              </h3>
              <p className="mt-1 font-medium">{order.company_name || '-'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Data de Criação
              </h3>
              <p className="mt-1">{formatDate(order.created_at)}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Origem
            </h3>
            <p className="mt-1">{order.origin}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              Destino
            </h3>
            <p className="mt-1">{order.destination}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Data de Coleta
              </h3>
              <p className="mt-1">{formatDate(order.pickup_date)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Data de Entrega
              </h3>
              <p className="mt-1">{order.delivery_date ? formatDate(order.delivery_date) : 'Não definida'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Motorista
              </h3>
              <p className="mt-1">{order.driver_name || 'Não atribuído'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <Truck className="h-4 w-4 mr-1" />
                Veículo
              </h3>
              <p className="mt-1">{order.vehicle_id ? 'Atribuído' : 'Não atribuído'}</p>
            </div>
          </div>
          
          {passengerData && passengerData.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Passageiros
              </h3>
              <div className="mt-2 space-y-2">
                {passengerData.map((passenger: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="font-medium">Passageiro {index + 1}: {passenger.name}</div>
                    <div className="text-sm text-gray-500">WhatsApp: {passenger.phone}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {totalPrice > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <CreditCard className="h-4 w-4 mr-1" />
                Pagamento
              </h3>
              <div className="mt-2 space-y-1">
                {isRoundTrip ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Valor da ida:</span>
                      <span>{formatCurrency(oneWayPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Valor da volta:</span>
                      <span>{formatCurrency(returnPrice)}</span>
                    </div>
                  </>
                ) : null}
                <div className="flex justify-between font-medium pt-1 mt-1 border-t">
                  <span>Total:</span>
                  <span className="text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Observações
            </h3>
            <p className="mt-1">{order.notes || 'Nenhuma observação'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <div className="mt-1">{getStatusBadge(order.status)}</div>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Alterar Status</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant={order.status === 'pending' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('pending')}
              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            >
              Pendente
            </Button>
            <Button 
              size="sm" 
              variant={order.status === 'in_progress' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('in_progress')}
              className="bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              Em Progresso
            </Button>
            <Button 
              size="sm" 
              variant={order.status === 'completed' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('completed')}
              className="bg-green-100 text-green-800 hover:bg-green-200"
            >
              Concluído
            </Button>
            <Button 
              size="sm" 
              variant={order.status === 'cancelled' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('cancelled')}
              className="bg-red-100 text-red-800 hover:bg-red-200"
            >
              Cancelado
            </Button>
          </div>
        </div>
        
        <DialogFooter className="pt-4">
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
