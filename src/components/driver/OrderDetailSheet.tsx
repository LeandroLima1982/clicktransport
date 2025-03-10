
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Car, CheckCircle, XCircle } from 'lucide-react';
import { formatDate, getStatusBadge } from './utils/formatters';
import { ServiceOrder } from './hooks/useServiceOrders';
import { toast } from 'sonner';

interface OrderDetailSheetProps {
  order: ServiceOrder;
  handleUpdateStatus: (orderId: string, newStatus: string) => Promise<void>;
}

const OrderDetailSheet: React.FC<OrderDetailSheetProps> = ({ 
  order, 
  handleUpdateStatus 
}) => {
  const onUpdateStatus = async (newStatus: string) => {
    try {
      await handleUpdateStatus(order.id, newStatus);
      
      const statusMessages = {
        'in_progress': 'Corrida iniciada!',
        'completed': 'Corrida finalizada com sucesso!',
        'cancelled': 'Corrida cancelada'
      };
      
      toast.success(statusMessages[newStatus as keyof typeof statusMessages] || 'Status atualizado');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Não foi possível atualizar o status');
    }
  };

  return (
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
                  onClick={() => onUpdateStatus('in_progress')}
                >
                  <Car className="mr-2 h-4 w-4" />
                  Iniciar Corrida
                </Button>
              )}
              
              {order.status === 'in_progress' && (
                <Button 
                  className="w-full" 
                  variant="default" 
                  onClick={() => onUpdateStatus('completed')}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finalizar Corrida
                </Button>
              )}
              
              {['assigned', 'in_progress'].includes(order.status) && (
                <Button 
                  className="w-full" 
                  variant="destructive" 
                  onClick={() => onUpdateStatus('cancelled')}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar Corrida
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OrderDetailSheet;
