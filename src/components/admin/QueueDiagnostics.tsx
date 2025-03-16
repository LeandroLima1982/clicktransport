
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from "@/components/ui/tabs";
import { 
  AlertTriangle, AlertCircle, CheckCircle, RefreshCw, 
  Shield, ActivitySquare, ClipboardList, HistoryIcon 
} from 'lucide-react';
import { useCompanyQueue } from "@/hooks/useCompanyQueue";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const QueueDiagnostics: React.FC = () => {
  const { 
    queueStatus, 
    isLoading, 
    resetQueue, 
    resetting, 
    fixQueuePositions, 
    isFixingPositions,
    diagnostics,
    diagnosticsLoading,
    isDiagnosing,
    runDiagnostics
  } = useCompanyQueue();

  const [activeTab, setActiveTab] = useState("status");

  const hasInvalidPositions = queueStatus.some(company => 
    company.queue_position === null || company.queue_position === 0
  );

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      case 'warning':
        return <Badge variant="outline">Alerta</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'critical':
        return <Badge variant="destructive" className="animate-pulse">Crítico</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <AlertCircle className="mr-2 h-5 w-5" />
          Diagnóstico da Fila de Empresas
        </CardTitle>
        <CardDescription>
          Gerencie a fila de atribuição de empresas para novas reservas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {hasInvalidPositions && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Posições Inválidas Detectadas</AlertTitle>
                <AlertDescription>
                  Algumas empresas possuem posições de fila nulas ou iguais a 0, o que pode causar problemas na atribuição de ordens.
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList>
                <TabsTrigger value="status" className="flex items-center">
                  <ActivitySquare className="h-4 w-4 mr-1" />
                  Status Atual
                </TabsTrigger>
                <TabsTrigger value="actions" className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Ações
                </TabsTrigger>
                {diagnostics && (
                  <TabsTrigger value="diagnostics" className="flex items-center">
                    <ClipboardList className="h-4 w-4 mr-1" />
                    Relatório
                  </TabsTrigger>
                )}
                {diagnostics?.recentLogs && (
                  <TabsTrigger value="logs" className="flex items-center">
                    <HistoryIcon className="h-4 w-4 mr-1" />
                    Logs
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="status" className="mt-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium mb-2">Fila Atual</h3>
                  {queueStatus.map((company) => (
                    <div key={company.id} className="flex items-center justify-between bg-secondary/20 p-3 rounded-md">
                      <div>
                        <span className="font-medium">{company.name}</span>
                        <Badge variant={company.status === 'active' ? 'secondary' : 'outline'} className="ml-2">
                          {company.status === 'active' ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        <Badge 
                          variant={company.queue_position === null || company.queue_position === 0 ? 'destructive' : 'outline'}
                          className="mr-2"
                        >
                          Posição: {company.queue_position || 'Inválida'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {company.last_order_assigned 
                            ? `Última ordem: ${format(new Date(company.last_order_assigned), 'dd/MM HH:mm', { locale: ptBR })}` 
                            : 'Nenhuma ordem atribuída'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="mt-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium mb-2">Ações de Manutenção</h3>
                  <div>
                    <Button 
                      onClick={fixQueuePositions} 
                      variant="outline" 
                      disabled={isFixingPositions}
                      className="w-full"
                    >
                      {isFixingPositions ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Corrigindo Posições...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Corrigir Posições Inválidas
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Atribui posições de fila válidas para empresas com posições nulas ou 0.
                    </p>
                  </div>
                  
                  <div>
                    <Button 
                      onClick={resetQueue} 
                      variant="outline" 
                      disabled={resetting}
                      className="w-full"
                    >
                      {resetting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Resetando Fila...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resetar Fila Completamente
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Redefine todas as posições de fila, recomeçando a partir de 1.
                    </p>
                  </div>
                  
                  <div>
                    <Button 
                      onClick={runDiagnostics} 
                      variant="outline" 
                      disabled={isDiagnosing}
                      className="w-full"
                    >
                      {isDiagnosing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Executando diagnóstico...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Executar Diagnóstico Completo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Verifica problemas e estatísticas detalhadas da fila.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              {diagnostics && (
                <TabsContent value="diagnostics" className="mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Diagnóstico Detalhado</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-secondary/10 p-4 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Estatísticas da Fila</h4>
                        <ul className="text-sm space-y-1">
                          <li className="flex justify-between"><span>Empresas ativas:</span> <span className="font-medium">{diagnostics.queue_status?.active_companies || 0}</span></li>
                          <li className="flex justify-between"><span>Total de empresas:</span> <span className="font-medium">{diagnostics.queue_status?.total_companies || 0}</span></li>
                          <li className="flex justify-between"><span>Empresas com posição 0:</span> <span className="font-medium">{diagnostics.queue_status?.zero_queue_position_count || 0}</span></li>
                          <li className="flex justify-between"><span>Empresas sem posição:</span> <span className="font-medium">{diagnostics.queue_status?.null_queue_position_count || 0}</span></li>
                        </ul>
                      </div>
                      
                      <div className="bg-secondary/10 p-4 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Ordens de Serviço Recentes</h4>
                        {diagnostics.recentOrders?.length ? (
                          <ul className="text-sm space-y-2">
                            {diagnostics.recentOrders?.slice(0, 3).map((order: any) => (
                              <li key={order.id} className="flex justify-between items-center">
                                <span>ID: {order.id.substring(0, 8)}...</span>
                                <Badge variant={order.status === 'pending' ? 'outline' : 
                                             order.status === 'completed' ? 'secondary' : 
                                             'default'}>
                                  {order.status}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground">Nenhuma ordem recente encontrada</p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
              
              {diagnostics?.recentLogs && (
                <TabsContent value="logs" className="mt-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Logs do Sistema (Fila)</h3>
                    {diagnostics.recentLogs?.length ? (
                      <div className="space-y-2">
                        {diagnostics.recentLogs.map((log: any) => (
                          <div key={log.id} className="bg-secondary/10 p-3 rounded-md">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center">
                                {getSeverityBadge(log.severity)}
                                <span className="ml-2 font-medium">{log.message}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.created_at), 'dd/MM HH:mm:ss', { locale: ptBR })}
                              </span>
                            </div>
                            {log.details && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                {Object.entries(log.details).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Nenhum log encontrado</p>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QueueDiagnostics;
