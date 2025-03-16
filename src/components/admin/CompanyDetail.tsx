
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  status: string;
  created_at: string;
  user_id: string | null;
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
      
      toast.success(`Status da empresa atualizado para ${newStatus}`);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Detalhes da Empresa</SheetTitle>
          <SheetDescription>
            Informações detalhadas sobre a empresa selecionada
          </SheetDescription>
        </SheetHeader>
        
        {error && (
          <Alert variant="error" className="my-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="py-6 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Nome</h3>
            <p className="mt-1 text-lg font-medium">{company.name}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">CNPJ</h3>
            <p className="mt-1">{company.cnpj || 'Não informado'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <div className="mt-1">{getStatusBadge(company.status)}</div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Data de Cadastro</h3>
            <p className="mt-1">{formatDate(company.created_at)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">ID do Usuário</h3>
            <p className="mt-1 text-xs">{company.user_id || 'Não associado'}</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
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
        
        <SheetFooter className="pt-4">
          <SheetClose asChild>
            <Button>Fechar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CompanyDetail;
