
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceOrderList from '@/components/company/ServiceOrderList';
import CompanyPanel from '@/components/company/CompanyPanel';
import DriversManagement from '@/components/company/DriversManagement';
import VehiclesManagement from '@/components/company/VehiclesManagement';
import TransitionEffect from '@/components/TransitionEffect';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchCompanyId();
    }
  }, [user]);

  const fetchCompanyId = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Erro ao buscar empresa:', error);
        toast.error('Erro ao carregar dados da empresa');
        return;
      }

      if (data) {
        setCompanyId(data.id);
        setCompanyData(data);
        console.log('Dados da empresa:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando dados da empresa...</p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Perfil de empresa não encontrado. Entre em contato com o suporte.</p>
      </div>
    );
  }

  return (
    <TransitionEffect>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
          <div>
            <h1 className="text-2xl font-bold">{companyData?.name || 'Painel da Empresa'}</h1>
            <p className="text-muted-foreground">Gerencie suas operações de transporte</p>
          </div>
          
          {companyData?.status && (
            <Badge className={`px-2 py-1 ${
              companyData.status === 'active' ? 'bg-green-100 text-green-800' : 
              companyData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {companyData.status === 'active' ? 'Ativo' : 
               companyData.status === 'pending' ? 'Pendente' : 'Inativo'}
            </Badge>
          )}
        </div>
        
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid grid-cols-4 md:w-[600px]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="orders">Ordens de Serviço</TabsTrigger>
            <TabsTrigger value="drivers">Motoristas</TabsTrigger>
            <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <CompanyPanel />
          </TabsContent>
          
          <TabsContent value="orders" className="space-y-4">
            <ServiceOrderList companyId={companyId} />
          </TabsContent>
          
          <TabsContent value="drivers" className="space-y-4">
            <DriversManagement companyId={companyId} />
          </TabsContent>
          
          <TabsContent value="vehicles" className="space-y-4">
            <VehiclesManagement companyId={companyId} />
          </TabsContent>
        </Tabs>
      </div>
    </TransitionEffect>
  );
};

export default CompanyDashboard;
