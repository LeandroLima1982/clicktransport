
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, FileText, Users, ChartBar, LogOut, Loader2, AlertTriangle, Home } from 'lucide-react';
import CompanyDashboard from './CompanyDashboard';
import ServiceOrderList from './ServiceOrderList';
import DriversManagement from './DriversManagement';
import VehiclesManagement from './VehiclesManagement';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompanyData {
  id: string;
  name: string;
  status: string;
  user_id: string;
  cnpj?: string;
  queue_position?: number;
  created_at?: string;
  last_order_assigned?: string;
}

interface CompanyPanelProps {
  company: CompanyData;
}

const CompanyPanel: React.FC<CompanyPanelProps> = ({ company }) => {
  const { user, userRole, signOut, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Redirect if no company data
  useEffect(() => {
    if (!company || !company.id) {
      toast.error('Dados da empresa não encontrados', {
        description: 'Não foi possível carregar as informações da empresa.'
      });
      navigate('/');
    }
  }, [company, navigate]);

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
        <div>
          <h1 className="text-2xl font-bold">{company?.name || 'Painel da Empresa'}</h1>
          <p className="text-muted-foreground">{company?.status === 'active' ? 'Ativo' : 'Pendente'}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Início
            </Button>
          </Link>
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
      </div>

      <Tabs defaultValue="dashboard" className="w-full" value={activeTab} onValueChange={setActiveTab}>
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
          <CompanyDashboard company={company} />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <ServiceOrderList companyId={company.id} />
        </TabsContent>
        
        <TabsContent value="drivers" className="space-y-4">
          <DriversManagement companyId={company.id} />
        </TabsContent>
        
        <TabsContent value="vehicles" className="space-y-4">
          <VehiclesManagement companyId={company.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyPanel;
