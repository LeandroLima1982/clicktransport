
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw, 
  AlertTriangle, 
  BarChart, 
  Wrench, 
  Building,
  UserCheck,
  Car,
  CalendarCheck,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { useQueueDiagnostics } from '@/hooks/useQueueDiagnostics';
import { Alert, AlertDescription } from '@/components/ui/alert';

const HomePage = () => {
  const { 
    getQueueHealthScore, 
    queueHealth, 
    isLoadingHealth, 
    healthError,
    refreshDiagnostics 
  } = useQueueDiagnostics();
  const healthScore = getQueueHealthScore();
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDiagnostics();
    setRefreshing(false);
  };
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      <PageHeader
        title="Sistema de Gerenciamento"
        description="Painel administrativo para gerenciar reservas, empresas e motoristas"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="col-span-full md:col-span-1">
          <CardHeader className="bg-muted/50 flex flex-row justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-primary" />
                Saúde do Sistema
              </CardTitle>
              <CardDescription>
                Estado atual do sistema de filas
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing || isLoadingHealth}
            >
              {refreshing || isLoadingHealth ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoadingHealth ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 mr-2 animate-spin text-primary" />
                <p>Carregando dados...</p>
              </div>
            ) : healthError ? (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Erro ao verificar saúde do sistema. Tente novamente.
                </AlertDescription>
              </Alert>
            ) : healthScore ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Saúde do Sistema:</span>
                  <span 
                    className={`text-lg font-bold ${
                      healthScore.score >= 90 ? 'text-green-500' : 
                      healthScore.score >= 70 ? 'text-amber-500' : 
                      'text-red-500'
                    }`}
                  >
                    {Math.round(healthScore.score)}%
                  </span>
                </div>
                
                <div className="rounded-md bg-muted p-3">
                  {healthScore.needsAttention ? (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Atenção necessária</p>
                        <p className="text-sm text-muted-foreground">
                          Detectados problemas no sistema de filas que precisam de correção.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2">
                      <RotateCcw className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Sistema funcionando</p>
                        <p className="text-sm text-muted-foreground">
                          O sistema de atribuição de reservas está operando normalmente.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                Informações de saúde não disponíveis
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button asChild className="w-full">
              <Link to="/admin/queue">
                <Wrench className="h-4 w-4 mr-2" />
                Gerenciar Sistema de Filas
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2 text-blue-500" />
              Empresas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              {isLoadingHealth ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                <>
                  <span className="text-3xl font-bold">
                    {queueHealth?.active_companies || 0}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Empresas ativas no sistema
                  </p>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link to="/admin/companies">
                Gerenciar Empresas
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-green-500" />
              Motoristas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              {isLoadingHealth ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                <>
                  <span className="text-3xl font-bold">
                    {queueHealth?.driver_count || 0}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Motoristas cadastrados
                  </p>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link to="/admin/drivers">
                Gerenciar Motoristas
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="bg-amber-50">
            <CardTitle className="flex items-center">
              <Car className="h-5 w-5 mr-2 text-amber-500" />
              Veículos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              {isLoadingHealth ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                <>
                  <span className="text-3xl font-bold">
                    {queueHealth?.vehicle_count || 0}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Veículos cadastrados
                  </p>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link to="/admin/vehicles">
                Gerenciar Veículos
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center">
              <CalendarCheck className="h-5 w-5 mr-2 text-purple-500" />
              Reservas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center">
              {isLoadingHealth ? (
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              ) : (
                <>
                  <span className="text-3xl font-bold">
                    {queueHealth?.booking_count || 0}
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reservas realizadas
                  </p>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" asChild className="w-full">
              <Link to="/admin/bookings">
                Gerenciar Reservas
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
