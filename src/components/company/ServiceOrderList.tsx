
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardList } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';
import OrderForm from './orders/OrderForm';
import OrderTable from './orders/OrderTable';
import SearchBar from './orders/SearchBar';
import OrderDetailSheet from './OrderDetailSheet';
import OrderTracking from './orders/OrderTracking';
import { ServiceOrder, Driver, Vehicle } from './orders/types';

interface ServiceOrderListProps {
  companyId: string;
}

const ServiceOrderList: React.FC<ServiceOrderListProps> = ({ companyId }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isNewOrderSheetOpen, setIsNewOrderSheetOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      fetchData();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('service_orders_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'service_orders',
            filter: `company_id=eq.${companyId}`
          },
          (payload) => {
            console.log('Service order change detected:', payload);
            fetchData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [companyId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersResponse, driversResponse, vehiclesResponse] = await Promise.all([
        supabase
          .from('service_orders')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('drivers')
          .select('id, name')
          .eq('company_id', companyId),
        
        supabase
          .from('vehicles')
          .select('id, model, license_plate')
          .eq('company_id', companyId)
      ]);
      
      if (ordersResponse.error) throw ordersResponse.error;
      if (driversResponse.error) throw driversResponse.error;
      if (vehiclesResponse.error) throw vehiclesResponse.error;
      
      setOrders(ordersResponse.data || []);
      setDrivers(driversResponse.data || []);
      setVehicles(vehiclesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrderDetails = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsDetailSheetOpen(true);
  };

  const handleTrackOrder = (orderId: string) => {
    setTrackingOrderId(orderId);
    setIsTrackingOpen(true);
  };

  const filteredOrders = orders.filter(order => 
    order.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
        />
        
        <OrderForm
          companyId={companyId}
          drivers={drivers}
          vehicles={vehicles}
          isOpen={isNewOrderSheetOpen}
          setIsOpen={setIsNewOrderSheetOpen}
          onOrderCreated={fetchData}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <ClipboardList className="mr-2 h-5 w-5" />
            Ordens de Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTable
            orders={filteredOrders}
            drivers={drivers}
            loading={isLoading}
            onViewDetails={handleViewOrderDetails}
            onDataRefresh={fetchData}
            onTrackOrder={handleTrackOrder}
          />
        </CardContent>
      </Card>

      <OrderDetailSheet
        order={selectedOrder}
        isOpen={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
        drivers={drivers}
        vehicles={vehicles}
      />

      {trackingOrderId && (
        <OrderTracking 
          orderId={trackingOrderId}
          isOpen={isTrackingOpen}
          onClose={() => {
            setIsTrackingOpen(false);
            setTrackingOrderId(null);
          }}
        />
      )}
    </div>
  );
};

export default ServiceOrderList;
