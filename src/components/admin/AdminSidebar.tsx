
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  Building, 
  FileText, 
  Settings, 
  BookOpen, 
  Palette, 
  Truck, 
  MapPin, 
  Bell, 
  Users, 
  Map, 
  PenSquare, 
  LogOut,
  ArrowRight,
  Car
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  signOut: () => Promise<{ error: Error | null }>;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ signOut }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeTab = queryParams.get('tab') || 'overview';
  
  const isActive = (tab: string) => activeTab === tab;
  
  return (
    <Sidebar className="border-r bg-background">
      <div className="flex h-10 items-center px-4 lg:h-12 lg:px-6 text-lg font-semibold">
        Administração
        <SidebarTrigger className="ml-auto" />
      </div>
      
      <div className="px-2 py-2">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start mb-1",
            !activeTab || activeTab === "overview" ? "bg-muted" : ""
          )}
          asChild
        >
          <Link to="/admin">
            <BarChart3 className="mr-2 h-4 w-4" />
            Visão Geral
          </Link>
        </Button>
      </div>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gerenciamento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("companies") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=companies">
                    <Building className="mr-2 h-4 w-4" />
                    <span>Empresas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("drivers") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=drivers">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Motoristas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("orders") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=orders">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Ordens de Serviço</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("bookings") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=bookings">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    <span>Reservas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("vehicles") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=vehicles">
                    <Car className="mr-2 h-4 w-4" />
                    <span>Veículos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("users") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=users">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Configurações</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("destinations") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=destinations">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>Destinos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("rates") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=rates">
                    <PenSquare className="mr-2 h-4 w-4" />
                    <span>Tarifas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("vehicle-categories") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=vehicle-categories">
                    <Truck className="mr-2 h-4 w-4" />
                    <span>Categorias de Veículos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("appearance") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=appearance">
                    <Palette className="mr-2 h-4 w-4" />
                    <span>Aparência</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("notifications") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notificações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("content") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=content">
                    <PenSquare className="mr-2 h-4 w-4" />
                    <span>Conteúdo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("docs") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=docs">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Documentação</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  className={cn(isActive("settings") ? "bg-muted" : "")} 
                  asChild
                >
                  <Link to="/admin?tab=settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <div className="mt-auto px-2 py-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </Sidebar>
  );
};

export default AdminSidebar;
