
import React from 'react';
import { useParams } from 'react-router-dom';
import CompanyDashboard from './CompanyDashboard';
import ServiceOrderList from '@/components/company/orders/OrderTable';
import VehiclesManagement from './VehiclesManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CompanyPanelProps {
  companyId?: string;
}

const CompanyPanel: React.FC<CompanyPanelProps> = ({ companyId }) => {
  const { companyId: routeCompanyId } = useParams<{ companyId: string }>();
  const resolvedCompanyId = companyId || routeCompanyId;

  if (!resolvedCompanyId) {
    return <p>Nenhuma empresa selecionada.</p>;
  }

  return (
    <div>
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Ordens de Serviço</TabsTrigger>
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <CompanyDashboard />
        </TabsContent>
        <TabsContent value="orders">
          <ServiceOrderList companyId={resolvedCompanyId} />
        </TabsContent>
        <TabsContent value="vehicles">
          <VehiclesManagement companyId={resolvedCompanyId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CompanyPanel;
