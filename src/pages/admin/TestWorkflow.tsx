
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, RefreshCw, Loader2, AlertTriangle, 
  RotateCw, ClipboardList, Database, Car
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import TestEnvironmentSetup from '@/components/admin/TestEnvironmentSetup';
import TransitionEffect from '@/components/TransitionEffect';
import { generateSampleBookingAndOrder, createManualServiceOrder } from '@/services/db/generateTestOrders';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from "@/components/ui/badge";

const TestWorkflow: React.FC = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [isProcessing, setIsProcessing] = useState(false);
  const [serviceOrderInfo, setServiceOrderInfo] = useState<any>(null);
  
  // Generate a test booking and service order
  const handleGenerateBookingAndOrder = async () => {
    setIsProcessing(true);
    try {
      const result = await generateSampleBookingAndOrder();
      if (result.success && result.serviceOrder) {
        setServiceOrderInfo(result.serviceOrder);
        toast.success('Fluxo iniciado com sucesso', {
          description: 'Uma reserva e ordem de serviço foram criadas'
        });
      }
    } catch (error) {
      console.error('Error generating workflow:', error);
      toast.error('Erro ao gerar fluxo de teste');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Create a manual service order
  const handleCreateManualOrder = async () => {
    setIsProcessing(true);
    try {
      const result = await createManualServiceOrder();
      if (result.success && result.serviceOrder) {
        setServiceOrderInfo(result.serviceOrder);
        toast.success('Ordem de serviço manual criada');
      }
    } catch (error) {
      console.error('Error creating manual order:', error);
      toast.error('Erro ao criar ordem manual');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Get the latest service order
  const handleGetLatestOrder = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies (id, name),
          drivers (id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      
      setServiceOrderInfo(data);
      toast.success('Ordem de serviço carregada');
    } catch (error) {
      console.error('Error fetching latest order:', error);
      toast.error('Erro ao carregar última ordem');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Utility function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'assigned': return <Badge className="bg-blue-100 text-blue-800">Atribuído</Badge>;
      case 'in_progress': return <Badge className="bg-purple-100 text-purple-800">Em Progresso</Badge>;
      case 'completed': return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Teste de Fluxo de Trabalho</h1>
        <p className="text-muted-foreground mb-8">
          Esta página permite testar todo o fluxo de trabalho do sistema, desde a criação dos dados de teste até a execução do processo completo.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="setup" className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              Configurar Ambiente
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center">
              <RotateCw className="mr-2 h-4 w-4" />
              Iniciar Fluxo
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center">
              <ClipboardList className="mr-2 h-4 w-4" />
              Monitorar Resultado
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup">
            <TestEnvironmentSetup />
          </TabsContent>
          
          <TabsContent value="workflow">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <RotateCw className="mr-2 h-5 w-5" />
                  Iniciar Fluxo de Teste
                </CardTitle>
                <CardDescription>
                  Crie uma reserva de teste e acompanhe todo o processo de atribuição de ordem de serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    Antes de iniciar o fluxo, certifique-se de que você já configurou o ambiente de teste na aba anterior.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-6">
                  <div className="bg-secondary/20 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Opção 1: Simulação Completa (Reserva → Ordem de Serviço)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta opção cria uma reserva e gera automaticamente uma ordem de serviço, simulando o fluxo completo.
                    </p>
                    <Button 
                      onClick={handleGenerateBookingAndOrder}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Gerar Reserva e Ordem de Serviço
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-secondary/20 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Opção 2: Ordem de Serviço Manual</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta opção cria diretamente uma ordem de serviço, sem passar pela criação de reserva.
                    </p>
                    <Button 
                      onClick={handleCreateManualOrder}
                      disabled={isProcessing}
                      variant="outline"
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Criar Ordem de Serviço Manual
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-secondary/20 p-4 rounded-md">
                    <h3 className="text-lg font-medium mb-2">Opção 3: Verificar Última Ordem</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Esta opção carrega a ordem de serviço mais recente para acompanhamento.
                    </p>
                    <Button 
                      onClick={handleGetLatestOrder}
                      disabled={isProcessing}
                      variant="outline"
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Carregar Última Ordem de Serviço
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {serviceOrderInfo && (
                  <div className="w-full mt-4 p-4 bg-green-50 rounded-md">
                    <div className="flex items-center mb-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      <h3 className="font-medium">Ordem de Serviço Criada</h3>
                    </div>
                    <div className="text-sm space-y-2">
                      <p><span className="font-medium">ID:</span> {serviceOrderInfo.id}</p>
                      <p><span className="font-medium">Status:</span> {getStatusBadge(serviceOrderInfo.status)}</p>
                      <p><span className="font-medium">Empresa:</span> {serviceOrderInfo.companies?.name || '-'}</p>
                      <p><span className="font-medium">Origem:</span> {serviceOrderInfo.origin}</p>
                      <p><span className="font-medium">Destino:</span> {serviceOrderInfo.destination}</p>
                    </div>
                    <div className="mt-4">
                      <Button 
                        onClick={() => setActiveTab('monitoring')}
                        size="sm"
                        className="w-full"
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Monitorar Esta Ordem
                      </Button>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="monitoring">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  Monitoramento do Fluxo
                </CardTitle>
                <CardDescription>
                  Acompanhe o progresso das ordens de serviço e monitore o fluxo de trabalho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="mb-6">
                    <Button 
                      onClick={handleGetLatestOrder}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Carregando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Atualizar Status da Ordem
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {serviceOrderInfo ? (
                    <div className="space-y-6">
                      <div className="bg-secondary/20 p-4 rounded-md">
                        <h3 className="text-lg font-medium mb-4">Detalhes da Ordem de Serviço</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm"><span className="font-medium">ID:</span> {serviceOrderInfo.id}</p>
                            <p className="text-sm"><span className="font-medium">Status:</span> {getStatusBadge(serviceOrderInfo.status)}</p>
                            <p className="text-sm"><span className="font-medium">Criada em:</span> {new Date(serviceOrderInfo.created_at).toLocaleString()}</p>
                            <p className="text-sm"><span className="font-medium">Origem:</span> {serviceOrderInfo.origin}</p>
                            <p className="text-sm"><span className="font-medium">Destino:</span> {serviceOrderInfo.destination}</p>
                          </div>
                          <div>
                            <p className="text-sm"><span className="font-medium">Empresa:</span> {serviceOrderInfo.companies?.name || '-'}</p>
                            <p className="text-sm"><span className="font-medium">Motorista:</span> {serviceOrderInfo.drivers?.name || 'Não atribuído'}</p>
                            <p className="text-sm"><span className="font-medium">Data de Coleta:</span> {new Date(serviceOrderInfo.pickup_date).toLocaleString()}</p>
                            <p className="text-sm"><span className="font-medium">Observações:</span> {serviceOrderInfo.notes || '-'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-secondary/20 p-4 rounded-md">
                        <h3 className="text-lg font-medium mb-4">Próximos Passos</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${serviceOrderInfo.status !== 'pending' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                              {serviceOrderInfo.status !== 'pending' ? '✓' : '1'}
                            </div>
                            <p className={serviceOrderInfo.status !== 'pending' ? 'text-green-600 font-medium' : ''}>
                              Ordem criada e atribuída à empresa
                            </p>
                          </div>
                          
                          <div className="flex items-center">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${serviceOrderInfo.status === 'assigned' || serviceOrderInfo.status === 'in_progress' || serviceOrderInfo.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                              {serviceOrderInfo.status === 'assigned' || serviceOrderInfo.status === 'in_progress' || serviceOrderInfo.status === 'completed' ? '✓' : '2'}
                            </div>
                            <p className={serviceOrderInfo.status === 'assigned' || serviceOrderInfo.status === 'in_progress' || serviceOrderInfo.status === 'completed' ? 'text-green-600 font-medium' : ''}>
                              Motorista atribuído pela empresa
                            </p>
                          </div>
                          
                          <div className="flex items-center">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${serviceOrderInfo.status === 'in_progress' || serviceOrderInfo.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                              {serviceOrderInfo.status === 'in_progress' || serviceOrderInfo.status === 'completed' ? '✓' : '3'}
                            </div>
                            <p className={serviceOrderInfo.status === 'in_progress' || serviceOrderInfo.status === 'completed' ? 'text-green-600 font-medium' : ''}>
                              Viagem iniciada pelo motorista
                            </p>
                          </div>
                          
                          <div className="flex items-center">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${serviceOrderInfo.status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                              {serviceOrderInfo.status === 'completed' ? '✓' : '4'}
                            </div>
                            <p className={serviceOrderInfo.status === 'completed' ? 'text-green-600 font-medium' : ''}>
                              Viagem concluída com sucesso
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Alert>
                        <Car className="h-4 w-4" />
                        <AlertTitle>Como testar o fluxo</AlertTitle>
                        <AlertDescription>
                          <p className="mb-2">Para testar o fluxo completo, acesse os seguintes painéis:</p>
                          <ul className="list-disc ml-5 space-y-1 text-sm">
                            <li>Painel da Empresa: Atribua um motorista à ordem de serviço</li>
                            <li>Painel do Motorista: Inicie a viagem e depois marque como concluída</li>
                            <li>Atualize esta página para ver o status atual</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10">
                      <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Nenhuma ordem de serviço selecionada</p>
                      <p className="text-sm text-muted-foreground">Crie uma ordem na aba "Iniciar Fluxo" ou carregue a última ordem criada.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TransitionEffect>
  );
};

export default TestWorkflow;
