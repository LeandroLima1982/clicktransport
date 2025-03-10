
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Car, FileText, Users, ChartBar, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CompanyDashboard from './CompanyDashboard';
import ServiceOrderList from './ServiceOrderList';
import DriversManagement from './DriversManagement';
import VehiclesManagement from './VehiclesManagement';
import { supabase } from '@/main';
import { toast } from 'sonner';

const CompanyPanel: React.FC = () => {
  const { user, userRole, signOut, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch company data
  useEffect(() => {
    if (!user || userRole !== 'company') {
      navigate('/auth');
      return;
    }

    const fetchCompanyData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (!data) {
          setError('Não foi possível localizar os dados da empresa. Por favor, contate o suporte.');
          return;
        }
        
        setCompanyData(data);
      } catch (err: any) {
        console.error('Error fetching company data:', err);
        setError(`Erro ao carregar dados: ${err.message || 'Erro desconhecido'}`);
        toast.error('Erro ao carregar dados da empresa', {
          description: 'Não foi possível recuperar as informações da empresa.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyData();
  }, [user, userRole, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Error will be displayed by the AuthProvider
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <p className="text-lg">Carregando dados da empresa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Erro ao carregar</h2>
        <p className="text-muted-foreground text-center mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        <Button variant="outline" onClick={handleSignOut} className="mt-4">Voltar para o início</Button>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Conta não configurada</h2>
        <p className="text-muted-foreground text-center mb-6">
          Sua conta de empresa não está completamente configurada. Por favor, contate o suporte.
        </p>
        <Button onClick={handleSignOut} variant="outline">Voltar para o início</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{companyData.name}</h1>
          <p className="text-muted-foreground">{companyData.status === 'active' ? 'Ativo' : 'Pendente'}</p>
        </div>
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
          <CompanyDashboard company={companyData} />
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-4">
          <ServiceOrderList companyId={companyData.id} />
        </TabsContent>
        
        <TabsContent value="drivers" className="space-y-4">
          <DriversManagement companyId={companyData.id} />
        </TabsContent>
        
        <TabsContent value="vehicles" className="space-y-4">
          <VehiclesManagement companyId={companyData.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompanyPanel;
