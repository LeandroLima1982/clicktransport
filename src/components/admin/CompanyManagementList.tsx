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
import { FileText, MoreHorizontal, UserPlus, Trash2, Edit, CheckCircle, AlertCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  formatted_cnpj?: string | null; // Make it optional to match other files
  status: string;
  created_at: string;
  user_id: string | null;
}

interface CompanyManagementListProps {
  companies: Company[];
  isLoading: boolean;
  onRefreshData: () => void;
  onViewDetail: (company: Company) => void;
}

const CompanyManagementList: React.FC<CompanyManagementListProps> = ({
  companies,
  isLoading,
  onRefreshData,
  onViewDetail
}) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const handleViewDetails = (company: Company) => {
    onViewDetail(company);
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

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    
    try {
      // Check if company has associated data
      const { count: ordersCount, error: ordersError } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyToDelete.id);
      
      if (ordersError) throw ordersError;
      
      if (ordersCount && ordersCount > 0) {
        toast.error('Não é possível excluir esta empresa', {
          description: 'Existem ordens de serviço associadas a esta empresa.'
        });
        return;
      }
      
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyToDelete.id);
      
      if (error) throw error;
      
      toast.success('Empresa excluída com sucesso');
      onRefreshData();
    } catch (error: any) {
      console.error('Error deleting company:', error);
      toast.error('Falha ao excluir empresa', {
        description: error.message
      });
    } finally {
      setCompanyToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
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
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Cadastro</TableHead>
              <TableHead>Ações Rápidas</TableHead>
              <TableHead className="text-right">Opções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map(company => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.formatted_cnpj || company.cnpj || '-'}</TableCell>
                <TableCell>{getStatusBadge(company.status)}</TableCell>
                <TableCell>{formatDate(company.created_at)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {company.status !== 'active' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleStatusChange(company, 'active')} 
                        disabled={updatingStatus}
                        className="h-8 w-8 text-green-600"
                        title="Ativar"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {company.status !== 'suspended' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleStatusChange(company, 'suspended')} 
                        disabled={updatingStatus}
                        className="h-8 w-8 text-red-600"
                        title="Suspender"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Empresa
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-500"
                        onClick={() => openDeleteDialog(company)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir Empresa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa "{companyToDelete?.name}"? Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCompany}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CompanyManagementList;
