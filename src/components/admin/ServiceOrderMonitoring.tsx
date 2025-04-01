
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ServiceOrderTable, { ServiceOrder } from './ServiceOrderTable';
import { useServiceOrderSubscription } from '@/hooks/useServiceOrderSubscription';

const ServiceOrderMonitoring: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);

  // Set up real-time subscription for service orders
  const handleOrderNotification = useCallback((payload: any) => {
    console.log('Service order notification received:', payload);
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
    
    // Inscreva-se diretamente em alterações da tabela service_orders
    const channel = supabase
      .channel('service_orders_admin_direct')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_orders'
        },
        (payload) => {
          console.log('Direct service order change detected:', payload);
          fetchOrders();
          fetchTotalCount();
        }
      )
      .subscribe();
      
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
    } catch (error) {
      console.error('Error fetching total orders count:', error);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching service orders...');
      
      // Fetch service orders with related company names
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
        throw error;
      }
      
      console.log('Retrieved orders:', data);
      
      // Format the data to include company_name and driver_name
      const formattedOrders = data?.map(order => ({
        ...order,
        company_name: order.companies?.name || null,
        driver_name: order.drivers?.name || null
      })) || [];
      
      console.log('Formatted orders:', formattedOrders);
      
      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
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
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
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
