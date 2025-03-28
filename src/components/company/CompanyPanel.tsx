import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CompanyDashboard from './CompanyDashboard';
import ServiceOrderList from './ServiceOrderList';
import VehiclesManagement from './VehiclesManagement';
import DriversManagement from './DriversManagement';
import CompanyMetrics from './CompanyMetrics';
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
  const [logoUrl, setLogoUrl] = useState<string>('/lovable-uploads/8a9d78f7-0536-4e85-9c4b-0debc4c61fcf.png');
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogoSetting = async () => {
      try {
        const { data, error } = await supabase
          .from('site_images')
          .select('image_url')
          .eq('section_id', 'logo')
          .single();
        
        if (error) {
          console.error('Error fetching logo from settings:', error);
          return;
        }
        
        if (data && data.image_url) {
          setLogoUrl(data.image_url);
        }
      } catch (error) {
        console.error('Error loading logo from settings:', error);
      }
    };

    fetchLogoSetting();
    
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
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast.error('Erro ao sair');
        return;
      }
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
            <img 
              src={logoUrl}
              alt="LaTransfer Logo" 
              className="h-12 w-auto mr-4" 
            />
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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="w-full justify-start rounded-b-none border-b">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="orders">Ordens de Serviço</TabsTrigger>
              <TabsTrigger value="vehicles">Veículos</TabsTrigger>
              <TabsTrigger value="drivers">Motoristas</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
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
              <TabsContent value="metrics">
                <CompanyMetrics companyId={resolvedCompanyId} />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyPanel;
