
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCompanyQueue } from "@/hooks/useCompanyQueue";
import { Loader2, AlertTriangle, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
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

  const hasInvalidPositions = queueStatus.some(company => 
    company.queue_position === null || company.queue_position === 0
  );

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
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Fila Atual</h3>
                <div className="space-y-2">
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
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Ações</h3>
                <div className="space-y-3">
                  <div>
                    <Button 
                      onClick={fixQueuePositions} 
                      variant="outline" 
                      disabled={isFixingPositions}
                      className="w-full"
                    >
                      {isFixingPositions ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Executando diagnóstico...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Ver Diagnóstico Completo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Verifica problemas e estatísticas detalhadas da fila.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {diagnostics && (
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Diagnóstico Detalhado</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Estatísticas da Fila</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      <li>Empresas ativas: {diagnostics.queue_status?.active_companies || 0}</li>
                      <li>Total de empresas: {diagnostics.queue_status?.total_companies || 0}</li>
                      <li>Empresas com posição 0: {diagnostics.queue_status?.zero_queue_position_count || 0}</li>
                      <li>Empresas sem posição: {diagnostics.queue_status?.null_queue_position_count || 0}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Ordens de Serviço Recentes</h4>
                    <ul className="text-sm space-y-1 mt-2">
                      {diagnostics.recentOrders?.slice(0, 3).map((order: any) => (
                        <li key={order.id}>
                          ID: {order.id.substring(0, 8)}... 
                          <Badge className="ml-1">{order.status}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QueueDiagnostics;
