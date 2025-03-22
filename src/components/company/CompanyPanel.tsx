
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CompanyDashboard from './CompanyDashboard';
import ServiceOrderList from './ServiceOrderList';
import VehiclesManagement from './VehiclesManagement';
import DriversManagement from './DriversManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CompanyPanelProps {
  companyId?: string;
}

interface CompanyInfo {
  id: string;
  name: string;
}

const CompanyPanel: React.FC<CompanyPanelProps> = ({ companyId }) => {
  const { companyId: routeCompanyId } = useParams<{ companyId: string }>();
  const resolvedCompanyId = companyId || routeCompanyId;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (resolvedCompanyId) {
      fetchCompanyInfo();
    }
  }, [resolvedCompanyId]);

  const fetchCompanyInfo = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('id', resolvedCompanyId)
        .single();

      if (error) {
        throw error;
      }

      setCompanyInfo(data);
    } catch (error) {
      console.error('Error fetching company info:', error);
      toast.error('Erro ao carregar informações da empresa');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Você saiu com sucesso');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Erro ao sair');
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (!resolvedCompanyId) {
    return <p className="text-center p-4">Nenhuma empresa selecionada.</p>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {companyInfo && (
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl mr-4">
              {companyInfo.name.substring(0, 2).toUpperCase()}
            </div>
            <h1 className="text-2xl font-bold">{companyInfo.name}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBackToHome}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Home
            </Button>
            <Button variant="destructive" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-b-none border-b">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="orders">Ordens de Serviço</TabsTrigger>
              <TabsTrigger value="vehicles">Veículos</TabsTrigger>
              <TabsTrigger value="drivers">Motoristas</TabsTrigger>
            </TabsList>
            <div className="p-4">
              <TabsContent value="dashboard">
                <CompanyDashboard companyId={resolvedCompanyId} />
              </TabsContent>
              <TabsContent value="orders">
                <ServiceOrderList companyId={resolvedCompanyId} />
              </TabsContent>
              <TabsContent value="vehicles">
                <VehiclesManagement companyId={resolvedCompanyId} />
              </TabsContent>
              <TabsContent value="drivers">
                <DriversManagement companyId={resolvedCompanyId} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyPanel;
