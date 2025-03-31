
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MoreHorizontal, Check, X, Calendar, Clock, MapPin, Phone, Mail, User, Building } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ptBR } from 'date-fns/locale';
import { Booking } from '@/types/booking';

interface BookingTableProps {
  bookings: Booking[];
  isLoading: boolean;
  onRefreshData: () => void;
}

const BookingTable: React.FC<BookingTableProps> = ({ bookings, isLoading, onRefreshData }) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmada</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Concluída</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };
  
  const formatDateTime = (dateString: string) => {
    try {
      if (!dateString) return "N/A";
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };
  
  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };
  
  const handleUpdateStatus = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setIsUpdateDialogOpen(true);
  };
  
  const handleAssignCompany = async (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedCompanyId(booking.company_id || "");
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setCompanies(data || []);
      setIsAssignDialogOpen(true);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Erro ao carregar lista de empresas');
    }
  };
  
  const confirmStatusUpdate = async () => {
    if (!selectedBooking) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', selectedBooking.id);
      
      if (error) throw error;
      
      toast.success('Status da reserva atualizado com sucesso');
      setIsUpdateDialogOpen(false);
      onRefreshData();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Erro ao atualizar status da reserva');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const confirmAssignCompany = async () => {
    if (!selectedBooking) return;
    
    setIsAssigning(true);
    try {
      const updateObject: {company_id?: string | null} = {};
      
      // If empty string, set to null (remove assignment)
      if (selectedCompanyId === "") {
        updateObject.company_id = null;
      } else {
        updateObject.company_id = selectedCompanyId;
      }
      
      const { error } = await supabase
        .from('bookings')
        .update(updateObject)
        .eq('id', selectedBooking.id);
      
      if (error) throw error;
      
      toast.success('Empresa atribuída com sucesso');
      setIsAssignDialogOpen(false);
      onRefreshData();
    } catch (error) {
      console.error('Error assigning company:', error);
      toast.error('Erro ao atribuir empresa à reserva');
    } finally {
      setIsAssigning(false);
    }
  };
  
  const handleDeleteBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsConfirmDeleteOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedBooking) return;
    
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', selectedBooking.id);
      
      if (error) throw error;
      
      toast.success('Reserva excluída com sucesso');
      setIsConfirmDeleteOpen(false);
      onRefreshData();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast.error('Erro ao excluir reserva');
    }
  };
  
  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-full mb-2" />
        <Skeleton className="h-8 w-full" />
      </Card>
    );
  }
  
  if (bookings.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-medium">Nenhuma reserva encontrada</h3>
        <p className="text-muted-foreground mt-2">Não há reservas para exibir no momento.</p>
      </Card>
    );
  }
  
  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead>De</TableHead>
              <TableHead>Para</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.reference_code}</TableCell>
                <TableCell>{booking.origin}</TableCell>
                <TableCell>{booking.destination}</TableCell>
                <TableCell>{formatDate(booking.travel_date)}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell className="text-right">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56" align="end" forceMount>
                      <div className="grid gap-1">
                        <Button 
                          variant="ghost" 
                          className="justify-start" 
                          onClick={() => handleViewBooking(booking)}
                        >
                          Ver detalhes
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="justify-start" 
                          onClick={() => handleUpdateStatus(booking)}
                        >
                          Atualizar status
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="justify-start" 
                          onClick={() => handleAssignCompany(booking)}
                        >
                          Atribuir empresa
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="justify-start text-red-600" 
                          onClick={() => handleDeleteBooking(booking)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Booking Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes da Reserva</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Código de referência</p>
                  <p>{selectedBooking.reference_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Data da viagem
                </p>
                <p>{formatDateTime(selectedBooking.travel_date)}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Origem e Destino
                </p>
                <p>De: {selectedBooking.origin}</p>
                <p>Para: {selectedBooking.destination}</p>
              </div>
              
              {selectedBooking.return_date && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Data de retorno
                  </p>
                  <p>{formatDateTime(selectedBooking.return_date)}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Cliente
                </p>
                <p>{selectedBooking.client_name || "Nome não disponível"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  E-mail do cliente
                </p>
                <p>{selectedBooking.client_email || "Email não disponível"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Telefone
                </p>
                <p>{selectedBooking.client_phone || "Telefone não disponível"}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  Empresa atribuída
                </p>
                <p>{selectedBooking.company_name || "Nenhuma empresa atribuída"}</p>
              </div>
              
              {selectedBooking.additional_notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Observações adicionais</p>
                  <p>{selectedBooking.additional_notes}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor total</p>
                <p>R$ {selectedBooking.total_price.toFixed(2)}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Status da Reserva</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Reserva: {selectedBooking.reference_code}</p>
                <p className="text-sm mb-4">De {selectedBooking.origin} para {selectedBooking.destination}</p>
              </div>
              
              <Select 
                value={newStatus} 
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o novo status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>Cancelar</Button>
            <Button 
              disabled={isUpdating || !newStatus} 
              onClick={confirmStatusUpdate}
            >
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Company Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir Empresa à Reserva</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Reserva: {selectedBooking.reference_code}</p>
                <p className="text-sm mb-4">De {selectedBooking.origin} para {selectedBooking.destination}</p>
              </div>
              
              <Select 
                value={selectedCompanyId} 
                onValueChange={setSelectedCompanyId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">-- Nenhuma empresa --</SelectItem>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>Cancelar</Button>
            <Button 
              disabled={isAssigning} 
              onClick={confirmAssignCompany}
            >
              {isAssigning ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirm Delete Dialog */}
      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta reserva? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BookingTable;
