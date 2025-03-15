import React, { useState } from 'react';
import { useBookingAssignmentDiagnostics } from '@/hooks/useBookingAssignmentDiagnostics';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Calendar,
  Building,
  PackageCheck
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const BookingAssignmentDiagnostics: React.FC = () => {
  const {
    lastAssignmentInfo,
    isLoadingLastAssignment,
    
    unprocessedBookings,
    isLoadingUnprocessed,
    
    queueDiagnostics,
    isLoadingQueueDiagnostics,
    
    forceAssignBooking,
    isForceAssigning,
    
    runReconcile,
    isReconciling,
    
    refreshAllData,
    fixQueuePositions,
    isFixingPositions
  } = useBookingAssignmentDiagnostics();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  
  const handleForceAssign = () => {
    if (!selectedBookingId || !selectedCompanyId) {
      toast.error('Selecione uma reserva e uma empresa para atribuição');
      return;
    }
    
    forceAssignBooking(selectedBookingId, selectedCompanyId);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Diagnóstico de Atribuição de Reservas</CardTitle>
            <CardDescription>
              Monitore e resolva problemas na atribuição de reservas às empresas
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshAllData}
            disabled={isLoadingLastAssignment || isLoadingUnprocessed || isLoadingQueueDiagnostics}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(isLoadingLastAssignment || isLoadingUnprocessed || isLoadingQueueDiagnostics) ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList className="w-full">
              <TabsTrigger value="summary" className="flex-1">Resumo</TabsTrigger>
              <TabsTrigger value="bookings" className="flex-1">Reservas Não Processadas</TabsTrigger>
              <TabsTrigger value="queue" className="flex-1">Fila de Empresas</TabsTrigger>
              <TabsTrigger value="fix" className="flex-1">Correções</TabsTrigger>
            </TabsList>
            
            {/* Summary Tab */}
            <TabsContent value="summary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                      Última Ordem de Serviço
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingLastAssignment ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ) : lastAssignmentInfo?.lastServiceOrder ? (
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">ID:</span> {lastAssignmentInfo.lastServiceOrder.id.substring(0, 8)}...
                        </p>
                        <p>
                          <span className="font-semibold">Criada em:</span> {formatDate(lastAssignmentInfo.lastServiceOrder.created_at)}
                        </p>
                        <p>
                          <span className="font-semibold">Empresa:</span> {lastAssignmentInfo.company?.name || 'N/A'}
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span> 
                          <Badge className="ml-2">{lastAssignmentInfo.lastServiceOrder.status}</Badge>
                        </p>
                        {lastAssignmentInfo.booking && (
                          <p>
                            <span className="font-semibold">Reserva:</span> {lastAssignmentInfo.booking.reference_code}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Nenhuma ordem de serviço encontrada</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                      Reservas Não Processadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingUnprocessed ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    ) : unprocessedBookings ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Total não processadas:</span>
                          <Badge variant={unprocessedBookings.totalUnprocessed > 0 ? "destructive" : "outline"}>
                            {unprocessedBookings.totalUnprocessed}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">Total processadas:</span>
                          <Badge variant="outline">{unprocessedBookings.totalProcessed}</Badge>
                        </div>
                        
                        {unprocessedBookings.totalUnprocessed > 0 && (
                          <Button 
                            size="sm" 
                            onClick={runReconcile} 
                            disabled={isReconciling}
                            className="w-full"
                          >
                            {isReconciling ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Processando...
                              </>
                            ) : (
                              <>
                                <PackageCheck className="h-4 w-4 mr-2" />
                                Reconciliar Reservas
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Erro ao carregar dados</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Building className="h-5 w-5 mr-2 text-violet-500" />
                    Status da Fila de Empresas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingQueueDiagnostics ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ) : queueDiagnostics?.queue_status ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-4 rounded-md">
                        <div className="text-sm text-gray-500 mb-1">Empresas Ativas</div>
                        <div className="text-2xl font-bold">{queueDiagnostics.queue_status.active_companies}</div>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-md">
                        <div className="text-sm text-gray-500 mb-1">Posição Zero</div>
                        <div className="text-2xl font-bold">
                          {queueDiagnostics.queue_status.zero_queue_position_count}
                          <span className="text-sm font-normal text-gray-500 ml-2">empresas</span>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-md">
                        <div className="text-sm text-gray-500 mb-1">Posição Nula</div>
                        <div className="text-2xl font-bold">
                          {queueDiagnostics.queue_status.null_queue_position_count}
                          <span className="text-sm font-normal text-gray-500 ml-2">empresas</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Erro ao carregar dados da fila</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Unprocessed Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Reservas Não Processadas</CardTitle>
                  <CardDescription>
                    Reservas que não possuem ordens de serviço associadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingUnprocessed ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <>
                      {unprocessedBookings?.unprocessedBookings && unprocessedBookings.unprocessedBookings.length > 0 ? (
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Referência</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Criada em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {unprocessedBookings.unprocessedBookings.map((booking) => (
                                <TableRow key={booking.id}>
                                  <TableCell className="font-medium">{booking.reference_code}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{booking.status}</Badge>
                                  </TableCell>
                                  <TableCell>{formatDate(booking.created_at)}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedBookingId(booking.id)}
                                    >
                                      Selecionar
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium">Todas as reservas processadas</h3>
                          <p className="text-muted-foreground mt-2">
                            Não há reservas pendentes de processamento
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Queue Status Tab */}
            <TabsContent value="queue">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Status da Fila de Empresas</CardTitle>
                  <CardDescription>
                    Posição na fila e últimas ordens atribuídas às empresas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingQueueDiagnostics ? (
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ) : (
                    <>
                      {queueDiagnostics?.companies && queueDiagnostics.companies.length > 0 ? (
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Posição</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Última Ordem</TableHead>
                                <TableHead className="text-right">Total Ordens</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {queueDiagnostics.companies.map((company) => (
                                <TableRow key={company.id}>
                                  <TableCell className="font-medium">{company.name}</TableCell>
                                  <TableCell>{company.queue_position !== null ? company.queue_position : 'N/A'}</TableCell>
                                  <TableCell>
                                    <Badge className={`${company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                      {company.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{company.last_order_assigned ? formatDate(company.last_order_assigned) : 'Nunca'}</TableCell>
                                  <TableCell className="text-right">{company.order_count || 0}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium">Nenhuma empresa encontrada</h3>
                          <p className="text-muted-foreground mt-2">
                            Não foi possível carregar os dados das empresas
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Fix Tab */}
            <TabsContent value="fix">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Correção Manual</CardTitle>
                  <CardDescription>
                    Atribua manualmente uma reserva a uma empresa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">1. Selecione uma reserva não processada</h3>
                      <Select 
                        value={selectedBookingId || ""} 
                        onValueChange={setSelectedBookingId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma reserva" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingUnprocessed ? (
                            <SelectItem value="loading" disabled>Carregando...</SelectItem>
                          ) : (
                            unprocessedBookings?.unprocessedBookings && unprocessedBookings.unprocessedBookings.length > 0 ? (
                              unprocessedBookings.unprocessedBookings.map((booking) => (
                                <SelectItem key={booking.id} value={booking.id}>
                                  {booking.reference_code} ({formatDate(booking.created_at)})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>Nenhuma reserva disponível</SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">2. Selecione uma empresa para atribuir</h3>
                      <Select 
                        value={selectedCompanyId || ""} 
                        onValueChange={setSelectedCompanyId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingQueueDiagnostics ? (
                            <SelectItem value="loading" disabled>Carregando...</SelectItem>
                          ) : (
                            queueDiagnostics?.companies && queueDiagnostics.companies.length > 0 ? (
                              queueDiagnostics.companies
                                .filter(company => company.status === 'active')
                                .map((company) => (
                                  <SelectItem key={company.id} value={company.id}>
                                    {company.name} (Posição: {company.queue_position !== null ? company.queue_position : 'N/A'})
                                  </SelectItem>
                                ))
                            ) : (
                              <SelectItem value="none" disabled>Nenhuma empresa disponível</SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={handleForceAssign}
                      disabled={!selectedBookingId || !selectedCompanyId || isForceAssigning}
                    >
                      {isForceAssigning ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <PackageCheck className="h-4 w-4 mr-2" />
                          Atribuir Manualmente
                        </>
                      )}
                    </Button>
                    
                    <div className="pt-4">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="reconcile">
                          <AccordionTrigger>
                            <div className="flex items-center text-sm">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reconciliar Todas as Reservas
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 py-2">
                              <p className="text-sm text-muted-foreground">
                                Esta ação tentará processar todas as reservas confirmadas sem ordens de serviço.
                                Use esta opção quando houver múltiplas reservas pendentes.
                              </p>
                              <Button 
                                onClick={runReconcile} 
                                disabled={isReconciling}
                                variant="outline"
                                className="w-full"
                              >
                                {isReconciling ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Processando...
                                  </>
                                ) : (
                                  <>
                                    <PackageCheck className="h-4 w-4 mr-2" />
                                    Reconciliar Todas as Reservas
                                  </>
                                )}
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                        
                        <AccordionItem value="fix-positions">
                          <AccordionTrigger>
                            <div className="flex items-center text-sm">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Corrigir Posições de Fila Inválidas
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 py-2">
                              <p className="text-sm text-muted-foreground">
                                Esta ação corrigirá apenas as empresas com posições de fila nulas ou zero,
                                sem afetar outras empresas na fila. É mais seguro que resetar a fila inteira.
                              </p>
                              <Button 
                                onClick={fixQueuePositions} 
                                disabled={isFixingPositions}
                                variant="outline"
                                className="w-full"
                              >
                                {isFixingPositions ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Corrigindo...
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Corrigir Posições Inválidas
                                  </>
                                )}
                              </Button>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingAssignmentDiagnostics;
