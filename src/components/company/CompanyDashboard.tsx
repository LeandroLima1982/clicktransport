
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarRange, 
  Truck, 
  Hourglass, 
  MapPin, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';
import { useCompanyQueue } from '@/hooks/useCompanyQueue';
import { toast } from 'sonner';

interface CompanyDashboardProps {
  companyId?: string;
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ companyId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { companies, isLoading: queueLoading, fetchCompanies } = useCompanyQueue();
  const [stats, setStats] = useState({
    drivers: 0,
    vehicles: 0,
    activeOrders: 0,
    completedOrders: 0,
    queuePosition: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchCompanies();
    }
  }, [user, companyId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch company information
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq(companyId ? 'id' : 'user_id', companyId || user?.id)
        .single();

      if (companyError) {
        throw companyError;
      }

      setCompany(companyData);
      const resolvedCompanyId = companyId || companyData.id;

      // Fetch drivers count
      const { count: driversCount, error: driversError } = await supabase
        .from('drivers')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', resolvedCompanyId);

      if (driversError) throw driversError;

      // Fetch vehicles count
      const { count: vehiclesCount, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', resolvedCompanyId);

      if (vehiclesError) throw vehiclesError;

      // Fetch active orders count
      const { count: activeOrdersCount, error: activeOrdersError } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', resolvedCompanyId)
        .in('status', ['pending', 'assigned', 'in_progress']);

      if (activeOrdersError) throw activeOrdersError;

      // Fetch completed orders count
      const { count: completedOrdersCount, error: completedOrdersError } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', resolvedCompanyId)
        .eq('status', 'completed');

      if (completedOrdersError) throw completedOrdersError;

      setStats({
        drivers: driversCount || 0,
        vehicles: vehiclesCount || 0,
        activeOrders: activeOrdersCount || 0,
        completedOrders: completedOrdersCount || 0,
        queuePosition: companyData.queue_position || 0
      });

      setError(null);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Handle button clicks
  const handleViewVehiclesMap = () => {
    // For now, we'll just show a toast and navigate to vehicles tab
    toast.info('Funcionalidade de mapa será implementada em breve');
    if (companyId) {
      const event = new CustomEvent('navigate-tab', { detail: { tab: 'vehicles' } });
      window.dispatchEvent(event);
    }
  };

  const handleManageDrivers = () => {
    // Navigate to the drivers tab
    if (companyId) {
      const event = new CustomEvent('navigate-tab', { detail: { tab: 'drivers' } });
      window.dispatchEvent(event);
    }
  };

  const handleNewServiceOrder = () => {
    // Navigate to the orders tab
    if (companyId) {
      const event = new CustomEvent('navigate-tab', { detail: { tab: 'orders' } });
      window.dispatchEvent(event);
    }
    toast.info('Funcionalidade de nova ordem será implementada em breve');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-48"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Erro
          </CardTitle>
          <CardDescription>Ocorreu um erro ao carregar os dados do dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={fetchData} className="mt-4">Tentar novamente</Button>
        </CardContent>
      </Card>
    );
  }

  if (!company) {
    return <p>Nenhuma empresa encontrada.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Truck className="mr-2 h-4 w-4 text-primary" />
              Veículos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vehicles}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de veículos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Users className="mr-2 h-4 w-4 text-primary" />
              Motoristas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.drivers}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de motoristas cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <ClipboardList className="mr-2 h-4 w-4 text-primary" />
              Ordens Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Ordens em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-primary" />
              Concluídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de ordens concluídas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Status da Empresa</CardTitle>
            <CardDescription>Informações sobre o status da empresa no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="flex items-center">
                  <CalendarRange className="mr-2 h-4 w-4 text-muted-foreground" />
                  Status
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  company.status === 'active' ? 'bg-green-100 text-green-800' : 
                  company.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                  'bg-amber-100 text-amber-800'
                }`}>
                  {company.status === 'active' ? 'Ativo' : 
                   company.status === 'inactive' ? 'Inativo' : 
                   'Pendente'}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-b pb-2">
                <span className="flex items-center">
                  <Hourglass className="mr-2 h-4 w-4 text-muted-foreground" />
                  Posição na Fila
                </span>
                <span className="font-semibold">{stats.queuePosition || 'N/A'}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <CalendarRange className="mr-2 h-4 w-4 text-muted-foreground" />
                  Última Atribuição
                </span>
                <span className="font-semibold">
                  {company.last_order_assigned 
                    ? new Date(company.last_order_assigned).toLocaleDateString() 
                    : 'Nenhuma'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesse funcionalidades importantes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={handleViewVehiclesMap}>
                <MapPin className="mr-2 h-4 w-4" />
                Ver Mapa de Veículos
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleManageDrivers}>
                <Users className="mr-2 h-4 w-4" />
                Gerenciar Motoristas
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={handleNewServiceOrder}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Nova Ordem de Serviço
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;
