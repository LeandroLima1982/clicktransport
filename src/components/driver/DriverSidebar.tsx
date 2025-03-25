import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListChecks, 
  Map,
  Calendar, 
  Navigation, 
  Settings, 
  LogOut, 
  User,
  CarFront,
  Plane
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useSiteLogo } from '@/hooks/useSiteLogo';

const DriverSidebar: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { light: lightLogo } = useSiteLogo();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="flex items-center space-x-2">
          {lightLogo ? (
            <img 
              src={lightLogo} 
              alt="LaTransfer" 
              className="h-8 w-auto"
              onError={(e) => {
                console.error('Error loading logo in DriverSidebar:', e);
                // In case of error, fall back to default
                e.currentTarget.src = '/lovable-uploads/a44df5bf-bb4f-4163-9b8c-12d1c36e6686.png';
              }}
            />
          ) : (
            <>
              <div className="relative">
                <CarFront className="h-6 w-6 text-secondary" />
                <Plane className="h-5 w-5 text-primary absolute -top-2 -right-2 transform rotate-45" />
              </div>
              <span className="text-lg font-bold">LaTransfer</span>
            </>
          )}
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(location.pathname === '/driver/dashboard' ? 'bg-primary/10 text-primary' : '')}>
                  <Link to="/driver/dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(location.pathname === '/driver/assignments' ? 'bg-primary/10 text-primary' : '')}>
                  <Link to="/driver/assignments">
                    <ListChecks className="h-5 w-5" />
                    <span>Atribuições</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(location.pathname === '/driver/trips' ? 'bg-primary/10 text-primary' : '')}>
                  <Link to="/driver/trips">
                    <Map className="h-5 w-5" />
                    <span>Minhas Viagens</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(location.pathname === '/driver/schedule' ? 'bg-primary/10 text-primary' : '')}>
                  <Link to="/driver/schedule">
                    <Calendar className="h-5 w-5" />
                    <span>Agenda</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(location.pathname === '/driver/navigation' ? 'bg-primary/10 text-primary' : '')}>
                  <Link to="/driver/navigation">
                    <Navigation className="h-5 w-5" />
                    <span>Navegação</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(location.pathname === '/driver/profile' ? 'bg-primary/10 text-primary' : '')}>
                  <Link to="/driver/profile">
                    <User className="h-5 w-5" />
                    <span>Perfil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild className={cn(location.pathname === '/driver/settings' ? 'bg-primary/10 text-primary' : '')}>
                  <Link to="/driver/settings">
                    <Settings className="h-5 w-5" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Button variant="outline" className="w-full justify-start" onClick={handleSignOut}>
          <LogOut className="h-5 w-5 mr-2" />
          <span>Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DriverSidebar;
