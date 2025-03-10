
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
import { Edit, Trash } from 'lucide-react';
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
  year: number | null;
  status: 'active' | 'maintenance' | 'inactive';
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
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Modelo</TableHead>
            <TableHead>Placa</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell className="font-medium">{vehicle.model}</TableCell>
              <TableCell>{vehicle.license_plate}</TableCell>
              <TableCell>{vehicle.year || '-'}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(vehicle.status)}`}>
                  {translateStatus(vehicle.status)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Sheet onOpenChange={(open) => {
                    if (open) onEdit(vehicle);
                  }}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                  </Sheet>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
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
