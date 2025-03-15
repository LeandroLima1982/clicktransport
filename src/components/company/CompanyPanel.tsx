
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, FileText, Users, ChartBar, LogOut, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import CompanyDashboard from './CompanyDashboard';
import ServiceOrderList from './ServiceOrderList';
import DriversManagement from './DriversManagement';
import VehiclesManagement from './VehiclesManagement';

const CompanyPanel: React.FC = () => {
  const { user, userRole, signOut, isAuthenticating } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not a company
  React.useEffect(() => {
    if (!user || userRole !== 'company') {
      navigate('/auth');
    }
  }, [user, userRole, navigate]);

  if (!user || userRole !== 'company') {
    return <div className="flex items-center justify-center h-screen">Verificando acesso...</div>;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Error will be displayed by the AuthProvider
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Painel da Empresa</h1>
        <Button variant="outline" onClick={handleSignOut} disabled={isAuthenticating} className="flex items-center gap-2">
          {isAuthenticating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saindo...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              Sair
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="w-full grid grid-cols-4 mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <ChartBar className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Ordens de Serviço</span>
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Motoristas</span>
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">Veículos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <CompanyDashboard />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <ServiceOrderList />
        </TabsContent>
        
        <TabsContent value="drivers" className="space-y-4">
          <DriversManagement />
        </TabsContent>
        
        <TabsContent value="vehicles" className="space-y-4">
          <VehiclesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyPanel;
