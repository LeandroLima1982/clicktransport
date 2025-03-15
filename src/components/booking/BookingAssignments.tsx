import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, Calendar, Building } from 'lucide-react';

const BookingAssignments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: recentAssignments, isLoading, refetch } = useQuery({
    queryKey: ['recent-booking-assignments'],
    queryFn: async () => {
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id, reference_code, origin, destination, created_at, status')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (bookingsError) throw bookingsError;
      
      const assignmentsData = await Promise.all(bookings.map(async (booking) => {
        const { data: serviceOrders, error: ordersError } = await supabase
          .from('service_orders')
          .select('id, company_id, created_at, status, notes')
          .ilike('notes', `%Reserva #${booking.reference_code}%`)
          .limit(1);
          
        if (ordersError) console.error(`Error fetching service order for booking ${booking.reference_code}:`, ordersError);
        
        const serviceOrder = serviceOrders && serviceOrders.length > 0 ? serviceOrders[0] : null;
        
        let company = null;
        if (serviceOrder?.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('id, name, queue_position')
            .eq('id', serviceOrder.company_id)
            .single();
            
          if (companyError) {
            console.error(`Error fetching company for service order ${serviceOrder.id}:`, companyError);
          } else {
            company = companyData;
          }
        }
        
        return {
          booking,
          serviceOrder,
          company
        };
      }));
      
      return assignmentsData;
    }
  });
  
  const filteredAssignments = recentAssignments?.filter(assignment => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      assignment.booking.reference_code.toLowerCase().includes(term) ||
      assignment.booking.origin.toLowerCase().includes(term) ||
      assignment.booking.destination.toLowerCase().includes(term) ||
      (assignment.company?.name && assignment.company.name.toLowerCase().includes(term))
    );
  });
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };
  
  const extractCompanyFromNotes = (notes?: string) => {
    if (!notes) return 'N/A';
    
    const match = notes.match(/Empresa: ([^-]+) -/);
    return match ? match[1].trim() : 'N/A';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Atribuições de Reservas</CardTitle>
            <CardDescription>
              Acompanhe quais empresas foram atribuídas para cada reserva
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por referência, origem, destino ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredAssignments && filteredAssignments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referência</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Origem/Destino</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.map((assignment) => (
                <TableRow key={assignment.booking.id}>
                  <TableCell className="font-medium">
                    {assignment.booking.reference_code}
                  </TableCell>
                  <TableCell>
                    {formatDate(assignment.booking.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{assignment.booking.origin}</div>
                      <div className="text-muted-foreground">→ {assignment.booking.destination}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {assignment.serviceOrder ? (
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-1 text-blue-500" />
                        {assignment.company?.name || extractCompanyFromNotes(assignment.serviceOrder.notes)}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
                        Não atribuída
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        assignment.serviceOrder?.status === 'completed' ? 'secondary' :
                        assignment.serviceOrder?.status === 'in_progress' ? 'default' :
                        assignment.serviceOrder?.status === 'cancelled' ? 'destructive' :
                        assignment.serviceOrder ? 'outline' : 'secondary'
                      }
                    >
                      {assignment.serviceOrder?.status || 'Pendente'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            {searchTerm 
              ? 'Nenhuma atribuição encontrada para a busca realizada.' 
              : 'Nenhuma atribuição de reserva encontrada.'}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground">
          {filteredAssignments?.length || 0} atribuições encontradas
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          Atualizado em: {new Date().toLocaleString('pt-BR')}
        </div>
      </CardFooter>
    </Card>
  );
};

export default BookingAssignments;
