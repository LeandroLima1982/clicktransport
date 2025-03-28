
import React from "react";
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Settings,
  Users,
  FileText,
  Bell,
  TrendingUp,
  Truck,
  Paintbrush2,
  Database,
  TestTube,
  LogOut
} from "lucide-react";

import { Separator } from "@/components/ui/separator"
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";

interface AdminSidebarProps {
  signOut: () => Promise<{ error: AuthError | Error | null }>;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ signOut }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Error signing out:", error);
      toast.error("Erro ao sair");
      return;
    }
    toast.success("Você saiu com sucesso");
    navigate("/");
  };

  return (
    <div className="w-64 min-h-screen border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/4255bded-5013-43c0-a67a-c56a55e34118.png" 
            alt="LaTransfer" 
            className="h-8"
          />
          <div className="ml-2">
            <h3 className="font-semibold text-lg">Admin</h3>
            <p className="text-xs text-muted-foreground">Panel</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="px-3 py-2">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Principal</h3>
          <nav className="space-y-1">
            <a href="/admin" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <LayoutDashboard className="h-4 w-4 mr-3 text-muted-foreground" />
              Dashboard
            </a>
            <a href="/admin?tab=orders" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <ListChecks className="h-4 w-4 mr-3 text-muted-foreground" />
              Reservas
            </a>
            <a href="/admin?tab=users" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <Users className="h-4 w-4 mr-3 text-muted-foreground" />
              Usuários
            </a>
            <a href="/admin?tab=companies" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <Building2 className="h-4 w-4 mr-3 text-muted-foreground" />
              Empresas
            </a>
            <a href="/admin?tab=vehicles" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <Truck className="h-4 w-4 mr-3 text-muted-foreground" />
              Veículos
            </a>
            <a href="/admin?tab=vehicle-categories" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <Truck className="h-4 w-4 mr-3 text-muted-foreground" />
              Categorias de Veículos
            </a>
            <a href="/admin?tab=destinations" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
              Destinos
            </a>
            <a href="/admin?tab=notifications" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <Bell className="h-4 w-4 mr-3 text-muted-foreground" />
              Notificações
            </a>
            <a href="/admin?tab=investors" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <TrendingUp className="h-4 w-4 mr-3 text-muted-foreground" />
              Investidores
            </a>
            <a href="/admin?tab=appearance" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <Paintbrush2 className="h-4 w-4 mr-3 text-muted-foreground" />
              Aparência
            </a>
            <a href="/admin?tab=content" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
              Conteúdo
            </a>
            <a href="/admin?tab=settings" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
              Configurações
            </a>
            <a href="/admin?tab=metrics" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <BarChart3 className="h-4 w-4 mr-3 text-muted-foreground" />
              Métricas
            </a>
          </nav>
        </div>

        <div className="px-3 py-2">
          <h3 className="text-xs font-medium text-muted-foreground mb-2">Sistema</h3>
          <nav className="space-y-1">
            <a href="/admin?tab=database" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <Database className="h-4 w-4 mr-3 text-muted-foreground" />
              Banco de Dados
            </a>
            <a href="/admin?tab=tests" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <TestTube className="h-4 w-4 mr-3 text-muted-foreground" />
              Testes
            </a>
            <a href="/admin?tab=settings" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-100">
              <Settings className="h-4 w-4 mr-3 text-muted-foreground" />
              Configurações
            </a>
          </nav>
        </div>
      </div>

      <div className="p-4 border-t">
        <button
          className="w-full flex items-center px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
