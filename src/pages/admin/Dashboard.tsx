
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompanyManagement from '@/components/admin/CompanyManagement';
import ServiceOrderMonitoring from '@/components/admin/ServiceOrderMonitoring';
import PerformanceReports from '@/components/admin/PerformanceReports';
import { FileText, Settings, UserCheck, ChartBar } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (!user || userRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
        <Button asChild className="mt-4">
          <Link to="/">Retornar à Página Inicial</Link>
        </Button>
      </div>
    );
  }

  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Painel de Administração</h1>
            <p className="text-muted-foreground">Gerencie todos os aspectos da plataforma em um único lugar</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/database-setup">
                <Settings className="mr-2 h-4 w-4" />
                Configuração do Banco
              </Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UserCheck className="h-4 w-4 mr-2" />
              Empresas
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4 mr-2" />
              Ordens de Serviço
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ChartBar className="h-4 w-4 mr-2" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Empresas</CardTitle>
                  <CardDescription>Gerenciar empresas de transporte</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">55</p>
                  <p className="text-sm text-muted-foreground">Total de empresas registradas</p>
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => setActiveTab("companies")}
                  >
                    Ver Empresas
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Motoristas</CardTitle>
                  <CardDescription>Gerenciar motoristas registrados</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">128</p>
                  <p className="text-sm text-muted-foreground">Total de motoristas registrados</p>
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => setActiveTab("orders")}
                  >
                    Ver Motoristas
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ordens de Serviço</CardTitle>
                  <CardDescription>Acompanhar ordens de transporte</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">342</p>
                  <p className="text-sm text-muted-foreground">Total de ordens de serviço</p>
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => setActiveTab("orders")}
                  >
                    Ver Ordens
                  </Button>
                </CardContent>
              </Card>
            </div>

            <PerformanceReports />
          </TabsContent>

          <TabsContent value="companies">
            <CompanyManagement />
          </TabsContent>

          <TabsContent value="orders">
            <ServiceOrderMonitoring />
          </TabsContent>

          <TabsContent value="reports">
            <PerformanceReports />
          </TabsContent>
        </Tabs>
      </div>
    </TransitionEffect>
  );
};

export default AdminDashboard;
