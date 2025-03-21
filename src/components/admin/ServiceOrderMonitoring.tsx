
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import ServiceOrderTable, { ServiceOrder } from './ServiceOrderTable';

const ServiceOrderMonitoring: React.FC = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchOrders();
    fetchTotalCount();
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
      const { count, error } = await supabase
        .from('service_orders')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setTotalOrders(count || 0);
    } catch (error) {
      console.error('Error fetching total orders count:', error);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Fetch service orders with related company names
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          companies:company_id(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format the data to include company_name
      const formattedOrders = data?.map(order => ({
        ...order,
        company_name: order.companies?.name || null
      })) || [];
      
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
