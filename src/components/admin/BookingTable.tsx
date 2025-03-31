
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, MoreHorizontal, CheckCircle, AlertCircle, Building } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';
import { createServiceOrderFromBooking } from '@/services/booking/serviceOrderService';

interface Company {
  id: string;
  name: string;
  status: string;
}

interface BookingTableProps {
  bookings: Booking[];
  isLoading: boolean;
  onRefreshData: () => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  isLoading,
  onRefreshData
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [assignCompanyDialogOpen, setAssignCompanyDialogOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setDetailDialogOpen(true);
  };

  const handleAssignCompany = async (booking: Booking) => {
    setSelectedBooking(booking);
    setAssignCompanyDialogOpen(true);
    await fetchCompanies();
  };

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, status')
        .eq('status', 'active')
        .order('name', { ascending: true });
      
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Falha ao carregar empresas');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', booking.id);
      
      if (error) throw error;
      
      toast.success(`Status da reserva atualizado para: ${translateStatus(newStatus)}`);
      onRefreshData();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Falha ao atualizar status da reserva');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const confirmAssignCompany = async () => {
    if (!selectedBooking || !selectedCompanyId) {
      toast.error('Selecione uma empresa para atribuir');
      return;
    }

    try {
      // Primeiro, atualiza o company_id no booking
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          company_id: selectedCompanyId,
          status: 'confirmed' 
        })
        .eq('id', selectedBooking.id);
      
      if (updateError) throw updateError;
      
      // Depois cria a ordem de serviço
      const updatedBooking = {
        ...selectedBooking,
        company_id: selectedCompanyId,
        status: 'confirmed'
      };
      
      const { serviceOrder, error } = await createServiceOrderFromBooking(updatedBooking);
      
      if (error) {
        console.error('Error creating service order:', error);
        toast.warning('Reserva atualizada, mas houve um problema ao criar a ordem de serviço');
      } else {
        toast.success('Empresa atribuída e ordem de serviço criada com sucesso');
      }
      
      setAssignCompanyDialogOpen(false);
      setSelectedCompanyId('');
      onRefreshData();
    } catch (error) {
      console.error('Error assigning company to booking:', error);
      toast.error('Falha ao atribuir empresa à reserva');
    }
  };

  const translateStatus = (status: string) => {
    const statusNames: Record<string, string> = {
      'confirmed': 'Confirmada',
      'pending': 'Pendente',
      'completed': 'Concluída',
      'cancelled': 'Cancelada'
    };
    
    return statusNames[status] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Concluída</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <p>Carregando reservas...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="flex justify-center items-center flex-col h-60">
        <p className="text-muted-foreground mb-2">Nenhuma reserva encontrada</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Data Viagem</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações Rápidas</TableHead>
              <TableHead className="text-right">Opções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map(booking => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.reference_code}</TableCell>
                <TableCell>{booking.origin}</TableCell>
                <TableCell>{booking.destination}</TableCell>
                <TableCell>{formatDate(booking.travel_date)}</TableCell>
                <TableCell>{booking.company_name || 'Não atribuída'}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!booking.company_id && booking.status !== 'cancelled' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleAssignCompany(booking)} 
                        className="h-8 w-8 text-blue-600"
                        title="Atribuir Empresa"
                      >
                        <Building className="h-4 w-4" />
                      </Button>
                    )}
                    {booking.status !== 'confirmed' && booking.status !== 'cancelled' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleStatusChange(booking, 'confirmed')} 
                        disabled={updatingStatus}
                        className="h-8 w-8 text-green-600"
                        title="Confirmar"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {booking.status !== 'cancelled' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleStatusChange(booking, 'cancelled')} 
                        disabled={updatingStatus}
                        className="h-8 w-8 text-red-600"
                        title="Cancelar"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(booking)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      {!booking.company_id && booking.status !== 'cancelled' && (
                        <DropdownMenuItem onClick={() => handleAssignCompany(booking)}>
                          <Building className="mr-2 h-4 w-4" />
                          Atribuir Empresa
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                      {booking.status !== 'confirmed' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(booking, 'confirmed')}
                          disabled={updatingStatus}
                        >
                          <Badge className="bg-green-100 text-green-800 mr-2">Confirmar</Badge>
                        </DropdownMenuItem>
                      )}
                      {booking.status !== 'pending' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(booking, 'pending')}
                          disabled={updatingStatus}
                        >
                          <Badge className="bg-yellow-100 text-yellow-800 mr-2">Marcar como Pendente</Badge>
                        </DropdownMenuItem>
                      )}
                      {booking.status !== 'completed' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(booking, 'completed')}
                          disabled={updatingStatus}
                        >
                          <Badge className="bg-blue-100 text-blue-800 mr-2">Marcar como Concluída</Badge>
                        </DropdownMenuItem>
                      )}
                      {booking.status !== 'cancelled' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(booking, 'cancelled')}
                          disabled={updatingStatus}
                        >
                          <Badge className="bg-red-100 text-red-800 mr-2">Cancelar</Badge>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de detalhes da reserva */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Reserva</DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a reserva {selectedBooking?.reference_code}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Código de Referência</h3>
                  <p>{selectedBooking.reference_code}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Status</h3>
                  <div>{getStatusBadge(selectedBooking.status)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Empresa</h3>
                  <p>{selectedBooking.company_name || 'Não atribuída'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Valor Total</h3>
                  <p>{formatCurrency(selectedBooking.total_price)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Tipo de Veículo</h3>
                  <p>{selectedBooking.vehicle_type || 'Não especificado'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Passageiros</h3>
                  <p>{selectedBooking.passengers || 1}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold">Origem</h3>
                  <p>{selectedBooking.origin}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Destino</h3>
                  <p>{selectedBooking.destination}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Data da Reserva</h3>
                  <p>{formatDateTime(selectedBooking.booking_date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Data da Viagem</h3>
                  <p>{formatDateTime(selectedBooking.travel_date)}</p>
                </div>
                {selectedBooking.return_date && (
                  <div>
                    <h3 className="text-sm font-semibold">Data de Retorno</h3>
                    <p>{formatDateTime(selectedBooking.return_date)}</p>
                  </div>
                )}
              </div>
              
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-sm font-semibold">Observações Adicionais</h3>
                <p className="whitespace-pre-wrap">{selectedBooking.additional_notes || 'Sem observações'}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Fechar
            </Button>
            {selectedBooking && !selectedBooking.company_id && selectedBooking.status !== 'cancelled' && (
              <Button onClick={() => {
                setDetailDialogOpen(false);
                handleAssignCompany(selectedBooking);
              }}>
                <Building className="mr-2 h-4 w-4" />
                Atribuir Empresa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para atribuir empresa */}
      <AlertDialog open={assignCompanyDialogOpen} onOpenChange={setAssignCompanyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Atribuir Empresa à Reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione uma empresa para atribuir à reserva {selectedBooking?.reference_code}.
              Isso irá criar uma ordem de serviço para a empresa selecionada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Origem: {selectedBooking?.origin}</p>
                <p className="text-sm font-medium">Destino: {selectedBooking?.destination}</p>
                <p className="text-sm font-medium">
                  Data da Viagem: {selectedBooking ? formatDateTime(selectedBooking.travel_date) : ''}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione uma Empresa:</label>
                <Select onValueChange={setSelectedCompanyId} value={selectedCompanyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar empresa..." />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCompanies ? (
                      <div className="flex items-center justify-center p-2">
                        Carregando...
                      </div>
                    ) : companies.length === 0 ? (
                      <div className="p-2 text-center text-sm">
                        Nenhuma empresa ativa encontrada
                      </div>
                    ) : (
                      companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAssignCompany}
              disabled={!selectedCompanyId}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Confirmar Atribuição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BookingTable;
