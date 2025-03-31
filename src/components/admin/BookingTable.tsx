import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from "@/components/ui/sheet";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { format } from 'date-fns';
import { Eye, CheckCircle, XCircle, Clock, ArrowRight, FileText, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Booking } from '@/types/booking';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { createServiceOrderFromBooking } from '@/services/booking/serviceOrderService';

const statusConfig: Record<string, { color: string, icon: React.ReactNode }> = {
  pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: <Clock className="h-4 w-4" /> },
  confirmed: { color: "bg-blue-100 text-blue-800 border-blue-300", icon: <CheckCircle className="h-4 w-4" /> },
  completed: { color: "bg-green-100 text-green-800 border-green-300", icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { color: "bg-red-100 text-red-800 border-red-300", icon: <XCircle className="h-4 w-4" /> },
};

interface BookingTableProps {
  bookings: Booking[];
  isLoading: boolean;
  onRefreshData: () => void;
}

const BookingTable: React.FC<BookingTableProps> = ({ bookings, isLoading, onRefreshData }) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showCreateOrderDialog, setShowCreateOrderDialog] = useState(false);
  const [companies, setCompanies] = useState<{ id: string, name: string }[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return 'Data inválida';
    }
  };
  
  const handleViewDetails = async (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
    
    await fetchCompanies();
  };
  
  const fetchCompanies = async () => {
    try {
      setIsLoadingCompanies(true);
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setIsLoadingCompanies(false);
    }
  };
  
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedBooking) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', selectedBooking.id);
      
      if (error) throw error;
      
      toast.success(`Status atualizado para ${newStatus}`);
      onRefreshData();
      
      setSelectedBooking({ ...selectedBooking, status: newStatus as any });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Erro ao atualizar status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleShowAssignDialog = () => {
    if (selectedBooking?.company_id) {
      toast.error('Esta reserva já está atribuída a uma empresa');
      return;
    }
    
    setShowAssignDialog(true);
  };
  
  const handleAssignCompany = async () => {
    if (!selectedBooking || !selectedCompany) return;
    
    try {
      setIsUpdating(true);
      
      const companyName = companies.find(c => c.id === selectedCompany)?.name || 'Empresa';
      
      const { error } = await supabase
        .from('bookings')
        .update({ 
          company_id: selectedCompany,
          company_name: companyName,
          status: 'confirmed' 
        })
        .eq('id', selectedBooking.id);
      
      if (error) throw error;
      
      toast.success(`Reserva atribuída a ${companyName}`);
      onRefreshData();
      setShowAssignDialog(false);
      setShowBookingDetails(false);
    } catch (error) {
      console.error('Error assigning booking:', error);
      toast.error('Erro ao atribuir reserva');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleShowCreateOrderDialog = () => {
    if (!selectedBooking) return;
    
    setShowCreateOrderDialog(true);
  };
  
  const handleCreateServiceOrder = async () => {
    if (!selectedBooking || !selectedCompany) {
      toast.error('Selecione uma empresa para criar a ordem de serviço');
      return;
    }
    
    try {
      setIsCreatingOrder(true);
      
      const companyName = companies.find(c => c.id === selectedCompany)?.name || 'Empresa';
      
      if (!selectedBooking.company_id) {
        const { error: updateError } = await supabase
          .from('bookings')
          .update({ 
            company_id: selectedCompany,
            company_name: companyName,
            status: 'confirmed' 
          })
          .eq('id', selectedBooking.id);
        
        if (updateError) throw updateError;
      }
      
      const bookingWithCompany = {
        ...selectedBooking,
        company_id: selectedCompany,
        company_name: companyName
      };
      
      const { serviceOrder, error } = await createServiceOrderFromBooking(bookingWithCompany);
      
      if (error) {
        throw error;
      }
      
      toast.success('Ordem de serviço criada com sucesso', {
        description: 'A ordem foi atribuída à empresa selecionada'
      });
      
      onRefreshData();
      setShowCreateOrderDialog(false);
      setShowBookingDetails(false);
    } catch (error: any) {
      console.error('Error creating service order:', error);
      
      if (error.message?.includes('financial_metrics')) {
        toast.warning("Ordem de serviço criada com aviso", {
          description: "A ordem foi criada, mas houve um erro ao atualizar métricas financeiras",
          icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
        });
        onRefreshData();
        setShowCreateOrderDialog(false);
        setShowBookingDetails(false);
      } else {
        toast.error('Erro ao criar ordem de serviço', {
          description: error.message || 'Ocorreu um erro inesperado'
        });
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };
  
  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Referência</TableHead>
              <TableHead>Rota</TableHead>
              <TableHead>Data da Viagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma reserva encontrada.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.reference_code}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className="truncate max-w-[100px]">{booking.origin}</span>
                      <ArrowRight className="mx-1 h-3 w-3 flex-shrink-0" />
                      <span className="truncate max-w-[100px]">{booking.destination}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(booking.travel_date)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${statusConfig[booking.status]?.color} flex w-fit items-center gap-1 border`}>
                      {statusConfig[booking.status]?.icon}
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {booking.company_name || '-'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewDetails(booking)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Ver detalhes</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Sheet open={showBookingDetails} onOpenChange={setShowBookingDetails}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Detalhes da Reserva</SheetTitle>
            <SheetDescription>
              Ref: {selectedBooking?.reference_code}
            </SheetDescription>
          </SheetHeader>
          
          {selectedBooking && (
            <ScrollArea className="h-[calc(100vh-180px)] pr-4">
              <div className="py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 py-2 border-b">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <Badge variant="outline" className={`${statusConfig[selectedBooking.status]?.color} mt-1 flex w-fit items-center gap-1 border`}>
                        {statusConfig[selectedBooking.status]?.icon}
                        {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Preço</p>
                      <p className="font-medium">R$ {selectedBooking.total_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Passageiros</p>
                      <p className="font-medium">{selectedBooking.passengers || '1'}</p>
                    </div>
                  </div>
                  
                  <div className="py-2 border-b">
                    <p className="text-sm font-medium text-gray-500">Cliente</p>
                    <p className="font-medium">{selectedBooking.client_name || 'Nome não informado'}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.client_email || 'Email não informado'}</p>
                    <p className="text-sm text-gray-500">{selectedBooking.client_phone || 'Telefone não informado'}</p>
                  </div>
                  
                  <div className="py-2 border-b">
                    <p className="text-sm font-medium text-gray-500">Rota</p>
                    <div className="mt-1">
                      <div className="flex items-start">
                        <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                        <div className="ml-2">
                          <p className="font-medium">Origem</p>
                          <p className="text-gray-700">{selectedBooking.origin}</p>
                        </div>
                      </div>
                      <div className="ml-1 h-6 w-[1px] bg-gray-300"></div>
                      <div className="flex items-start">
                        <div className="mt-1 h-2 w-2 rounded-full bg-red-500"></div>
                        <div className="ml-2">
                          <p className="font-medium">Destino</p>
                          <p className="text-gray-700">{selectedBooking.destination}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2 border-b">
                    <p className="text-sm font-medium text-gray-500">Datas</p>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <div>
                        <p className="text-sm text-gray-500">Ida</p>
                        <p className="font-medium">{formatDate(selectedBooking.travel_date)}</p>
                      </div>
                      {selectedBooking.return_date && (
                        <div>
                          <p className="text-sm text-gray-500">Volta</p>
                          <p className="font-medium">{formatDate(selectedBooking.return_date)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="py-2 border-b">
                    <p className="text-sm font-medium text-gray-500">Veículo</p>
                    <p className="font-medium">{selectedBooking.vehicle_type || 'Não especificado'}</p>
                  </div>
                  
                  {selectedBooking.additional_notes && (
                    <div className="py-2 border-b">
                      <p className="text-sm font-medium text-gray-500">Observações</p>
                      <p className="text-gray-700">{selectedBooking.additional_notes}</p>
                    </div>
                  )}
                  
                  <div className="py-2">
                    <p className="text-sm font-medium text-gray-500">Empresa</p>
                    <p className="font-medium">{selectedBooking.company_name || 'Não atribuída'}</p>
                  </div>
                  
                  <div className="flex flex-col space-y-2 pt-4">
                    <p className="text-sm font-medium">Gerenciar reserva</p>
                    <div className="flex flex-col space-y-2">
                      <Select onValueChange={(value) => handleStatusChange(value)} disabled={isUpdating}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Alterar status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="confirmed">Confirmada</SelectItem>
                          <SelectItem value="completed">Concluída</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <div className="flex space-x-2">
                        {!selectedBooking.company_id && (
                          <Button variant="outline" onClick={handleShowAssignDialog} disabled={isUpdating} className="flex-1">
                            Atribuir Empresa
                          </Button>
                        )}
                        
                        <Button 
                          variant="default" 
                          onClick={handleShowCreateOrderDialog} 
                          disabled={isUpdating}
                          className="flex-1"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Criar Ordem de Serviço
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
      
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atribuir empresa à reserva</DialogTitle>
            <DialogDescription>
              Selecione uma empresa para atribuir esta reserva.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="company">Empresa</Label>
            <Select onValueChange={setSelectedCompany} disabled={isLoadingCompanies}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder={isLoadingCompanies ? "Carregando..." : "Selecione uma empresa"} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancelar</Button>
            <Button 
              onClick={handleAssignCompany} 
              disabled={!selectedCompany || isUpdating}
            >
              {isUpdating ? 'Atribuindo...' : 'Atribuir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showCreateOrderDialog} onOpenChange={setShowCreateOrderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Ordem de Serviço</DialogTitle>
            <DialogDescription>
              Selecione uma empresa para atribuir esta ordem de serviço.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="company">Empresa</Label>
            <Select 
              onValueChange={setSelectedCompany} 
              disabled={isLoadingCompanies}
              defaultValue={selectedBooking?.company_id || undefined}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder={isLoadingCompanies ? "Carregando..." : "Selecione uma empresa"} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedBooking?.company_id && (
              <p className="text-sm text-muted-foreground mt-2">
                Esta reserva já está atribuída a {selectedBooking.company_name}. Criar uma ordem de serviço para outra empresa substituirá esta atribuição.
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateOrderDialog(false)}>Cancelar</Button>
            <Button 
              onClick={handleCreateServiceOrder} 
              disabled={!selectedCompany || isCreatingOrder}
            >
              {isCreatingOrder ? 'Criando...' : 'Criar Ordem de Serviço'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookingTable;
