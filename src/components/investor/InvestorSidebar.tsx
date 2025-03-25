
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
import { Sidebar, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

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
        
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={location.pathname.includes('/investor') && (!location.search || location.search.includes('overview'))}
              >
                <Link to="/investor">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Visão Geral</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={isActive('/investor?tab=portfolio')}
              >
                <Link to="/investor?tab=portfolio">
                  <PieChart className="h-5 w-5" />
                  <span>Portfólio</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={isActive('/investor?tab=companies')}
              >
                <Link to="/investor?tab=companies">
                  <Building className="h-5 w-5" />
                  <span>Empresas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={isActive('/investor?tab=performance')}
              >
                <Link to="/investor?tab=performance">
                  <TrendingUp className="h-5 w-5" />
                  <span>Desempenho</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={isActive('/investor?tab=forecasts')}
              >
                <Link to="/investor?tab=forecasts">
                  <BarChart3 className="h-5 w-5" />
                  <span>Previsões</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={isActive('/investor?tab=bookings')}
              >
                <Link to="/investor?tab=bookings">
                  <Calendar className="h-5 w-5" />
                  <span>Agendamentos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={isActive('/investor/settings')}
              >
                <Link to="/investor/settings">
                  <Settings className="h-5 w-5" />
                  <span>Preferências</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
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
