
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MoreHorizontal, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ServiceOrder } from '../ServiceOrderTable';
import ServiceOrderActions from './ServiceOrderActions';

interface ServiceOrderRowProps {
  order: ServiceOrder;
  onViewDetails: (order: ServiceOrder) => void;
  onStatusChange: (order: ServiceOrder, newStatus: string) => void;
  updatingStatus: boolean;
  formatDate: (date: string) => string;
  truncateText: (text: string, length?: number) => string;
  getStatusBadge: (status: string) => React.ReactNode;
}

const ServiceOrderRow: React.FC<ServiceOrderRowProps> = ({
  order,
  onViewDetails,
  onStatusChange,
  updatingStatus,
  formatDate,
  truncateText,
  getStatusBadge
}) => {
  return (
    <TableRow>
      <TableCell>{getStatusBadge(order.status)}</TableCell>
      <TableCell className="font-medium">{order.company_name || '-'}</TableCell>
      <TableCell>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
          {truncateText(order.origin)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
          {truncateText(order.destination)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
          {formatDate(order.pickup_date)}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <ServiceOrderActions 
            order={order}
            onViewDetails={onViewDetails}
            onStatusChange={onStatusChange}
            updatingStatus={updatingStatus}
          />
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default ServiceOrderRow;
