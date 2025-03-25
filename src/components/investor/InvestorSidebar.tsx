
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  PieChart, 
  Building, 
  Calendar, 
  LogOut, 
  Settings,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar, SidebarSection, SidebarItem } from '@/components/ui/sidebar';

const InvestorSidebar: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const isActive = (path: string) => {
    // Extrai a tab da URL se existir
    const searchParams = new URLSearchParams(location.search);
    const currentTab = searchParams.get('tab') || 'overview';
    
    // Se o path contiver uma tab (formato: "path?tab=X"), extraia essa tab
    if (path.includes('?tab=')) {
      const tabPath = path.split('?tab=')[1];
      return currentTab === tabPath;
    }
    
    // Caso contrário, compare com o pathname atual
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-1">Painel do Investidor</h2>
          <p className="text-sm text-muted-foreground">Monitoramento financeiro</p>
        </div>
        
        <SidebarSection label="Menu Principal">
          <SidebarItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="Visão Geral" 
            isActive={location.pathname.includes('/investor') && (!location.search || location.search.includes('overview'))}
            asChild
          >
            <Link to="/investor" />
          </SidebarItem>
          <SidebarItem 
            icon={<PieChart className="h-5 w-5" />} 
            label="Portfólio" 
            isActive={isActive('/investor?tab=portfolio')}
            asChild
          >
            <Link to="/investor?tab=portfolio" />
          </SidebarItem>
          <SidebarItem 
            icon={<Building className="h-5 w-5" />} 
            label="Empresas" 
            isActive={isActive('/investor?tab=companies')}
            asChild
          >
            <Link to="/investor?tab=companies" />
          </SidebarItem>
          <SidebarItem 
            icon={<TrendingUp className="h-5 w-5" />} 
            label="Desempenho" 
            isActive={isActive('/investor?tab=performance')}
            asChild
          >
            <Link to="/investor?tab=performance" />
          </SidebarItem>
          <SidebarItem 
            icon={<BarChart3 className="h-5 w-5" />} 
            label="Previsões" 
            isActive={isActive('/investor?tab=forecasts')}
            asChild
          >
            <Link to="/investor?tab=forecasts" />
          </SidebarItem>
          <SidebarItem 
            icon={<Calendar className="h-5 w-5" />} 
            label="Agendamentos" 
            isActive={isActive('/investor?tab=bookings')}
            asChild
          >
            <Link to="/investor?tab=bookings" />
          </SidebarItem>
        </SidebarSection>
        
        <SidebarSection label="Configurações">
          <SidebarItem 
            icon={<Settings className="h-5 w-5" />} 
            label="Preferências" 
            isActive={isActive('/investor/settings')}
            asChild
          >
            <Link to="/investor/settings" />
          </SidebarItem>
        </SidebarSection>
        
        <div className="mt-auto p-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </Sidebar>
  );
};

export default InvestorSidebar;
