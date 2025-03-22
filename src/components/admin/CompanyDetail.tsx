
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  Mail, 
  Car, 
  User, 
  FileText, 
  RefreshCw, 
  Link as LinkIcon, 
  Loader2 
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('info');
  const [companyStats, setCompanyStats] = useState({
    driverCount: 0,
    vehicleCount: 0,
    orderCount: 0,
    isLoading: true
  });
  const [userData, setUserData] = useState<{email: string; full_name: string} | null>(null);
  
  if (!company) return null;

  React.useEffect(() => {
    if (isOpen && company) {
      fetchCompanyStats();
      if (company.user_id) {
        fetchUserData();
      }
    }
  }, [isOpen, company]);

  const fetchCompanyStats = async () => {
    if (!company) return;

    try {
      setCompanyStats(prev => ({ ...prev, isLoading: true }));

      // Fetch driver count
      const { count: driverCount, error: driverError } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id);
      
      if (driverError) throw driverError;

      // Fetch vehicle count
      const { count: vehicleCount, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id);
      
      if (vehicleError) throw vehicleError;

      // Fetch order count
      const { count: orderCount, error: orderError } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id);
      
      if (orderError) throw orderError;

      setCompanyStats({
        driverCount: driverCount || 0,
        vehicleCount: vehicleCount || 0,
        orderCount: orderCount || 0,
        isLoading: false
      });

    } catch (err) {
      console.error('Error fetching company stats:', err);
      setCompanyStats(prev => ({ ...prev, isLoading: false }));
      toast.error('Erro ao carregar estatísticas da empresa');
    }
  };

  const fetchUserData = async () => {
    if (!company?.user_id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', company.user_id)
        .single();
      
      if (error) throw error;
      
      setUserData(data);
    } catch (err) {
      console.error('Error fetching user data:', err);
      toast.error('Erro ao carregar dados do usuário');
    }
  };

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

  const sendPasswordResetLink = async () => {
    if (!userData?.email) {
      toast.error('Não há email de usuário associado a esta empresa');
      return;
    }

    try {
      setIsUpdating(true);
      const { error } = await supabase.auth.resetPasswordForEmail(userData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) throw error;
      
      toast.success('Link de redefinição de senha enviado com sucesso', {
        description: `Email enviado para ${userData.email}`
      });
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      toast.error('Erro ao enviar link de redefinição de senha', {
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
      <SheetContent className="sm:max-w-lg overflow-y-auto">
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
        
        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="account">Conta</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
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
              <p className="mt-1 text-xs font-mono">{company.user_id || 'Não associado'}</p>
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
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            {companyStats.isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p>Carregando estatísticas...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Card icon={<User className="h-5 w-5" />} title="Motoristas" value={companyStats.driverCount} />
                  <Card icon={<Car className="h-5 w-5" />} title="Veículos" value={companyStats.vehicleCount} />
                  <Card icon={<FileText className="h-5 w-5" />} title="Ordens" value={companyStats.orderCount} />
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchCompanyStats}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Estatísticas
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="account" className="space-y-4">
            {company.user_id ? (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email do Usuário</h3>
                  <p className="mt-1">{userData?.email || 'Carregando...'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nome do Usuário</h3>
                  <p className="mt-1">{userData?.full_name || 'Não informado'}</p>
                </div>
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={sendPasswordResetLink}
                    disabled={isUpdating || !userData?.email}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Link de Redefinição de Senha
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-medium">Empresa sem usuário associado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta empresa não possui um usuário vinculado.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Associar Usuário Existente
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <SheetFooter className="pt-4 mt-4 border-t">
          <SheetClose asChild>
            <Button>Fechar</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// Helper component for stats cards
const Card = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: number }) => {
  return (
    <div className="bg-muted rounded-lg p-4 text-center">
      <div className="flex justify-center text-muted-foreground mb-2">
        {icon}
      </div>
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default CompanyDetail;
