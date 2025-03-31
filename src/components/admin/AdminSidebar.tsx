
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarSection, SidebarTrigger } from "@/components/ui/sidebar";
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
      
      <SidebarSection title="Gerenciamento">
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("companies") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=companies">
            <Building className="mr-2 h-4 w-4" />
            Empresas
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("drivers") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=drivers">
            <Users className="mr-2 h-4 w-4" />
            Motoristas
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("orders") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=orders">
            <FileText className="mr-2 h-4 w-4" />
            Ordens de Serviço
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("bookings") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=bookings">
            <ArrowRight className="mr-2 h-4 w-4" />
            Reservas
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("vehicles") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=vehicles">
            <Car className="mr-2 h-4 w-4" />
            Veículos
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("users") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=users">
            <Users className="mr-2 h-4 w-4" />
            Usuários
          </Link>
        </Button>
      </SidebarSection>
      
      <SidebarSection title="Configurações">
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("destinations") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=destinations">
            <MapPin className="mr-2 h-4 w-4" />
            Destinos
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("rates") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=rates">
            <PenSquare className="mr-2 h-4 w-4" />
            Tarifas
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("vehicle-categories") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=vehicle-categories">
            <Truck className="mr-2 h-4 w-4" />
            Categorias de Veículos
          </Link>
        </Button>
      </SidebarSection>
      
      <SidebarSection title="Sistema">
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("appearance") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=appearance">
            <Palette className="mr-2 h-4 w-4" />
            Aparência
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("notifications") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notificações
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("content") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=content">
            <PenSquare className="mr-2 h-4 w-4" />
            Conteúdo
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("docs") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=docs">
            <BookOpen className="mr-2 h-4 w-4" />
            Documentação
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn("w-full justify-start mb-1", isActive("settings") ? "bg-muted" : "")}
          asChild
        >
          <Link to="/admin?tab=settings">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Link>
        </Button>
      </SidebarSection>
      
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
