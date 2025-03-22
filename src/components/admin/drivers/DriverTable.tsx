
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
import { Badge } from "@/components/ui/badge";
import { Eye, Key, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { formatRelativeDate } from '@/components/company/orders/utils';

interface Driver {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  license_number: string | null;
  last_login: string | null;
  company_id: string | null;
  companies?: {
    name: string;
    id: string;
  } | null;
}

interface DriverTableProps {
  drivers: Driver[];
  isLoading: boolean;
  onViewDetails: (driver: Driver) => void;
  onResetPassword: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

const DriverTable: React.FC<DriverTableProps> = ({
  drivers,
  isLoading,
  onViewDetails,
  onResetPassword,
  onStatusChange
}) => {
  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Inativo</Badge>;
      case 'on_trip':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Em Viagem</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Indefinido</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Carregando motoristas...</div>;
  }

  if (drivers.length === 0) {
    return <div className="text-center py-4">Nenhum motorista encontrado</div>;
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Último Acesso</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell className="font-medium">{driver.name}</TableCell>
              <TableCell>{driver.companies?.name || "Não atribuído"}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm">{driver.email || "-"}</span>
                  <span className="text-sm text-muted-foreground">{driver.phone || "-"}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(driver.status)}</TableCell>
              <TableCell>{driver.last_login ? formatRelativeDate(driver.last_login) : "Nunca"}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onViewDetails(driver)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onResetPassword(driver.id)}>
                      <Key className="mr-2 h-4 w-4" />
                      Redefinir Senha
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Alterar Status
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => onStatusChange(driver.id, 'active')}>
                            <Badge className="mr-2 bg-green-100 text-green-800 border-green-300">Ativo</Badge>
                            Marcar como Ativo
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(driver.id, 'inactive')}>
                            <Badge className="mr-2 bg-red-100 text-red-800 border-red-300">Inativo</Badge>
                            Marcar como Inativo
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DriverTable;
