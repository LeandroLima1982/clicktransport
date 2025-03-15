
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const AssignmentDiagnostics = () => {
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  
  const { 
    data: diagnostics, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['assignment-diagnostics'],
    queryFn: async () => {
      // Get queue health statistics
      const response = await supabase.functions.invoke('check_queue_health', {
        method: 'POST'
      });
      
      if (response.error) {
        throw new Error(`Error checking queue health: ${response.error.message}`);
      }
      
      // Check for mismatched service orders (without proper booking references)
      const { data: serviceOrders, error: ordersError } = await supabase
        .from('service_orders')
        .select('id, notes, created_at')
        .not('notes', 'ilike', '%Reserva #%')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (ordersError) throw ordersError;
      
      // Count total bookings and service orders
      const { count: bookingCount, error: bookingCountError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
        
      if (bookingCountError) throw bookingCountError;
      
      const { count: orderCount, error: orderCountError } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true });
        
      if (orderCountError) throw orderCountError;
      
      return {
        queueHealth: response.data,
        mismatchedOrders: serviceOrders || [],
        bookingCount,
        orderCount
      };
    }
  });
  
  const runQueueFix = async () => {
    setIsRunningDiagnostics(true);
    try {
      const response = await supabase.functions.invoke('fix_invalid_queue_positions', {
        method: 'POST'
      });
      
      if (response.error) {
        throw new Error(`Error fixing queue positions: ${response.error.message}`);
      }
      
      toast.success('Posições de fila corrigidas com sucesso!', {
        description: `${response.data.fixed_count} empresas atualizadas.`
      });
      
      refetch();
    } catch (error) {
      console.error('Error fixing queue positions:', error);
      toast.error('Erro ao corrigir posições de fila');
    } finally {
      setIsRunningDiagnostics(false);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Diagnóstico de Atribuições</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardTitle>
        <CardDescription>
          Verifica problemas no sistema de atribuição de reservas para empresas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Saúde da Fila</h3>
                {diagnostics?.queueHealth ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Empresas ativas:</span>
                      <span className="font-medium">{diagnostics.queueHealth.active_companies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Posições inválidas:</span>
                      <span className={`font-medium ${diagnostics.queueHealth.invalid_positions > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {diagnostics.queueHealth.invalid_positions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Posições duplicadas:</span>
                      <span className={`font-medium ${diagnostics.queueHealth.duplicate_positions > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {diagnostics.queueHealth.duplicate_positions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Score de saúde:</span>
                      <span className={`font-medium ${diagnostics.queueHealth.health_score < 90 ? 'text-amber-500' : 'text-green-500'}`}>
                        {diagnostics.queueHealth.health_score.toFixed(1)}%
                      </span>
                    </div>
                    
                    {(diagnostics.queueHealth.invalid_positions > 0 || 
                       diagnostics.queueHealth.duplicate_positions > 0) && (
                      <Button 
                        className="w-full mt-2" 
                        variant="secondary"
                        onClick={runQueueFix}
                        disabled={isRunningDiagnostics}
                      >
                        {isRunningDiagnostics ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Corrigindo...
                          </>
                        ) : (
                          'Corrigir Problemas de Fila'
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <AlertCircle className="h-5 w-5 mx-auto mb-2" />
                    Dados de saúde da fila indisponíveis
                  </div>
                )}
              </div>
              
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-2">Contagem de Registros</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total de reservas:</span>
                    <span className="font-medium">{diagnostics?.bookingCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total de ordens de serviço:</span>
                    <span className="font-medium">{diagnostics?.orderCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ordens sem referência:</span>
                    <span className={`font-medium ${diagnostics?.mismatchedOrders.length > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                      {diagnostics?.mismatchedOrders.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {diagnostics?.mismatchedOrders && diagnostics.mismatchedOrders.length > 0 && (
              <div className="border rounded-md p-4">
                <h3 className="text-sm font-medium mb-3">Ordens de Serviço Sem Referência de Reserva</h3>
                <div className="space-y-3">
                  {diagnostics.mismatchedOrders.map((order) => (
                    <div key={order.id} className="border-b pb-2 text-sm">
                      <div className="font-medium">ID: {order.id}</div>
                      <div className="text-muted-foreground text-xs">
                        Criada em: {formatDate(order.created_at)}
                      </div>
                      <div className="text-muted-foreground text-xs mt-1 break-words">
                        Observações: {order.notes || 'Sem observações'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-xs text-muted-foreground w-full">
          {!isLoading && diagnostics?.queueHealth?.health_score === 100 && 
           (!diagnostics?.mismatchedOrders || diagnostics.mismatchedOrders.length === 0) ? (
            <div className="flex items-center text-green-500">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Todos os sistemas de atribuição estão funcionando corretamente.
            </div>
          ) : (
            'O diagnóstico ajuda a identificar e corrigir problemas no sistema de atribuição de reservas.'
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AssignmentDiagnostics;
