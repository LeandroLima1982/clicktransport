
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Car } from 'lucide-react';
import { SheetContent } from "@/components/ui/sheet";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';
import { toast } from 'sonner';

// Import components
import VehiclesList from './vehicles/VehiclesList';
import VehicleForm from './vehicles/VehicleForm';
import EmptyVehicleState from './vehicles/EmptyVehicleState';
import VehicleDeleteDialog from './vehicles/VehicleDeleteDialog';
import VehicleSearchBar from './vehicles/VehicleSearchBar';

// Import types and utils
import { Vehicle, VehicleForm as VehicleFormType } from './vehicles/types';
import { getStatusBadgeClass, translateStatus } from './vehicles/utils';

interface VehiclesManagementProps {
  companyId: string;
}

const VehiclesManagement: React.FC<VehiclesManagementProps> = ({ companyId }) => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  
  // Form state
  const [vehicleForm, setVehicleForm] = useState<VehicleFormType>({
    id: '',
    model: '',
    license_plate: '',
    year: '',
    status: 'active'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [user, companyId]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      if (companyId) {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('company_id', companyId);
        
        if (error) throw error;
        
        setVehicles(data || []);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Erro ao carregar veículos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicleForm({ ...vehicleForm, [name]: value });
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleForm({
      id: vehicle.id,
      model: vehicle.model,
      license_plate: vehicle.license_plate,
      year: vehicle.year?.toString() || '',
      status: vehicle.status
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setVehicleForm({
      id: '',
      model: '',
      license_plate: '',
      year: '',
      status: 'active'
    });
    setIsEditing(false);
  };

  const handleSaveVehicle = async () => {
    try {
      // Validate form
      if (!vehicleForm.model || !vehicleForm.license_plate) {
        toast.error('Modelo e placa são obrigatórios');
        return;
      }
      
      const vehicleData = {
        model: vehicleForm.model,
        license_plate: vehicleForm.license_plate,
        year: vehicleForm.year ? parseInt(vehicleForm.year) : null,
        status: vehicleForm.status as 'active' | 'maintenance' | 'inactive'
      };
      
      if (isEditing) {
        // Update vehicle
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', vehicleForm.id);
        
        if (error) throw error;
        
        toast.success('Veículo atualizado com sucesso');
      } else {
        // Create new vehicle
        const { error } = await supabase
          .from('vehicles')
          .insert([
            {
              ...vehicleData,
              company_id: companyId
            }
          ]);
        
        if (error) throw error;
        
        toast.success('Veículo cadastrado com sucesso');
      }
      
      // Reset form and refresh data
      resetForm();
      fetchVehicles();
      
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Erro ao salvar veículo');
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleToDelete);
      
      if (error) throw error;
      
      toast.success('Veículo removido com sucesso');
      setVehicleToDelete(null);
      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Erro ao remover veículo');
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.year && vehicle.year.toString().includes(searchTerm))
  );

  return (
    <div>
      {/* Search and Add New Vehicle */}
      <VehicleSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewVehicleClick={resetForm}
      />
      
      {/* Delete Confirmation Dialog */}
      <VehicleDeleteDialog 
        isOpen={!!vehicleToDelete} 
        onClose={() => setVehicleToDelete(null)} 
        onConfirm={handleDeleteVehicle} 
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Car className="mr-2 h-5 w-5" />
            Veículos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <p>Carregando...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <EmptyVehicleState onNewVehicleClick={resetForm} />
          ) : (
            <VehiclesList 
              vehicles={filteredVehicles}
              onEdit={handleEditVehicle}
              onDelete={setVehicleToDelete}
              getStatusBadgeClass={getStatusBadgeClass}
              translateStatus={translateStatus}
            />
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Vehicle Sheet Content */}
      <SheetContent>
        <VehicleForm 
          isEditing={isEditing}
          vehicleForm={vehicleForm}
          handleInputChange={handleInputChange}
          handleSaveVehicle={handleSaveVehicle}
        />
      </SheetContent>
    </div>
  );
};

export default VehiclesManagement;
