
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ServiceOrderTable, { ServiceOrder } from './ServiceOrderTable';
import { useServiceOrderSubscription } from '@/hooks/useServiceOrderSubscription';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ServiceOrderMonitoring: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Set up real-time subscription for service orders
  const handleOrderNotification = useCallback((payload: any) => {
    console.log('Service order notification received in admin panel:', payload);
    fetchOrders();
    fetchTotalCount();
    
    if (payload.eventType === 'INSERT') {
      toast.success('Nova ordem de serviço criada!', {
        description: `Origem: ${payload.new.origin}, Destino: ${payload.new.destination}`
      });
    }
  }, []);
  
  // Initialize service order subscription
  useServiceOrderSubscription(handleOrderNotification);

  useEffect(() => {
    fetchOrders();
    fetchTotalCount();
    
    // Subscribe to all changes of the service_orders table
    const channel = supabase
      .channel('service_orders_admin_monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_orders'
        },
        (payload) => {
          console.log('Service order change detected in admin monitoring:', payload);
          fetchOrders();
          fetchTotalCount();
        }
      )
      .subscribe((status) => {
        console.log('Service orders subscription status:', status);
      });
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter(order =>
        order.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.company_name && order.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  const fetchTotalCount = async () => {
    try {
      console.log('Fetching total service orders count...');
      const { count, error } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      console.log('Total service orders:', count);
      setTotalOrders(count || 0);
      
      // Reset error state on successful fetch
      setHasError(false);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching total orders count:', error);
      setHasError(true);
      setErrorMessage('Falha ao carregar contagem de ordens de serviço. Verifique suas permissões de acesso.');
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      console.log('Admin: Fetching all service orders...');
      
      // Fetch service orders with related company names and driver names
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies(name),
          drivers(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        setHasError(true);
        setErrorMessage(`Erro ao carregar ordens: ${error.message}`);
        throw error;
      }
      
      console.log('Admin: Retrieved orders:', data);
      
      // Format the data to include company_name and driver_name
      const formattedOrders = data?.map(order => ({
        ...order,
        company_name: order.companies?.name || null,
        driver_name: order.drivers?.name || null
      })) || [];
      
      console.log('Admin: Formatted orders:', formattedOrders);
      
      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
      
      // Reset error state on successful fetch
      setHasError(false);
      setErrorMessage('');
    } catch (error) {
      console.error('Error fetching service orders:', error);
      toast.error('Falha ao carregar ordens de serviço');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders();
    fetchTotalCount();
  };

  // Manual service order creation for testing
  const createTestServiceOrder = async () => {
    try {
      // Get a company
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'active')
        .limit(1);
      
      if (companyError) throw companyError;
      if (!companies || companies.length === 0) {
        toast.error('Nenhuma empresa disponível para criar ordem de teste');
        return;
      }
      
      const testOrderData = {
        company_id: companies[0].id,
        origin: 'Teste - Origem',
        destination: 'Teste - Destino',
        pickup_date: new Date().toISOString(),
        status: 'created',
        notes: 'Ordem de teste criada pelo admin'
      };
      
      const { data, error } = await supabase
        .from('service_orders')
        .insert([testOrderData])
        .select();
      
      if (error) throw error;
      
      toast.success('Ordem de teste criada com sucesso');
      fetchOrders();
    } catch (error) {
      console.error('Error creating test order:', error);
      toast.error('Erro ao criar ordem de teste');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Monitoramento de Ordens de Serviço
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            (Total: {totalOrders})
          </span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={createTestServiceOrder}
          >
            Criar Ordem Teste
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {errorMessage || 'Ocorreu um erro ao carregar as ordens de serviço. Tente novamente.'}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por origem, destino, status ou empresa..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <ServiceOrderTable 
          orders={filteredOrders} 
          isLoading={isLoading}
          onRefreshData={handleRefresh}
        />
      </CardContent>
    </Card>
  );
};

export default ServiceOrderMonitoring;
