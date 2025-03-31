
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bookmark, Eye, Info } from 'lucide-react';
import { Booking } from '@/types/booking';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

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
  const [selectedBooking, setSelectedBooking] = React.useState<Booking | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [companies, setCompanies] = React.useState<any[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = React.useState(false);

  // Fetch companies for dropdown selection
  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'active');
      
      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Falha ao carregar empresas');
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    fetchCompanies();
  };

  const handleStatusChange = async (status: "pending" | "confirmed" | "completed" | "cancelled") => {
    if (!selectedBooking) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', selectedBooking.id);
      
      if (error) throw error;
      
      toast.success(`Status atualizado para ${status}`);
      setSelectedBooking({...selectedBooking, status});
      onRefreshData();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Falha ao atualizar status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignCompany = async (companyId: string) => {
    if (!selectedBooking) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ company_id: companyId })
        .eq('id', selectedBooking.id);
      
      if (error) throw error;
      
      // Find company name
      const company = companies.find(c => c.id === companyId);
      
      toast.success(`Reserva atribuída à empresa ${company?.name || companyId}`);
      setSelectedBooking({...selectedBooking, company_id: companyId, company_name: company?.name});
      onRefreshData();
    } catch (error) {
      console.error('Error assigning company:', error);
      toast.error('Falha ao atribuir empresa');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: "pending" | "confirmed" | "completed" | "cancelled") => {
    switch(status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pendente</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Confirmada</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Concluída</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', {locale: ptBR});
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-10">
        <Info className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">Nenhuma reserva encontrada</h3>
        <p className="text-muted-foreground">
          Não há reservas disponíveis para exibição no momento.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.reference_code}</TableCell>
              <TableCell>{booking.origin}</TableCell>
              <TableCell>{booking.destination}</TableCell>
              <TableCell>{formatDate(booking.booking_date)}</TableCell>
              <TableCell>{getStatusBadge(booking.status)}</TableCell>
              <TableCell>{booking.company_name || 'Não atribuída'}</TableCell>
              <TableCell className="text-right">
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleViewDetails(booking)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    {selectedBooking && (
                      <>
                        <DrawerHeader>
                          <DrawerTitle className="flex items-center">
                            <Bookmark className="mr-2 h-5 w-5" />
                            Detalhes da Reserva - {selectedBooking.reference_code}
                          </DrawerTitle>
                          <DrawerDescription>
                            Criada em {formatDate(selectedBooking.created_at)}
                          </DrawerDescription>
                        </DrawerHeader>
                        <div className="px-4 py-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Card>
                              <CardContent className="pt-6">
                                <CardTitle className="text-sm font-medium mb-2">Informações da Viagem</CardTitle>
                                <CardDescription>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Origem:</span>
                                      <span className="font-medium">{selectedBooking.origin}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Destino:</span>
                                      <span className="font-medium">{selectedBooking.destination}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Data:</span>
                                      <span className="font-medium">{formatDate(selectedBooking.booking_date)}</span>
                                    </div>
                                    {selectedBooking.return_date && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Retorno:</span>
                                        <span className="font-medium">{formatDate(selectedBooking.return_date)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Passageiros:</span>
                                      <span className="font-medium">{selectedBooking.passengers || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Tipo de Veículo:</span>
                                      <span className="font-medium">{selectedBooking.vehicle_type || 'N/A'}</span>
                                    </div>
                                  </div>
                                </CardDescription>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardContent className="pt-6">
                                <CardTitle className="text-sm font-medium mb-2">Informações do Cliente</CardTitle>
                                <CardDescription>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Nome:</span>
                                      <span className="font-medium">{selectedBooking.client_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Email:</span>
                                      <span className="font-medium">{selectedBooking.client_email || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Telefone:</span>
                                      <span className="font-medium">{selectedBooking.client_phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Status:</span>
                                      <span>{getStatusBadge(selectedBooking.status)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Empresa:</span>
                                      <span className="font-medium">{selectedBooking.company_name || 'Não atribuída'}</span>
                                    </div>
                                  </div>
                                </CardDescription>
                              </CardContent>
                            </Card>
                          </div>
                          
                          {/* Additional notes */}
                          {selectedBooking.additional_notes && (
                            <Card className="mb-4">
                              <CardContent className="pt-6">
                                <CardTitle className="text-sm font-medium mb-2">Notas Adicionais</CardTitle>
                                <CardDescription>
                                  <p className="whitespace-pre-wrap">{selectedBooking.additional_notes}</p>
                                </CardDescription>
                              </CardContent>
                            </Card>
                          )}
                          
                          {/* Administrative controls */}
                          <Card>
                            <CardContent className="pt-6">
                              <CardTitle className="text-sm font-medium mb-4">Administração da Reserva</CardTitle>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium block mb-2">Atualizar Status</label>
                                  <Select 
                                    defaultValue={selectedBooking.status}
                                    disabled={isUpdating}
                                    onValueChange={(value) => handleStatusChange(value as "pending" | "confirmed" | "completed" | "cancelled")}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecionar status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pendente</SelectItem>
                                      <SelectItem value="confirmed">Confirmada</SelectItem>
                                      <SelectItem value="completed">Concluída</SelectItem>
                                      <SelectItem value="cancelled">Cancelada</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium block mb-2">Atribuir Empresa</label>
                                  <Select
                                    defaultValue={selectedBooking.company_id}
                                    disabled={isUpdating || isLoadingCompanies}
                                    onValueChange={(value) => handleAssignCompany(value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecionar empresa" />
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
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        <DrawerFooter>
                          <DrawerClose asChild>
                            <Button variant="outline">Fechar</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </>
                    )}
                  </DrawerContent>
                </Drawer>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default BookingTable;
