
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, FileText, History, ChartBar } from 'lucide-react';
import { Link } from 'react-router-dom';
import DriverDashboard from './DriverDashboard';
import ServiceOrderList from './ServiceOrderList';
import TripHistory from './TripHistory';

const DriverPanel: React.FC = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not a driver
  React.useEffect(() => {
    if (!user || userRole !== 'driver') {
      navigate('/auth');
    }
  }, [user, userRole, navigate]);

  if (!user || userRole !== 'driver') {
    return <div className="flex items-center justify-center h-screen">Verificando acesso...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel do Motorista</h1>
        <Button variant="outline" onClick={() => signOut()}>Sair</Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <ChartBar className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Ordens de Serviço</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DriverDashboard />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <ServiceOrderList />
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <TripHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DriverPanel;
