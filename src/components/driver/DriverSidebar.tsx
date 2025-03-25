
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListChecks, 
  Map,
  Calendar, 
  Navigation, 
  Settings, 
  LogOut, 
  User
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const DriverSidebar: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [logoUrl, setLogoUrl] = useState<string>('/lovable-uploads/8a9d78f7-0536-4e85-9c4b-0debc4c61fcf.png');
  
  useEffect(() => {
    const fetchLogoSetting = async () => {
      try {
        const { data, error } = await supabase
          .from('site_images')
          .select('image_url')
          .eq('section_id', 'logo')
          .single();
        
        if (error) {
          console.error('Error fetching logo from settings:', error);
          return;
        }
        
        if (data && data.image_url) {
          setLogoUrl(data.image_url);
        }
      } catch (error) {
        console.error('Error loading logo from settings:', error);
      }
    };

    fetchLogoSetting();
  }, []);
  
  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error('Erro ao sair do sistema');
        return;
      }
      navigate('/', { replace: true });
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao sair do sistema');
    }
  };
  
  // Improved active route check to avoid re-renders
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="flex items-center">
          <img 
            src={logoUrl} 
            alt="LaTransfer Logo" 
            className="h-8 w-auto" 
          />
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/driver/dashboard')}>
                  <Link to="/driver/dashboard">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/driver/assignments')}>
                  <Link to="/driver/assignments">
                    <ListChecks className="h-5 w-5" />
                    <span>Atribuições</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/driver/trips')}>
                  <Link to="/driver/trips">
                    <Map className="h-5 w-5" />
                    <span>Minhas Viagens</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/driver/schedule')}>
                  <Link to="/driver/schedule">
                    <Calendar className="h-5 w-5" />
                    <span>Agenda</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/driver/navigation')}>
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
                <SidebarMenuButton asChild isActive={isActive('/driver/profile')}>
                  <Link to="/driver/profile">
                    <User className="h-5 w-5" />
                    <span>Perfil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/driver/settings')}>
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
