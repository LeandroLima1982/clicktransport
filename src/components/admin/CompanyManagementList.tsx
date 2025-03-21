
import React, { useState } from 'react';
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
import { FileText, MoreHorizontal, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { supabase } from '@/utils/supabaseClient';

interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  status: string;
  created_at: string;
  user_id: string | null;
}

interface CompanyManagementListProps {
  companies: Company[];
  isLoading: boolean;
  onRefreshData: () => void;
  onViewDetails: (company: Company) => void;
}

const CompanyManagementList: React.FC<CompanyManagementListProps> = ({
  companies,
  isLoading,
  onRefreshData,
  onViewDetails
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleViewDetails = (company: Company) => {
    onViewDetails(company);
  };

  const handleStatusChange = async (company: Company, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('companies')
        .update({ status: newStatus })
        .eq('id', company.id);
      
      if (error) throw error;
      
      toast.success(`Status da empresa atualizado para: ${translateStatus(newStatus)}`);
      onRefreshData();
    } catch (error) {
      console.error('Error updating company status:', error);
      toast.error('Falha ao atualizar status da empresa');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const translateStatus = (status: string) => {
    const statusNames: Record<string, string> = {
      'active': 'Ativo',
      'pending': 'Pendente',
      'inactive': 'Inativo',
      'suspended': 'Suspenso'
    };
    
    return statusNames[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspenso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <p>Carregando empresas...</p>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex justify-center items-center flex-col h-60">
        <p className="text-muted-foreground mb-2">Nenhuma empresa encontrada</p>
        <Button variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Cadastrar Empresa
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data Cadastro</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map(company => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell>{company.cnpj || '-'}</TableCell>
              <TableCell>{getStatusBadge(company.status)}</TableCell>
              <TableCell>{formatDate(company.created_at)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleViewDetails(company)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                    {company.status !== 'active' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(company, 'active')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-green-100 text-green-800 mr-2">Ativar</Badge>
                      </DropdownMenuItem>
                    )}
                    {company.status !== 'pending' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(company, 'pending')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-yellow-100 text-yellow-800 mr-2">Marcar como Pendente</Badge>
                      </DropdownMenuItem>
                    )}
                    {company.status !== 'inactive' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(company, 'inactive')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-gray-100 text-gray-800 mr-2">Inativar</Badge>
                      </DropdownMenuItem>
                    )}
                    {company.status !== 'suspended' && (
                      <DropdownMenuItem 
                        onClick={() => handleStatusChange(company, 'suspended')}
                        disabled={updatingStatus}
                      >
                        <Badge className="bg-red-100 text-red-800 mr-2">Suspender</Badge>
                      </DropdownMenuItem>
                    )}
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

export default CompanyManagementList;
