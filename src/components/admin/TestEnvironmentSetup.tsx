
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, RefreshCw, CheckCircle2, Building2, Car, User } from 'lucide-react';
import { setupTestEnvironment } from '@/services/db/setupTestEnvironment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TestEnvironmentSetup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    details?: {
      companies?: any[];
      drivers?: any[];
      vehicles?: any[];
    };
  } | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  const handleSetupTestEnvironment = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      const { success, error, companies, drivers, vehicles } = await setupTestEnvironment();
      
      if (success) {
        setResult({
          success: true,
          message: 'Ambiente de teste configurado com sucesso!',
          details: {
            companies,
            drivers,
            vehicles
          }
        });
      } else {
        setResult({
          success: false,
          message: `Erro ao configurar ambiente de teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        });
      }
    } catch (error) {
      console.error('Error setting up test environment:', error);
      setResult({
        success: false,
        message: `Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <RefreshCw className="mr-2 h-5 w-5" />
          Configuração de Ambiente de Teste
        </CardTitle>
        <CardDescription>
          Configure um ambiente de teste com empresas, motoristas e veículos para testar o fluxo completo de trabalho
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Esta ação irá limpar todos os dados existentes (bookings, ordens de serviço, empresas, motoristas e veículos) 
            e configurar um novo ambiente de teste. Use apenas em ambiente de desenvolvimento!
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <p>O ambiente de teste incluirá:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>2 empresas de transporte com posições de fila válidas (1 e 2)</li>
            <li>2 motoristas para cada empresa</li>
            <li>2 veículos para cada empresa</li>
          </ul>
          
          <Button 
            onClick={handleSetupTestEnvironment} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Configurando ambiente de teste...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Configurar Ambiente de Teste
              </>
            )}
          </Button>
          
          {result && (
            <div className="mt-4">
              <div className={`p-4 rounded-md mb-4 ${result.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {result.success ? (
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    <p>{result.message}</p>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <p>{result.message}</p>
                  </div>
                )}
              </div>
              
              {result.success && result.details && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="companies" className="flex items-center">
                      <Building2 className="mr-1 h-4 w-4" />
                      Empresas
                    </TabsTrigger>
                    <TabsTrigger value="drivers" className="flex items-center">
                      <User className="mr-1 h-4 w-4" />
                      Motoristas
                    </TabsTrigger>
                    <TabsTrigger value="vehicles" className="flex items-center">
                      <Car className="mr-1 h-4 w-4" />
                      Veículos
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-secondary/20 p-4 rounded-md flex flex-col items-center justify-center">
                        <Building2 className="h-8 w-8 mb-2 text-primary" />
                        <p className="text-lg font-bold">{result.details.companies?.length || 0}</p>
                        <p className="text-muted-foreground">Empresas</p>
                      </div>
                      <div className="bg-secondary/20 p-4 rounded-md flex flex-col items-center justify-center">
                        <User className="h-8 w-8 mb-2 text-primary" />
                        <p className="text-lg font-bold">{result.details.drivers?.length || 0}</p>
                        <p className="text-muted-foreground">Motoristas</p>
                      </div>
                      <div className="bg-secondary/20 p-4 rounded-md flex flex-col items-center justify-center">
                        <Car className="h-8 w-8 mb-2 text-primary" />
                        <p className="text-lg font-bold">{result.details.vehicles?.length || 0}</p>
                        <p className="text-muted-foreground">Veículos</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="companies" className="mt-4">
                    <div className="space-y-3">
                      {result.details.companies?.map((company) => (
                        <div key={company.id} className="bg-secondary/20 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{company.name}</p>
                              <p className="text-sm text-muted-foreground">ID: {company.id.substring(0, 8)}...</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">Posição na fila: <span className="font-medium">{company.queue_position}</span></p>
                              <p className="text-sm text-muted-foreground">Status: {company.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="drivers" className="mt-4">
                    <div className="space-y-3">
                      {result.details.drivers?.map((driver) => (
                        <div key={driver.id} className="bg-secondary/20 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{driver.name}</p>
                              <p className="text-sm text-muted-foreground">ID: {driver.id.substring(0, 8)}...</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">Empresa: <span className="font-medium">{
                                result.details.companies?.find(c => c.id === driver.company_id)?.name || 'N/A'
                              }</span></p>
                              <p className="text-sm text-muted-foreground">Status: {driver.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="vehicles" className="mt-4">
                    <div className="space-y-3">
                      {result.details.vehicles?.map((vehicle) => (
                        <div key={vehicle.id} className="bg-secondary/20 p-3 rounded-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{vehicle.model}</p>
                              <p className="text-sm text-muted-foreground">Placa: {vehicle.license_plate}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">Empresa: <span className="font-medium">{
                                result.details.companies?.find(c => c.id === vehicle.company_id)?.name || 'N/A'
                              }</span></p>
                              <p className="text-sm text-muted-foreground">Status: {vehicle.status}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestEnvironmentSetup;
