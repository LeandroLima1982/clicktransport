
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Building } from 'lucide-react';

const AssignmentStatus = () => {
  const { data: lastAssignment, isLoading, refetch } = useQuery({
    queryKey: ['last-assigned-booking'],
    queryFn: async () => {
      // Get the most recent service order
      const { data: serviceOrders, error: serviceOrdersError } = await supabase
        .from('service_orders')
        .select('id, company_id, created_at, notes, status')
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (serviceOrdersError) throw serviceOrdersError;
      
      if (!serviceOrders || serviceOrders.length === 0) {
        return { serviceOrder: null, company: null, booking: null };
      }
      
      const serviceOrder = serviceOrders[0];
      
      // Extract booking reference from notes
      const referenceMatch = serviceOrder.notes.match(/Reserva #([A-Z0-9]+)/);
      const referenceCode = referenceMatch ? referenceMatch[1] : null;
      
      // Find the booking
      let booking = null;
      if (referenceCode) {
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('id, reference_code, origin, destination, created_at, status')
          .eq('reference_code', referenceCode)
          .single();
          
        if (!bookingError) {
          booking = bookingData;
        }
      }
      
      // Get company info
      let company = null;
      if (serviceOrder.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('id, name, queue_position')
          .eq('id', serviceOrder.company_id)
          .single();
          
        if (!companyError) {
          company = companyData;
        }
      }
      
      return { serviceOrder, company, booking };
    }
  });
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Última Atribuição</CardTitle>
          <CardDescription>
            Detalhes sobre a mais recente reserva atribuída a uma empresa
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
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : !lastAssignment || !lastAssignment.serviceOrder ? (
          <div className="text-center py-6 text-muted-foreground">
            Nenhuma atribuição de reserva encontrada.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Empresa Atribuída
                </h3>
                <div className="font-medium flex items-center">
                  <Building className="h-4 w-4 mr-2 text-blue-500" />
                  {lastAssignment.company ? lastAssignment.company.name : 'Empresa não encontrada'}
                </div>
                {lastAssignment.company && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Posição na fila: {lastAssignment.company.queue_position || 'N/A'}
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Data da Atribuição
                </h3>
                <div className="font-medium">
                  {formatDate(lastAssignment.serviceOrder.created_at)}
                </div>
                <div className="text-sm mt-1">
                  <Badge
                    variant={
                      lastAssignment.serviceOrder.status === 'completed' ? 'secondary' :
                      lastAssignment.serviceOrder.status === 'in_progress' ? 'default' :
                      lastAssignment.serviceOrder.status === 'cancelled' ? 'destructive' :
                      'outline'
                    }
                  >
                    {lastAssignment.serviceOrder.status}
                  </Badge>
                </div>
              </div>
            </div>
            
            {lastAssignment.booking && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Detalhes da Reserva
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium">Referência</div>
                    <div className="text-sm text-muted-foreground">{lastAssignment.booking.reference_code}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Rota</div>
                    <div className="text-sm text-muted-foreground">
                      {lastAssignment.booking.origin} → {lastAssignment.booking.destination}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentStatus;
