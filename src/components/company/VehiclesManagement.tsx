
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Car, Edit, Trash2, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/types/vehicle';
import VehicleForm from './vehicles/VehicleForm';

interface VehiclesManagementProps {
  companyId: string;
}

const VehiclesManagement: React.FC<VehiclesManagementProps> = ({ companyId }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchVehicles();
    }
  }, [companyId]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Ensure all vehicles have a type property
      const vehiclesWithType = data.map(vehicle => ({
        ...vehicle,
        type: vehicle.type || 'sedan'  // Default to 'sedan' if type is missing
      })) as Vehicle[];
      
      setVehicles(vehiclesWithType);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Erro ao carregar veículos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    fetchVehicles();
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando veículos...
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Gerenciar Veículos</CardTitle>
          <Button onClick={handleAddVehicle}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Veículo
          </Button>
        </CardHeader>
        <CardContent>
          {vehicles.length > 0 ? (
            <div className="grid gap-4">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-semibold">{vehicle.model}</CardTitle>
                    <div className="space-x-2">
                      <Badge variant="secondary">{vehicle.type}</Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Placa: {vehicle.license_plate} | Ano: {vehicle.year}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-4">
              <Car className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddForm && (
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleForm 
                companyId={companyId} 
                onSuccess={handleFormSuccess} 
                onCancel={handleFormCancel} 
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VehiclesManagement;
