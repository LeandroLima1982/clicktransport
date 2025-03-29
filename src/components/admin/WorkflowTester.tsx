
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateSampleBookingAndOrder } from '@/services/db/generateTestOrders';
import { assignDriverToOrder, updateOrderStatus } from '@/services/booking/serviceOrderService';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  message?: string;
  timestamp?: string;
  data?: any;
}

const defaultWorkflowSteps: WorkflowStep[] = [
  { id: 'booking', name: 'Criar Reserva', status: 'pending' },
  { id: 'company_assignment', name: 'Atribuir à Empresa', status: 'pending' },
  { id: 'driver_assignment', name: 'Atribuir ao Motorista', status: 'pending' },
  { id: 'start_trip', name: 'Iniciar Viagem', status: 'pending' },
  { id: 'complete_trip', name: 'Concluir Viagem', status: 'pending' },
  { id: 'verify_queue', name: 'Verificar Fila de Empresas', status: 'pending' }
];

const WorkflowTester: React.FC = () => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(defaultWorkflowSteps);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [companyQueueBefore, setCompanyQueueBefore] = useState<any[]>([]);
  const [companyQueueAfter, setCompanyQueueAfter] = useState<any[]>([]);
  const [autoRun, setAutoRun] = useState(false);
  
  // Function to update a step status
  const updateStepStatus = (
    stepId: string, 
    status: WorkflowStep['status'], 
    message?: string, 
    data?: any
  ) => {
    setWorkflowSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { 
              ...step, 
              status, 
              message, 
              data,
              timestamp: new Date().toISOString() 
            } 
          : step
      )
    );
  };
  
  // Function to reset the workflow
  const resetWorkflow = () => {
    setWorkflowSteps(defaultWorkflowSteps);
    setCurrentBookingId(null);
    setCurrentOrderId(null);
    setDriverId(null);
    setCompanyQueueBefore([]);
    setCompanyQueueAfter([]);
  };
  
  // Function to fetch the company queue positions
  const fetchCompanyQueue = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, queue_position, last_order_assigned')
        .eq('status', 'active')
        .order('queue_position', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching company queue:', error);
      return [];
    }
  };
  
  // Step 1: Create a booking and order
  const createBookingAndOrder = async () => {
    updateStepStatus('booking', 'running', 'Criando reserva...');
    
    try {
      // Fetch company queue before
      const queueBefore = await fetchCompanyQueue();
      setCompanyQueueBefore(queueBefore);
      
      const result = await generateSampleBookingAndOrder();
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar reserva e ordem de serviço');
      }
      
      setCurrentBookingId(result.booking?.id || null);
      setCurrentOrderId(result.serviceOrder?.id || null);
      
      updateStepStatus(
        'booking', 
        'success', 
        'Reserva criada com sucesso!', 
        { 
          bookingId: result.booking?.id,
          orderId: result.serviceOrder?.id,
          origin: result.booking?.origin,
          destination: result.booking?.destination
        }
      );
      
      // Auto-verify company assignment
      if (result.serviceOrder) {
        verifyCompanyAssignment(result.serviceOrder.id);
      }
    } catch (error) {
      console.error('Error creating booking and order:', error);
      updateStepStatus('booking', 'failed', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };
  
  // Step 2: Verify company assignment
  const verifyCompanyAssignment = async (orderId: string) => {
    updateStepStatus('company_assignment', 'running', 'Verificando atribuição à empresa...');
    
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('id, company_id, companies:company_id(name, id)')
        .eq('id', orderId)
        .single();
        
      if (error) throw error;
      
      if (data && data.company_id) {
        updateStepStatus(
          'company_assignment', 
          'success', 
          'Ordem atribuída à empresa com sucesso!',
          {
            companyId: data.company_id,
            companyName: data.companies?.name
          }
        );
        
        // Fetch company queue after assignment
        const queueAfter = await fetchCompanyQueue();
        setCompanyQueueAfter(queueAfter);
        
        // Find available drivers for this company
        const { data: drivers, error: driversError } = await supabase
          .from('drivers')
          .select('id, name')
          .eq('company_id', data.company_id)
          .eq('status', 'active')
          .limit(1);
          
        if (driversError) throw driversError;
        
        if (drivers && drivers.length > 0) {
          setDriverId(drivers[0].id);
        } else {
          updateStepStatus('driver_assignment', 'failed', 'Nenhum motorista disponível para esta empresa');
        }
      } else {
        updateStepStatus('company_assignment', 'failed', 'Ordem não atribuída a nenhuma empresa');
      }
    } catch (error) {
      console.error('Error verifying company assignment:', error);
      updateStepStatus('company_assignment', 'failed', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };
  
  // Step 3: Assign driver to order
  const assignDriver = async () => {
    if (!currentOrderId || !driverId) {
      updateStepStatus('driver_assignment', 'failed', 'ID do pedido ou do motorista não disponível');
      return;
    }
    
    updateStepStatus('driver_assignment', 'running', 'Atribuindo motorista...');
    
    try {
      const result = await assignDriverToOrder(currentOrderId, driverId);
      
      if (result.success) {
        updateStepStatus(
          'driver_assignment', 
          'success', 
          'Motorista atribuído com sucesso!',
          {
            driverId,
            orderId: currentOrderId
          }
        );
      } else {
        throw new Error(result.error || 'Erro ao atribuir motorista');
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      updateStepStatus('driver_assignment', 'failed', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };
  
  // Step 4: Start trip
  const startTrip = async () => {
    if (!currentOrderId) {
      updateStepStatus('start_trip', 'failed', 'ID do pedido não disponível');
      return;
    }
    
    updateStepStatus('start_trip', 'running', 'Iniciando viagem...');
    
    try {
      const result = await updateOrderStatus(currentOrderId, 'in_progress', driverId || undefined);
      
      if (result.success) {
        updateStepStatus(
          'start_trip', 
          'success', 
          'Viagem iniciada com sucesso!',
          {
            orderId: currentOrderId,
            status: 'in_progress'
          }
        );
      } else {
        throw new Error(result.error || 'Erro ao iniciar viagem');
      }
    } catch (error) {
      console.error('Error starting trip:', error);
      updateStepStatus('start_trip', 'failed', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };
  
  // Step 5: Complete trip
  const completeTrip = async () => {
    if (!currentOrderId) {
      updateStepStatus('complete_trip', 'failed', 'ID do pedido não disponível');
      return;
    }
    
    updateStepStatus('complete_trip', 'running', 'Concluindo viagem...');
    
    try {
      const result = await updateOrderStatus(currentOrderId, 'completed', driverId || undefined);
      
      if (result.success) {
        updateStepStatus(
          'complete_trip', 
          'success', 
          'Viagem concluída com sucesso!',
          {
            orderId: currentOrderId,
            status: 'completed'
          }
        );
        
        // Automatically verify queue
        verifyQueueUpdate();
      } else {
        throw new Error(result.error || 'Erro ao concluir viagem');
      }
    } catch (error) {
      console.error('Error completing trip:', error);
      updateStepStatus('complete_trip', 'failed', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };
  
  // Step 6: Verify queue update
  const verifyQueueUpdate = async () => {
    updateStepStatus('verify_queue', 'running', 'Verificando atualização da fila...');
    
    try {
      const queueAfter = await fetchCompanyQueue();
      setCompanyQueueAfter(queueAfter);
      
      // Check if queue positions were updated correctly
      if (companyQueueBefore.length > 0 && queueAfter.length > 0) {
        // Find the company that was assigned the order
        const assignedCompany = workflowSteps.find(step => step.id === 'company_assignment')?.data?.companyId;
        
        if (assignedCompany) {
          const companyBefore = companyQueueBefore.find(c => c.id === assignedCompany);
          const companyAfter = queueAfter.find(c => c.id === assignedCompany);
          
          if (companyBefore && companyAfter) {
            if (companyAfter.queue_position > companyBefore.queue_position) {
              updateStepStatus(
                'verify_queue', 
                'success', 
                'Fila atualizada corretamente!',
                {
                  companyId: assignedCompany,
                  positionBefore: companyBefore.queue_position,
                  positionAfter: companyAfter.queue_position
                }
              );
            } else {
              updateStepStatus(
                'verify_queue', 
                'failed', 
                'Posição na fila não foi atualizada corretamente',
                {
                  companyId: assignedCompany,
                  positionBefore: companyBefore.queue_position,
                  positionAfter: companyAfter.queue_position
                }
              );
            }
          } else {
            updateStepStatus('verify_queue', 'failed', 'Empresa não encontrada nas verificações de fila');
          }
        } else {
          updateStepStatus('verify_queue', 'failed', 'ID da empresa atribuída não disponível');
        }
      } else {
        updateStepStatus('verify_queue', 'failed', 'Dados de fila não disponíveis para comparação');
      }
    } catch (error) {
      console.error('Error verifying queue update:', error);
      updateStepStatus('verify_queue', 'failed', `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };
  
  // Run full workflow
  const runFullWorkflow = async () => {
    setIsRunning(true);
    resetWorkflow();
    
    try {
      // Step 1: Create booking and order
      await createBookingAndOrder();
      
      // Wait for booking and order to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Next steps will be triggered automatically based on the results of each step
      
    } catch (error) {
      console.error('Error running full workflow:', error);
      toast.error('Erro ao executar fluxo completo', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  // Auto-run next step when previous is successful
  useEffect(() => {
    if (!autoRun) return;
    
    const runNextStep = async () => {
      // Find the current completed step
      const lastSuccessStep = [...workflowSteps].reverse().find(step => step.status === 'success');
      
      if (!lastSuccessStep) return;
      
      // Check which step to run next
      if (lastSuccessStep.id === 'booking' && workflowSteps.find(s => s.id === 'company_assignment')?.status === 'pending') {
        if (currentOrderId) {
          await verifyCompanyAssignment(currentOrderId);
        }
      } else if (lastSuccessStep.id === 'company_assignment' && workflowSteps.find(s => s.id === 'driver_assignment')?.status === 'pending') {
        await assignDriver();
      } else if (lastSuccessStep.id === 'driver_assignment' && workflowSteps.find(s => s.id === 'start_trip')?.status === 'pending') {
        await startTrip();
      } else if (lastSuccessStep.id === 'start_trip' && workflowSteps.find(s => s.id === 'complete_trip')?.status === 'pending') {
        await completeTrip();
      }
    };
    
    // Wait a moment before running the next step
    const timer = setTimeout(runNextStep, 1500);
    return () => clearTimeout(timer);
  }, [workflowSteps, autoRun, currentOrderId]);
  
  const getStepStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'success': return <Check className="w-5 h-5 text-green-500" />;
      case 'failed': return <X className="w-5 h-5 text-red-500" />;
      case 'running': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-300" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teste de Workflow Completo</CardTitle>
          <CardDescription>
            Teste o fluxo completo de reserva, atribuição, execução e conclusão de corrida
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="space-x-2">
              <Button 
                onClick={runFullWorkflow} 
                disabled={isRunning}
                size="sm"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executando...
                  </>
                ) : (
                  "Iniciar Workflow Completo"
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetWorkflow}
                disabled={isRunning}
              >
                Resetar
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Execução Automática:</span>
              <Button
                variant={autoRun ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRun(!autoRun)}
                disabled={isRunning}
              >
                {autoRun ? "Ativada" : "Desativada"}
              </Button>
            </div>
          </div>
          
          <div className="space-y-8">
            {/* Progress Timeline */}
            <div className="relative">
              <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>
              <div className="space-y-6">
                {workflowSteps.map((step, index) => (
                  <div key={step.id} className="relative flex items-start">
                    <div className="absolute left-0 rounded-full border-4 border-white bg-white">
                      {getStepStatusIcon(step.status)}
                    </div>
                    <div className="ml-10">
                      <div className="flex items-center mb-1">
                        <h3 className="text-lg font-medium">{step.name}</h3>
                        <Badge variant={
                          step.status === 'success' ? 'success' : 
                          step.status === 'failed' ? 'destructive' : 
                          step.status === 'running' ? 'default' : 
                          'outline'
                        } className="ml-2">
                          {step.status === 'pending' ? 'Pendente' : 
                           step.status === 'running' ? 'Executando' : 
                           step.status === 'success' ? 'Sucesso' : 'Falha'}
                        </Badge>
                      </div>
                      
                      {step.message && (
                        <p className={`text-sm ${
                          step.status === 'failed' ? 'text-red-600' : 
                          step.status === 'success' ? 'text-green-600' : 
                          'text-gray-600'
                        }`}>
                          {step.message}
                        </p>
                      )}
                      
                      {step.timestamp && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                      
                      {step.data && Object.keys(step.data).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md text-xs">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(step.data, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {!autoRun && index > 0 && 
                       workflowSteps[index-1].status === 'success' && 
                       step.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => {
                            if (step.id === 'company_assignment' && currentOrderId) {
                              verifyCompanyAssignment(currentOrderId);
                            } else if (step.id === 'driver_assignment') {
                              assignDriver();
                            } else if (step.id === 'start_trip') {
                              startTrip();
                            } else if (step.id === 'complete_trip') {
                              completeTrip();
                            } else if (step.id === 'verify_queue') {
                              verifyQueueUpdate();
                            }
                          }}
                        >
                          Executar Este Passo
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Company Queue Comparison */}
            {(companyQueueBefore.length > 0 || companyQueueAfter.length > 0) && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-3">Análise da Fila de Empresas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Antes</h4>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {companyQueueBefore.map((company) => (
                            <tr key={company.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{company.queue_position}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{company.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Depois</h4>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {companyQueueAfter.map((company) => (
                            <tr key={company.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{company.queue_position}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{company.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowTester;
