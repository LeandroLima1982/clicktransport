
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminTabs } from './AdminTabItems';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Settings, LogOut, Database, TestTube, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AuthError } from '@supabase/supabase-js';

interface AdminSidebarProps {
  signOut: () => Promise<{ error: AuthError | Error | null }>;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ signOut }) => {
  const location = useLocation();
  const { userRole } = useAuth();
  
  const isActive = (path: string) => {
    // For root admin path
    if (path === '/admin') {
      const queryParams = new URLSearchParams(location.search);
      const currentTab = queryParams.get('tab');
      return location.pathname === '/admin' && (!currentTab || currentTab === 'overview');
    }
    
    // For tab routes
    if (path.includes('?tab=')) {
      const queryParams = new URLSearchParams(location.search);
      const currentTab = queryParams.get('tab');
      const tabInPath = path.split('?tab=')[1];
      return location.pathname === '/admin' && currentTab === tabInPath;
    }
    
    // For other routes without query params
    return location.pathname === path || 
      (path !== '/admin' && location.pathname.startsWith(path));
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast.error('Erro ao sair');
        return;
      }
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro ao sair');
    }
  };

  const filteredTabs = adminTabs.filter(tab => 
    !tab.roles || tab.roles.includes(userRole || '')
  );

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/286d67a1-0db4-4257-82de-d5c01b35452e.png" 
            alt="LaTransfer Logo" 
            className="h-10 w-auto mr-2" 
          />
          <div className="font-semibold text-lg">Admin Panel</div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredTabs.map((tab) => (
                <SidebarMenuItem key={tab.id}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(tab.href)}
                    tooltip={tab.label}
                  >
                    <Link to={tab.href} onClick={(e) => {
                      // For normal links, allow normal navigation
                      // This prevents issues with the tab state getting out of sync
                    }}>
                      {tab.icon}
                      <span>{tab.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Configuração do Banco" isActive={location.pathname === '/admin/database-setup'}>
                  <Link to="/admin/database-setup">
                    <Database className="h-5 w-5" />
                    <span>Banco de Dados</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Ambiente de Testes" isActive={location.pathname === '/admin/test-workflow'}>
                  <Link to="/admin/test-workflow">
                    <TestTube className="h-5 w-5" />
                    <span>Testes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Documentação" isActive={isActive('/admin?tab=docs')}>
                  <Link to="/admin?tab=docs">
                    <HelpCircle className="h-5 w-5" />
                    <span>Documentação</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Configurações" isActive={isActive('/admin?tab=settings')}>
                  <Link to="/admin?tab=settings">
                    <Settings className="h-5 w-5" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Sair">
                  <LogOut className="h-5 w-5" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
