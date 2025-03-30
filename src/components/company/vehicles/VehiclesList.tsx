
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Car, Bus, Truck, Tractor, CarTaxiFront, Bike } from 'lucide-react';
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
  year: number | null;
  status: 'active' | 'maintenance' | 'inactive';
  type: string;
}

interface VehiclesListProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicleId: string) => void;
  getStatusBadgeClass: (status: string) => string;
  translateStatus: (status: string) => string;
}

const VehiclesList: React.FC<VehiclesListProps> = ({
  vehicles,
  onEdit,
  onDelete,
  getStatusBadgeClass,
  translateStatus
}) => {
  // Função para determinar qual ícone exibir baseado no tipo do veículo
  const getVehicleIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'sedan':
      case 'hatch':
      case 'coupe':
        return <Car className="h-7 w-7 text-gray-700" />;
      case 'suv':
      case 'van':
        return <CarTaxiFront className="h-7 w-7 text-gray-700" />;
      case 'bus':
        return <Bus className="h-7 w-7 text-gray-700" />;
      case 'truck':
        return <Truck className="h-7 w-7 text-gray-700" />;
      case 'tractor':
        return <Tractor className="h-7 w-7 text-gray-700" />;
      case 'motorcycle':
        return <Bike className="h-7 w-7 text-gray-700" />;
      default:
        return <Car className="h-7 w-7 text-gray-700" />;
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-100">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-16 text-center"></TableHead>
            <TableHead className="font-semibold">Modelo</TableHead>
            <TableHead className="font-semibold">Placa</TableHead>
            <TableHead className="font-semibold">Ano</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} className="hover:bg-gray-50/50">
              <TableCell className="pl-4 flex justify-center">
                <div className="bg-gray-100 rounded-full p-2 flex items-center justify-center">
                  {getVehicleIcon(vehicle.type)}
                </div>
              </TableCell>
              <TableCell className="font-medium">{vehicle.model}</TableCell>
              <TableCell>{vehicle.license_plate}</TableCell>
              <TableCell>{vehicle.year || '-'}</TableCell>
              <TableCell>
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadgeClass(vehicle.status)}`}>
                  {translateStatus(vehicle.status)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Sheet onOpenChange={(open) => {
                    if (open) onEdit(vehicle);
                  }}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                  </Sheet>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-lg hover:bg-red-50"
                    onClick={() => onDelete(vehicle.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default VehiclesList;
