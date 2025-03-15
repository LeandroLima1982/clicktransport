import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle, 
  RotateCcw, 
  Wrench,
  RefreshCw,
  ArrowUpDown,
  Search,
  CalendarClock,
  MapPin,
  PackageCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueueDiagnostics } from '@/hooks/useQueueDiagnostics';
import { autoFixQueueIssues } from '@/services/booking/queueService';
import { format } from 'date-fns';

const QueueDiagnosticsPanel = () => {
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  
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
    refreshDiagnostics,
    searchBooking,
    bookingDetails,
    isLoadingBooking,
    isSearching,
    processBooking,
    isProcessingBooking
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

  const handleSearchBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingCode.trim()) {
      searchBooking(bookingCode.trim());
    }
  };
  
  const handleProcessBooking = () => {
    if (bookingDetails && !bookingDetails.service_order) {
      processBooking(bookingDetails.id);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateString;
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

  // Calculate a meaningful overall score if it's not available from the API
  const overallHealthScore = queueHealth?.overall_health_score !== undefined
    ? queueHealth.overall_health_score
    : healthScore.score;

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
          <TabsTrigger value="search">Buscar Reserva</TabsTrigger>
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
                    {Math.round(overallHealthScore)}%
                  </span>
                </div>
                <Progress 
                  value={overallHealthScore} 
                  className={getHealthColor(overallHealthScore)} 
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
                      <span className={`font-medium ${(queueHealth?.unprocessed_bookings || 0) > 0 ? 'text-amber-500' : 'text-green-500'}`}>
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
                      <span className={`font-medium ${(queueHealth?.unlinked_orders || 0) > 0 ? 'text-amber-500' : 'text-green-500'}`}>
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
              <Alert variant={(queueHealth?.unprocessed_bookings || 0) > 0 ? "destructive" : "default"}>
                {(queueHealth?.unprocessed_bookings || 0) > 0 ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {(queueHealth?.unprocessed_bookings || 0) > 0 
                    ? `${queueHealth?.unprocessed_bookings} reservas não processadas` 
                    : 'Todas as reservas processadas'}
                </AlertTitle>
                <AlertDescription>
                  {(queueHealth?.unprocessed_bookings || 0) > 0 
                    ? 'Existem reservas que ainda não foram atribuídas a empresas.' 
                    : 'Todas as reservas recentes foram processadas corretamente.'}
                </AlertDescription>
              </Alert>
              
              <Alert variant={(queueHealth?.unlinked_orders || 0) > 0 ? "destructive" : "default"}>
                {(queueHealth?.unlinked_orders || 0) > 0 ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {(queueHealth?.unlinked_orders || 0) > 0 
                    ? `${queueHealth?.unlinked_orders} ordens sem referência` 
                    : 'Todas as ordens com referência'}
                </AlertTitle>
                <AlertDescription>
                  {(queueHealth?.unlinked_orders || 0) > 0 
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
        
        <TabsContent value="search">
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Buscar Reserva Específica</h3>
                <form onSubmit={handleSearchBooking} className="flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Digite o código da reserva (ex: TRF-691709)"
                      className="pl-8"
                      value={bookingCode}
                      onChange={(e) => setBookingCode(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isSearching || !bookingCode.trim()}>
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      'Buscar'
                    )}
                  </Button>
                </form>
              </div>
              
              {isLoadingBooking && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              
              {!isLoadingBooking && bookingDetails === null && bookingCode.trim() !== '' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Reserva não encontrada</AlertTitle>
                  <AlertDescription>
                    Não foi possível encontrar uma reserva com o código "{bookingCode}".
                  </AlertDescription>
                </Alert>
              )}
              
              {!isLoadingBooking && bookingDetails && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{bookingDetails.reference_code}</h3>
                      <p className="text-sm text-muted-foreground">
                        Criada em {formatDate(bookingDetails.created_at)}
                      </p>
                    </div>
                    <Badge className={`
                      ${bookingDetails.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        bookingDetails.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {bookingDetails.status === 'confirmed' ? 'Confirmada' : 
                       bookingDetails.status === 'pending' ? 'Pendente' : 
                       bookingDetails.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-md p-4 space-y-3">
                      <h4 className="font-medium text-sm flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Detalhes da Viagem
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <div className="text-sm text-muted-foreground">Origem:</div>
                          <div className="font-medium">{bookingDetails.origin}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Destino:</div>
                          <div className="font-medium">{bookingDetails.destination}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Data da Viagem:</div>
                          <div className="font-medium">{formatDate(bookingDetails.travel_date)}</div>
                        </div>
                        {bookingDetails.return_date && (
                          <div>
                            <div className="text-sm text-muted-foreground">Data de Retorno:</div>
                            <div className="font-medium">{formatDate(bookingDetails.return_date)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4 space-y-3">
                      <h4 className="font-medium text-sm flex items-center">
                        <CalendarClock className="h-4 w-4 mr-1" />
                        Status da Ordem de Serviço
                      </h4>
                      
                      {bookingDetails.service_order ? (
                        <div className="space-y-2">
                          <div>
                            <div className="text-sm text-muted-foreground">Empresa:</div>
                            <div className="font-medium">{bookingDetails.service_order.company_name || 'Não identificada'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Status:</div>
                            <Badge className={`
                              ${bookingDetails.service_order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                bookingDetails.service_order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                bookingDetails.service_order.status === 'assigned' ? 'bg-purple-100 text-purple-800' : 
                                bookingDetails.service_order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}
                            `}>
                              {bookingDetails.service_order.status === 'completed' ? 'Concluída' :
                               bookingDetails.service_order.status === 'in_progress' ? 'Em Andamento' :
                               bookingDetails.service_order.status === 'assigned' ? 'Atribuída' :
                               bookingDetails.service_order.status === 'pending' ? 'Pendente' :
                               bookingDetails.service_order.status}
                            </Badge>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Criada em:</div>
                            <div className="font-medium">{formatDate(bookingDetails.service_order.created_at)}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Não processada</AlertTitle>
                            <AlertDescription>
                              Esta reserva ainda não possui uma ordem de serviço.
                            </AlertDescription>
                          </Alert>
                          
                          <Button
                            onClick={handleProcessBooking}
                            disabled={isProcessingBooking}
                            className="w-full"
                          >
                            {isProcessingBooking ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processando...
                              </>
                            ) : (
                              <>
                                <PackageCheck className="mr-2 h-4 w-4" />
                                Processar Reserva
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {bookingDetails.additional_notes && (
                    <div className="border rounded-md p-4">
                      <h4 className="font-medium text-sm mb-2">Observações:</h4>
                      <p className="text-sm">{bookingDetails.additional_notes}</p>
                    </div>
                  )}
                </div>
              )}
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
