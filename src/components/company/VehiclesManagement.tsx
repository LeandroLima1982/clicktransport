
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/main';
import { Plus, Search, Car, Edit, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  model: string;
  license_plate: string;
  year: number | null;
  status: 'active' | 'maintenance' | 'inactive';
}

const VehiclesManagement: React.FC = () => {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  
  // Form state
  const [vehicleForm, setVehicleForm] = useState({
    id: '',
    model: '',
    license_plate: '',
    year: '',
    status: 'active'
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, [user]);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const companyId = await getCompanyId();
      
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

  // Helper function to get company ID from user ID
  const getCompanyId = async () => {
    if (!user) return null;
    
    try {
      const { data } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      return data?.id || null;
    } catch (error) {
      console.error('Error fetching company ID:', error);
      return null;
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
      const companyId = await getCompanyId();
      
      if (!companyId) {
        toast.error('ID da empresa não encontrado');
        return;
      }
      
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const translateStatus = (status: string) => {
    const statusMap: {[key: string]: string} = {
      'active': 'Ativo',
      'maintenance': 'Em manutenção',
      'inactive': 'Inativo'
    };
    return statusMap[status] || status;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar veículos..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Sheet onOpenChange={(open) => !open && resetForm()}>
          <SheetTrigger asChild>
            <Button className="ml-4">
              <Plus className="mr-2 h-4 w-4" />
              Novo Veículo
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{isEditing ? 'Editar Veículo' : 'Cadastrar Veículo'}</SheetTitle>
              <SheetDescription>
                {isEditing ? 'Atualize os dados do veículo.' : 'Preencha os dados para cadastrar um novo veículo.'}
              </SheetDescription>
            </SheetHeader>
            
            <div className="grid gap-4 py-4">
              <div>
                <label htmlFor="model" className="block text-sm font-medium mb-1">
                  Modelo *
                </label>
                <Input
                  id="model"
                  name="model"
                  value={vehicleForm.model}
                  onChange={handleInputChange}
                  placeholder="Modelo do veículo"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="license_plate" className="block text-sm font-medium mb-1">
                  Placa *
                </label>
                <Input
                  id="license_plate"
                  name="license_plate"
                  value={vehicleForm.license_plate}
                  onChange={handleInputChange}
                  placeholder="Placa do veículo"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="year" className="block text-sm font-medium mb-1">
                  Ano
                </label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={vehicleForm.year}
                  onChange={handleInputChange}
                  placeholder="Ano do veículo"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={vehicleForm.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Ativo</option>
                  <option value="maintenance">Em manutenção</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>
            
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancelar</Button>
              </SheetClose>
              <Button onClick={handleSaveVehicle}>
                {isEditing ? 'Salvar Alterações' : 'Cadastrar Veículo'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Confirmation Dialog for Delete */}
      <Dialog open={!!vehicleToDelete} onOpenChange={(open) => !open && setVehicleToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVehicleToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteVehicle}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
            <div className="h-40 flex items-center justify-center flex-col">
              <p className="text-muted-foreground mb-2">Nenhum veículo encontrado</p>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Veículo
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  {/* Same form content as above */}
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Ano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.model}</TableCell>
                      <TableCell>{vehicle.license_plate}</TableCell>
                      <TableCell>{vehicle.year || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(vehicle.status)}`}>
                          {translateStatus(vehicle.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Sheet onOpenChange={(open) => {
                            if (open) handleEditVehicle(vehicle);
                            else if (!open) resetForm();
                          }}>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent>
                              {/* Same form content as above */}
                            </SheetContent>
                          </Sheet>
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setVehicleToDelete(vehicle.id)}
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehiclesManagement;
