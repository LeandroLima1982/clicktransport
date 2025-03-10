
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceOrderList from '@/components/company/ServiceOrderList';
import CompanyPanel from '@/components/company/CompanyPanel';
import TransitionEffect from '@/components/TransitionEffect';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';
import { toast } from 'sonner';

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCompanyId();
    }
  }, [user]);

  const fetchCompanyId = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Erro ao buscar empresa:', error);
        toast.error('Erro ao carregar dados da empresa');
        return;
      }

      if (data) {
        setCompanyId(data.id);
        console.log('ID da empresa:', data.id);
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
        <h1 className="text-2xl font-bold">Painel da Empresa</h1>
        
        <Tabs defaultValue="orders" className="space-y-4">
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
            <h2 className="text-xl font-semibold">Gerenciamento de Motoristas</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </TabsContent>
          
          <TabsContent value="vehicles" className="space-y-4">
            <h2 className="text-xl font-semibold">Gerenciamento de Veículos</h2>
            <p>Funcionalidade em desenvolvimento...</p>
          </TabsContent>
        </Tabs>
      </div>
    </TransitionEffect>
  );
};

export default CompanyDashboard;
