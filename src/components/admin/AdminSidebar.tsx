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
  Cog6Tooth,
  Paintbrush2
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Sidebar, SidebarClose, SidebarContent, SidebarFooter, SidebarHeader, SidebarItem, SidebarNav } from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth";
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

  const sidebarItems = [
    {
      title: "Visão Geral",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/admin",
      tab: "overview"
    },
    {
      title: "Empresas",
      icon: <Building2 className="h-5 w-5" />,
      href: "/admin?tab=companies",
      tab: "companies"
    },
    {
      title: "Motoristas",
      icon: <Users className="h-5 w-5" />,
      href: "/admin?tab=drivers",
      tab: "drivers"
    },
    {
      title: "Ordens",
      icon: <ListChecks className="h-5 w-5" />,
      href: "/admin?tab=orders",
      tab: "orders"
    },
    {
      title: "Destinos",
      icon: <MapPin className="h-5 w-5" />,
      href: "/admin?tab=destinations",
      tab: "destinations"
    },
    {
      title: "Métricas",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/admin?tab=metrics",
      tab: "metrics"
    },
    {
      title: "Relatórios",
      icon: <TrendingUp className="h-5 w-5" />,
      href: "/admin?tab=reports",
      tab: "reports"
    },
    {
      title: "Veículos",
      icon: <Truck className="h-5 w-5" />,
      href: "/admin?tab=vehicles",
      tab: "vehicles"
    },
    {
      title: "Notificações",
      icon: <Bell className="h-5 w-5" />,
      href: "/admin?tab=notifications",
      tab: "notifications"
    },
    {
      title: "Configurações",
      icon: <Cog6Tooth className="h-5 w-5" />,
      href: "/admin?tab=settings",
      tab: "settings"
    },
    {
      title: "Aparência",
      icon: <Paintbrush2 className="h-5 w-5" />,
      href: "/admin?tab=appearance",
      tab: "appearance"
    },
    {
      title: "Documentação",
      icon: <FileText className="h-5 w-5" />,
      href: "/admin?tab=docs",
      tab: "docs"
    }
  ];

  return (
    <Sidebar className="bg-gray-50">
      <SidebarHeader>
        <div className="space-y-2">
          <h4 className="font-semibold text-muted-foreground">Lovable Transfers</h4>
          <p className="text-xs text-muted-foreground">
            Painel de Administração
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav>
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.title}
              title={item.title}
              icon={item.icon}
              href={item.href}
              tab={item.tab}
            />
          ))}
        </SidebarNav>
        <Separator className="my-6" />
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>Avançado</AccordionTrigger>
            <AccordionContent>
              <SidebarNav>
                <SidebarItem
                  title="Definições de Preço"
                  icon={<Settings className="h-5 w-5" />}
                  href="/admin?tab=rates"
                  tab="rates"
                />
                <SidebarItem
                  title="Categorias de Veículos"
                  icon={<Truck className="h-5 w-5" />}
                  href="/admin?tab=vehicle-categories"
                  tab="vehicle-categories"
                />
              </SidebarNav>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SidebarContent>
      <SidebarFooter>
        <button
          className="w-full rounded-md border border-transparent bg-red-500 p-3 text-center font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:bg-red-500 data-[state=open]:text-white"
          onClick={handleSignOut}
        >
          Sair
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
