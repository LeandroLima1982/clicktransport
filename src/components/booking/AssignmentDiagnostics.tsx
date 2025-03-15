
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Wrench,
  Play,
  Building
} from 'lucide-react';
import { useQueueDiagnostics } from '@/hooks/useQueueDiagnostics';

const AssignmentDiagnostics = () => {
  const [isTestingFunction, setIsTestingFunction] = useState(false);
  
  // Use the queue diagnostics hook for health and diagnostics
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
  
  // Get unprocessed bookings (pending bookings without service orders)
  const { 
    data: unprocessedBookings, 
    isLoading: isLoadingUnprocessed,
    refetch: refetchUnprocessed
  } = useQuery({
    queryKey: ['unprocessed-bookings'],
    queryFn: async () => {
      // Get bookings that are pending or confirmed but don't have service orders
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, reference_code, origin, destination, created_at, status')
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (bookingsError) throw bookingsError;
      
      const filteredBookings = await Promise.all(bookings.map(async (booking) => {
        // Check if this booking has a service order
        const { data: serviceOrders, error: ordersError } = await supabase
          .from('service_orders')
          .select('id')
          .ilike('notes', `%Reserva #${booking.reference_code}%`)
          .limit(1);
          
        if (ordersError) {
          console.error(`Error checking service order for booking ${booking.reference_code}:`, ordersError);
          return booking;
        }
        
        // If there's no service order, include this booking
        if (!serviceOrders || serviceOrders.length === 0) {
          return booking;
        }
        
        return null;
      }));
      
      // Filter out nulls (bookings that already have service orders)
      return filteredBookings.filter(Boolean);
    }
  });
  
  // Test the get_next_company_in_queue edge function
  const testEdgeFunctionMutation = useMutation({
    mutationFn: async () => {
      setIsTestingFunction(true);
      try {
        const response = await supabase.functions.invoke('get_next_company_in_queue', {
          method: 'POST',
          body: {}
        });
        
        return response;
      } finally {
        setIsTestingFunction(false);
      }
    },
    onSuccess: (data) => {
      if (data.error) {
        toast.error(`Erro na função: ${data.error.message}`);
      } else if (!data.data || !data.data.success) {
        toast.warning('Função executada, mas não retornou uma empresa. Verifique se há empresas ativas na fila.');
      } else {
        toast.success(`Função executada com sucesso! Empresa ID: ${data.data.company_id}`);
      }
    },
    onError: (error) => {
      toast.error(`Erro ao testar função: ${error.message}`);
    }
  });
  
  const testEdgeFunction = () => {
    testEdgeFunctionMutation.mutate();
  };
  
  const refreshAllData = () => {
    refetchUnprocessed();
    refreshDiagnostics();
  };
  
  // Get queue health score
  const healthScore = getQueueHealthScore();
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Atribuições</CardTitle>
          <CardDescription>
            Verificação da integridade do sistema de atribuição de reservas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Queue Health Status */}
          {isLoadingHealth ? (
            <Skeleton className="h-24 w-full" />
          ) : healthScore ? (
            <Alert variant={healthScore.score >= 80 ? "default" : "destructive"}>
              {healthScore.score >= 80 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>
                Sistema de Fila: {healthScore.score >= 80 ? "Saudável" : "Precisa de Atenção"}
              </AlertTitle>
              <AlertDescription>
                <div className="flex justify-between items-center mt-2">
                  <span>Integridade: {Math.round(healthScore.score)}%</span>
                  <span>Empresas ativas: {healthScore.activeCompanies}</span>
                </div>
                {(healthScore.invalidPositions > 0 || healthScore.duplicatePositions > 0) && (
                  <div className="text-sm mt-2 text-red-500">
                    Problemas detectados: 
                    {healthScore.invalidPositions > 0 && ` ${healthScore.invalidPositions} posições inválidas`}
                    {healthScore.invalidPositions > 0 && healthScore.duplicatePositions > 0 && `,`}
                    {healthScore.duplicatePositions > 0 && ` ${healthScore.duplicatePositions} posições duplicadas`}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erro ao Verificar Fila</AlertTitle>
              <AlertDescription>
                Não foi possível verificar a integridade da fila de empresas.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Edge Function Test */}
          <Alert>
            <Play className="h-4 w-4" />
            <AlertTitle>Função Edge</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Teste a função que obtém a próxima empresa na fila</span>
              <Button 
                size="sm" 
                variant="outline"
                onClick={testEdgeFunction}
                disabled={isTestingFunction}
              >
                {isTestingFunction ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : "Testar Função"}
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={fixQueuePositions}
              disabled={isFixingPositions || isResettingQueue}
            >
              {isFixingPositions ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Corrigindo...
                </>
              ) : (
                <>
                  <Wrench className="h-3 w-3 mr-2" />
                  Corrigir Posições
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={resetQueue}
              disabled={isFixingPositions || isResettingQueue}
            >
              {isResettingQueue ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                  Reiniciando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Reiniciar Fila
                </>
              )}
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshAllData}
            disabled={isLoadingUnprocessed || isLoadingHealth}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingUnprocessed || isLoadingHealth ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardFooter>
      </Card>
      
      {/* Unprocessed Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas Não Processadas</CardTitle>
          <CardDescription>
            Reservas que ainda não foram atribuídas a uma empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUnprocessed ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !unprocessedBookings || unprocessedBookings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Não há reservas pendentes para processamento.
            </div>
          ) : (
            <div className="space-y-2">
              {unprocessedBookings.map((booking) => (
                <div key={booking.id} className="border rounded-md p-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{booking.reference_code}</div>
                    <div className="text-sm text-muted-foreground">
                      {booking.origin} → {booking.destination}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(booking.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={booking.status === 'pending' ? 'outline' : 'secondary'}>
                      {booking.status}
                    </Badge>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Building className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="text-sm text-muted-foreground">
            Total de reservas pendentes: {unprocessedBookings?.length || 0}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssignmentDiagnostics;
