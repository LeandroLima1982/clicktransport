
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, TruckIcon, UserIcon } from 'lucide-react';

interface ServiceOrder {
  id: string;
  origin: string;
  destination: string;
  pickup_date: string;
  delivery_date: string | null;
  status: 'pending' | 'created' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
}

interface Driver {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
}

interface OrderDetailSheetProps {
  order: ServiceOrder | null;
  isOpen: boolean;
  onClose: () => void;
  drivers: Driver[];
  vehicles: Vehicle[];
}

const OrderDetailSheet: React.FC<OrderDetailSheetProps> = ({
  order,
  isOpen,
  onClose,
  drivers,
  vehicles
}) => {
  if (!order) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definido';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'created': return 'bg-blue-50 border-blue-300 text-blue-800';
      case 'assigned': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'in_progress': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'completed': return 'bg-green-100 border-green-300 text-green-800';
      case 'cancelled': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const translateStatus = (status: string) => {
    const statusMap: {[key: string]: string} = {
      'pending': 'Pendente',
      'created': 'Criado',
      'assigned': 'Atribuído',
      'in_progress': 'Em progresso',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  const getDriverName = (driverId: string | null) => {
    if (!driverId) return 'Não atribuído';
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : 'Motorista não encontrado';
  };

  const getVehicleInfo = (vehicleId: string | null) => {
    if (!vehicleId) return 'Não atribuído';
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.model} (${vehicle.license_plate})` : 'Veículo não encontrado';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>Detalhes da Ordem de Serviço</SheetTitle>
          <SheetDescription>
            Informações sobre a ordem #{order.id.substring(0, 8)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg">Status</h3>
            <Badge className={`${getStatusColor(order.status)} px-3 py-1`}>
              {translateStatus(order.status)}
            </Badge>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-lg flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Origem e Destino
            </h3>
            <div className="bg-slate-50 p-3 rounded-lg space-y-2">
              <p className="font-medium">Origem</p>
              <p className="text-slate-700">{order.origin}</p>
              <p className="font-medium mt-2">Destino</p>
              <p className="text-slate-700">{order.destination}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Datas
            </h3>
            <div className="bg-slate-50 p-3 rounded-lg space-y-1">
              <div>
                <p className="font-medium">Data de Coleta</p>
                <p className="text-slate-700">{formatDate(order.pickup_date)}</p>
              </div>
              <div className="mt-2">
                <p className="font-medium">Data de Entrega (Estimada)</p>
                <p className="text-slate-700">{formatDate(order.delivery_date)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-lg flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Motorista
            </h3>
            <p className="bg-slate-50 p-3 rounded-lg">
              {getDriverName(order.driver_id)}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium text-lg flex items-center">
              <TruckIcon className="h-5 w-5 mr-2" />
              Veículo
            </h3>
            <p className="bg-slate-50 p-3 rounded-lg">
              {getVehicleInfo(order.vehicle_id)}
            </p>
          </div>

          {order.notes && (
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Observações</h3>
              <p className="bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OrderDetailSheet;
