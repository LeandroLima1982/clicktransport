
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import { AlertTriangle, Pencil, UserCog, Building, FileSearch, MoreHorizontal } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  status: string;
  created_at: string;
  user_id: string | null;
  queue_position?: number | null;
}

interface CompanyDetailProps {
  company: Company | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: () => void;
}

const CompanyDetail: React.FC<CompanyDetailProps> = ({
  company,
  isOpen,
  onClose,
  onStatusChange
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState<Partial<Company>>({});
  
  if (!company) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const { error } = await supabase
        .from('companies')
        .update({ status: newStatus })
        .eq('id', company.id);
      
      if (error) throw error;
      
      toast.success(`Status da empresa atualizado para ${translateStatus(newStatus)}`);
      onStatusChange();
    } catch (error: any) {
      console.error('Error updating company status:', error);
      setError(error.message || 'Erro ao atualizar status da empresa');
      toast.error('Erro ao atualizar status da empresa', {
        description: error.message
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save changes
      handleSaveChanges();
    } else {
      // Start editing
      setEditedCompany({
        name: company.name,
        cnpj: company.cnpj
      });
      setIsEditing(true);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const { error } = await supabase
        .from('companies')
        .update({
          name: editedCompany.name,
          cnpj: editedCompany.cnpj
        })
        .eq('id', company.id);
      
      if (error) throw error;
      
      toast.success('Dados da empresa atualizados com sucesso');
      onStatusChange();
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating company:', error);
      setError(error.message || 'Erro ao atualizar dados da empresa');
      toast.error('Erro ao atualizar dados da empresa', {
        description: error.message
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCompany(prev => ({
      ...prev,
      [name]: value
    }));
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

  const translateStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': 'Ativo',
      'pending': 'Pendente',
      'inactive': 'Inativo',
      'suspended': 'Suspenso'
    };
    return statusMap[status] || status;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Ativo</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendente</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Inativo</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Suspenso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleMoveToEndOfQueue = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      
      // Get the current max queue position
      const { data: maxQueuePositionData, error: maxQueueError } = await supabase
        .from('companies')
        .select('queue_position')
        .order('queue_position', { ascending: false })
        .limit(1)
        .single();
      
      if (maxQueueError) throw maxQueueError;
      
      const maxQueuePosition = maxQueuePositionData?.queue_position || 0;
      
      // Update the company's queue position
      const { error: updateError } = await supabase
        .from('companies')
        .update({ queue_position: maxQueuePosition + 1 })
        .eq('id', company.id);
      
      if (updateError) throw updateError;
      
      toast.success('Empresa movida para o fim da fila de atribuições');
      onStatusChange();
    } catch (error: any) {
      console.error('Error moving company to end of queue:', error);
      setError(error.message || 'Erro ao mover empresa para o fim da fila');
      toast.error('Erro ao mover empresa para o fim da fila', {
        description: error.message
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetQueuePosition = async () => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const { error: updateError } = await supabase
        .from('companies')
        .update({ 
          queue_position: 1,
          last_order_assigned: null
        })
        .eq('id', company.id);
      
      if (updateError) throw updateError;
      
      toast.success('Posição da empresa na fila resetada com sucesso');
      onStatusChange();
    } catch (error: any) {
      console.error('Error resetting company queue position:', error);
      setError(error.message || 'Erro ao resetar posição na fila');
      toast.error('Erro ao resetar posição na fila', {
        description: error.message
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Detalhes da Empresa
          </SheetTitle>
          <SheetDescription>
            Informações detalhadas sobre a empresa selecionada
          </SheetDescription>
        </SheetHeader>
        
        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="py-6 space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="company-name">Nome</Label>
                <Input
                  id="company-name"
                  name="name"
                  value={editedCompany.name || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="company-cnpj">CNPJ</Label>
                <Input
                  id="company-cnpj"
                  name="cnpj"
                  value={editedCompany.cnpj || ''}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Nome</h3>
                <p className="mt-1 text-lg font-medium">{company.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">CNPJ</h3>
                <p className="mt-1">{company.cnpj || 'Não informado'}</p>
              </div>
            </>
          )}
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <div className="mt-1">{getStatusBadge(company.status)}</div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Data de Cadastro</h3>
            <p className="mt-1">{formatDate(company.created_at)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Posição na Fila</h3>
            <p className="mt-1">{company.queue_position || 'Não definido'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">ID do Usuário</h3>
            <p className="mt-1 text-xs">{company.user_id || 'Não associado'}</p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Ações Básicas</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm"
                variant="outline"
                onClick={handleEditToggle}
                disabled={isUpdating}
              >
                <Pencil className="h-4 w-4 mr-2" />
                {isEditing ? 'Salvar Alterações' : 'Editar Dados'}
              </Button>
              
              <Button 
                size="sm"
                variant="outline"
                onClick={() => {}}
                disabled={isUpdating}
              >
                <UserCog className="h-4 w-4 mr-2" />
                Gerenciar Acesso
              </Button>
              
              <Button 
                size="sm"
                variant="outline"
                onClick={() => {}}
                disabled={isUpdating}
              >
                <FileSearch className="h-4 w-4 mr-2" />
                Ver Ordens
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Gerenciar Fila</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm"
                variant="outline"
                onClick={handleMoveToEndOfQueue}
                disabled={isUpdating}
              >
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Mover para Fim da Fila
              </Button>
              
              <Button 
                size="sm"
                variant="outline"
                onClick={handleResetQueuePosition}
                disabled={isUpdating}
              >
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Resetar Posição
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Alterar Status</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant={company.status === 'active' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('active')}
                className="bg-green-100 text-green-800 hover:bg-green-200"
                disabled={isUpdating}
              >
                Ativar
              </Button>
              <Button 
                size="sm" 
                variant={company.status === 'pending' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('pending')}
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                disabled={isUpdating}
              >
                Pendente
              </Button>
              <Button 
                size="sm" 
                variant={company.status === 'inactive' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('inactive')}
                className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                disabled={isUpdating}
              >
                Inativar
              </Button>
              <Button 
                size="sm" 
                variant={company.status === 'suspended' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('suspended')}
                className="bg-red-100 text-red-800 hover:bg-red-200"
                disabled={isUpdating}
              >
                Suspender
              </Button>
            </div>
          </div>
        </div>
        
        <SheetFooter className="pt-4 mt-4">
          <SheetClose asChild>
            <Button>Fechar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CompanyDetail;
