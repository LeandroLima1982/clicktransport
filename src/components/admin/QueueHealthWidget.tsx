
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertTriangle, CheckCircle, RotateCcw, Wrench } from 'lucide-react';
import { useQueueDiagnostics } from '@/hooks/useQueueDiagnostics';

const QueueHealthWidget = () => {
  const {
    queueHealth,
    isLoadingHealth,
    getQueueHealthScore,
    fixQueuePositions,
    isFixingPositions,
    resetQueue,
    isResettingQueue,
    refreshDiagnostics,
  } = useQueueDiagnostics();

  const healthScore = getQueueHealthScore();

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (isLoadingHealth) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Verificando integridade da fila
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!healthScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integridade da fila</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro ao verificar integridade</AlertTitle>
            <AlertDescription>
              Não foi possível verificar a integridade da fila de empresas.
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
        <CardTitle className="text-md font-medium">
          Integridade da fila de empresas
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refreshDiagnostics}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">
                Score de integridade
              </span>
              <span className="text-sm font-medium">
                {Math.round(healthScore.score)}%
              </span>
            </div>
            <Progress 
              value={healthScore.score} 
              className={getHealthColor(healthScore.score)} 
            />
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Empresas ativas:</span>
              <span className="font-medium">{healthScore.activeCompanies}</span>
            </div>
            <div className="flex justify-between">
              <span>Posições inválidas:</span>
              <span className={`font-medium ${healthScore.invalidPositions > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {healthScore.invalidPositions}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Posições duplicadas:</span>
              <span className={`font-medium ${healthScore.duplicatePositions > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {healthScore.duplicatePositions}
              </span>
            </div>
          </div>
          
          {healthScore.needsAttention ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Atenção necessária</AlertTitle>
              <AlertDescription>
                A fila de empresas precisa de manutenção.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Sistema saudável</AlertTitle>
              <AlertDescription className="text-green-600">
                A fila de empresas está operando normalmente.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fixQueuePositions}
              disabled={isFixingPositions || isResettingQueue}
              className="flex-1"
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
              size="sm"
              variant="outline"
              onClick={resetQueue}
              disabled={isFixingPositions || isResettingQueue}
              className="flex-1"
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
    </Card>
  );
};

export default QueueHealthWidget;
