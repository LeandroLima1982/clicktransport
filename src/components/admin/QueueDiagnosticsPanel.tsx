
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  RotateCcw, 
  Wrench,
  RefreshCw,
  ArrowUpDown
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueueDiagnostics } from '@/hooks/useQueueDiagnostics';
import { autoFixQueueIssues } from '@/services/booking/queueService';

const QueueDiagnosticsPanel = () => {
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  
  const {
    queueDiagnostics,
    isLoadingDiagnostics,
    queueHealth,
    isLoadingHealth,
    getQueueHealthScore,
    fixQueuePositions,
    isFixingPositions,
    resetQueue,
    isResettingQueue,
    refreshDiagnostics
  } = useQueueDiagnostics();

  const healthScore = getQueueHealthScore();

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  const handleAutoFix = async () => {
    if (isAutoFixing) return;
    
    setIsAutoFixing(true);
    try {
      const { success, actions } = await autoFixQueueIssues();
      
      if (success && actions.length > 0) {
        toast.success(`Correções automáticas realizadas: ${actions.join(', ')}`);
      }
      
      refreshDiagnostics();
    } catch (error) {
      console.error('Error during auto-fix:', error);
      toast.error('Erro ao realizar correções automáticas');
    } finally {
      setIsAutoFixing(false);
    }
  };

  if (isLoadingDiagnostics || isLoadingHealth) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Analisando sistema de filas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!healthScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico do Sistema de Filas</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro ao analisar sistema</AlertTitle>
            <AlertDescription>
              Não foi possível analisar o sistema de filas.
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 ml-auto" 
                onClick={refreshDiagnostics}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-md font-medium">
            Diagnóstico do Sistema de Filas
          </CardTitle>
          <CardDescription>
            Análise completa do sistema de rotação de empresas
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refreshDiagnostics}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="bookings">Reservas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">
                    Saúde geral do sistema
                  </span>
                  <span className="text-sm font-medium">
                    {queueHealth?.overall_health_score 
                      ? Math.round(queueHealth.overall_health_score) 
                      : Math.round(healthScore.score)}%
                  </span>
                </div>
                <Progress 
                  value={queueHealth?.overall_health_score || healthScore.score} 
                  className={getHealthColor(queueHealth?.overall_health_score || healthScore.score)} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-md p-3">
                  <h3 className="text-sm font-medium mb-2">Empresas</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ativas:</span>
                      <span className="font-medium">{healthScore.activeCompanies}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Posições inválidas:</span>
                      <span className={`font-medium ${healthScore.invalidPositions > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {healthScore.invalidPositions}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Posições duplicadas:</span>
                      <span className={`font-medium ${healthScore.duplicatePositions > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {healthScore.duplicatePositions}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3">
                  <h3 className="text-sm font-medium mb-2">Reservas</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Não processadas:</span>
                      <span className={`font-medium ${queueHealth?.unprocessed_bookings > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                        {queueHealth?.unprocessed_bookings || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa de processamento:</span>
                      <span className="font-medium">
                        {queueHealth?.booking_processing_score 
                          ? `${Math.round(queueHealth.booking_processing_score)}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-3">
                  <h3 className="text-sm font-medium mb-2">Ordens de Serviço</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sem referência:</span>
                      <span className={`font-medium ${queueHealth?.unlinked_orders > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                        {queueHealth?.unlinked_orders || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {healthScore.needsAttention ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Atenção necessária</AlertTitle>
                  <AlertDescription>
                    O sistema de filas precisa de manutenção. Recomendamos utilizar a função de correção automática.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Sistema saudável</AlertTitle>
                  <AlertDescription className="text-green-600">
                    O sistema de filas está operando normalmente.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="secondary"
                  onClick={handleAutoFix}
                  disabled={isAutoFixing || isFixingPositions || isResettingQueue}
                  className="flex-1"
                >
                  {isAutoFixing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Corrigindo...
                    </>
                  ) : (
                    <>
                      <Wrench className="mr-2 h-4 w-4" />
                      Correção Automática
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={fixQueuePositions}
                  disabled={isFixingPositions || isResettingQueue || isAutoFixing}
                >
                  {isFixingPositions ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Corrigindo...
                    </>
                  ) : (
                    <>
                      <Wrench className="mr-2 h-4 w-4" />
                      Corrigir posições
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={resetQueue}
                  disabled={isFixingPositions || isResettingQueue || isAutoFixing}
                >
                  {isResettingQueue ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reiniciando...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reiniciar fila
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="companies">
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end">
                        <span className="mr-1">Posição</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Última Atribuição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queueDiagnostics?.companies ? (
                    queueDiagnostics.companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell className="text-right">
                          {company.hasValidPosition ? (
                            <Badge variant="outline" className="ml-auto">
                              {company.queue_position}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="ml-auto">
                              Inválida
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={company.status === 'active' ? 'default' : 'secondary'}
                          >
                            {company.status === 'active' ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {company.lastAssignedFormatted}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhuma empresa encontrada
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="bookings">
          <CardContent>
            <div className="space-y-4">
              <Alert variant={queueHealth?.unprocessed_bookings > 0 ? "warning" : "default"}>
                {queueHealth?.unprocessed_bookings > 0 ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {queueHealth?.unprocessed_bookings > 0 
                    ? `${queueHealth.unprocessed_bookings} reservas não processadas` 
                    : 'Todas as reservas processadas'}
                </AlertTitle>
                <AlertDescription>
                  {queueHealth?.unprocessed_bookings > 0 
                    ? 'Existem reservas que ainda não foram atribuídas a empresas.' 
                    : 'Todas as reservas recentes foram processadas corretamente.'}
                </AlertDescription>
              </Alert>
              
              <Alert variant={queueHealth?.unlinked_orders > 0 ? "warning" : "default"}>
                {queueHealth?.unlinked_orders > 0 ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {queueHealth?.unlinked_orders > 0 
                    ? `${queueHealth.unlinked_orders} ordens sem referência` 
                    : 'Todas as ordens com referência'}
                </AlertTitle>
                <AlertDescription>
                  {queueHealth?.unlinked_orders > 0 
                    ? 'Existem ordens de serviço que não estão vinculadas a nenhuma reserva.' 
                    : 'Todas as ordens de serviço estão corretamente vinculadas às reservas.'}
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshDiagnostics()}
                  disabled={isLoadingDiagnostics || isLoadingHealth}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Diagnóstico
                </Button>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="border-t pt-4">
        <div className="text-xs text-muted-foreground w-full">
          {!isLoadingHealth && healthScore.score === 100 ? (
            <div className="flex items-center text-green-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              Sistema de filas operando normalmente
            </div>
          ) : (
            'O sistema de diagnóstico ajuda a identificar e corrigir problemas no sistema de atribuição de reservas.'
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default QueueDiagnosticsPanel;
