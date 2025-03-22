
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CompanyDashboard from './CompanyDashboard';
import ServiceOrderList from './ServiceOrderList';
import VehiclesManagement from './VehiclesManagement';
import DriversManagement from './DriversManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface CompanyPanelProps {
  companyId?: string;
}

interface CompanyInfo {
  id: string;
  name: string;
  logo_url?: string;
}

const CompanyPanel: React.FC<CompanyPanelProps> = ({ companyId }) => {
  const { companyId: routeCompanyId } = useParams<{ companyId: string }>();
  const resolvedCompanyId = companyId || routeCompanyId;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
    }
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
                <CompanyDashboard />
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
