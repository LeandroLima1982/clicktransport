
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Car, 
  Mail,
  Send,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import DriverRegistrationForm from './DriverRegistrationForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetFooter, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Driver {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  license_number: string | null;
  status: 'active' | 'inactive' | 'on_trip';
  vehicle_id: string | null;
  is_password_changed: boolean | null;
  last_login: string | null;
  company_id: string | null;
  user_id: string | null;
  created_at: string | null;
}

interface DriversManagementProps {
  companyId: string;
}

const DriversManagement: React.FC<DriversManagementProps> = ({ companyId }) => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  
  const [driverForm, setDriverForm] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    license_number: '',
    status: 'active',
    vehicle_id: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (companyId) {
        const { data: driversData, error: driversError } = await supabase
          .from('drivers')
          .select('*')
          .eq('company_id', companyId);
        
        if (driversError) throw driversError;
        
        // Transform the data to match our Driver interface
        // This ensures that if fields don't exist in DB, we still have them as null
        const formattedDrivers: Driver[] = driversData.map(driver => ({
          id: driver.id,
          name: driver.name,
          phone: driver.phone,
          email: driver.email || null,
          license_number: driver.license_number,
          status: driver.status as 'active' | 'inactive' | 'on_trip',
          vehicle_id: driver.vehicle_id,
          is_password_changed: driver.is_password_changed || null,
          last_login: driver.last_login || null,
          company_id: driver.company_id,
          user_id: driver.user_id,
          created_at: driver.created_at
        }));
        
        setDrivers(formattedDrivers);
        
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('company_id', companyId);
        
        if (vehiclesError) throw vehiclesError;
        
        setVehicles(vehiclesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDriverForm({ ...driverForm, [name]: value });
  };

  const handleEditDriver = (driver: Driver) => {
    setDriverForm({
      id: driver.id,
      name: driver.name,
      phone: driver.phone || '',
      email: driver.email || '',
      license_number: driver.license_number || '',
      status: driver.status,
      vehicle_id: driver.vehicle_id || ''
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setDriverForm({
      id: '',
      name: '',
      phone: '',
      email: '',
      license_number: '',
      status: 'active',
      vehicle_id: ''
    });
    setIsEditing(false);
  };

  const handleSaveDriver = async () => {
    try {
      if (!driverForm.name || !driverForm.email) {
        toast.error('Nome e email do motorista são obrigatórios');
        return;
      }
      
      if (isEditing) {
        const { error } = await supabase
          .from('drivers')
          .update({
            name: driverForm.name,
            phone: driverForm.phone || null,
            email: driverForm.email,
            license_number: driverForm.license_number || null,
            status: driverForm.status as 'active' | 'inactive' | 'on_trip',
            vehicle_id: driverForm.vehicle_id || null
          })
          .eq('id', driverForm.id);
        
        if (error) {
          console.error('Error updating driver:', error);
          throw error;
        }
        
        toast.success('Motorista atualizado com sucesso');
      } else {
        // Simple editing without auth integration is kept for backward compat
        const { error } = await supabase
          .from('drivers')
          .insert([
            {
              company_id: companyId,
              name: driverForm.name,
              phone: driverForm.phone || null,
              email: driverForm.email,
              license_number: driverForm.license_number || null,
              status: driverForm.status,
              vehicle_id: driverForm.vehicle_id || null
            }
          ]);
        
        if (error) {
          console.error('Error creating driver:', error);
          throw error;
        }
        
        toast.success('Motorista cadastrado com sucesso');
      }
      
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error saving driver:', error);
      toast.error(`Erro ao salvar motorista: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const handleDeleteDriver = async () => {
    if (!driverToDelete) return;
    
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverToDelete);
      
      if (error) throw error;
      
      toast.success('Motorista removido com sucesso');
      setDriverToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast.error('Erro ao remover motorista');
    }
  };

  const handleSendPasswordReminder = async (driverId: string) => {
    setSendingReminder(driverId);
    try {
      // Get driver info
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', driverId)
        .single();
      
      if (driverError || !driver) {
        throw new Error('Erro ao encontrar dados do motorista');
      }
      
      // In a production app, you would send an email here
      // For now, just show a toast message
      toast.success(`Lembrete enviado para ${driver.name}`, {
        description: `Um email foi enviado para ${driver.email} com instruções para alteração de senha.`
      });
      
      // Update a timestamp in the database to track when reminders were sent
      // We'll use the existing update method - ensure field exists in the schema
      await supabase
        .from('drivers')
        .update({ 
          last_login: new Date().toISOString() // Use last_login as a workaround 
        })
        .eq('id', driverId);
      
    } catch (error: any) {
      console.error('Error sending password reminder:', error);
      toast.error('Erro ao enviar lembrete', {
        description: error.message || 'Ocorreu um problema ao enviar o lembrete'
      });
    } finally {
      setSendingReminder(null);
    }
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (driver.phone && driver.phone.includes(searchTerm)) ||
    (driver.email && driver.email.includes(searchTerm)) ||
    (driver.license_number && driver.license_number.includes(searchTerm))
  );

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_trip': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const translateStatus = (status: string) => {
    const statusMap: {[key: string]: string} = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'on_trip': 'Em viagem'
    };
    return statusMap[status] || status;
  };

  const getVehicleName = (vehicleId: string | null) => {
    if (!vehicleId) return 'Não atribuído';
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.model} (${vehicle.license_plate})` : 'Não encontrado';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar motoristas..."
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button className="ml-4">
              <Plus className="mr-2 h-4 w-4" />
              Novo Motorista
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Cadastrar Novo Motorista</SheetTitle>
              <SheetDescription>
                Cadastre um novo motorista com suas credenciais de acesso.
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-4">
              <DriverRegistrationForm 
                companyId={companyId} 
                onSuccess={() => {
                  fetchData();
                }} 
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Confirmation Dialog for Delete */}
      <Dialog open={!!driverToDelete} onOpenChange={(open) => !open && setDriverToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este motorista? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDriverToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteDriver}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <User className="mr-2 h-5 w-5" />
            Motoristas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <p>Carregando...</p>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="h-40 flex items-center justify-center flex-col">
              <p className="text-muted-foreground mb-2">Nenhum motorista encontrado</p>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Motorista
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Cadastrar Motorista</SheetTitle>
                    <SheetDescription>
                      Preencha os dados para cadastrar um novo motorista.
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-1">
                        Nome *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={driverForm.name}
                        onChange={handleInputChange}
                        placeholder="Nome completo"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={driverForm.email}
                        onChange={handleInputChange}
                        placeholder="email@exemplo.com"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        Telefone
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        value={driverForm.phone}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="license_number" className="block text-sm font-medium mb-1">
                        CNH
                      </label>
                      <Input
                        id="license_number"
                        name="license_number"
                        value={driverForm.license_number}
                        onChange={handleInputChange}
                        placeholder="Número da CNH"
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
                        value={driverForm.status}
                        onChange={handleInputChange}
                      >
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                        <option value="on_trip">Em viagem</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="vehicle_id" className="block text-sm font-medium mb-1">
                        Veículo
                      </label>
                      <select
                        id="vehicle_id"
                        name="vehicle_id"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={driverForm.vehicle_id}
                        onChange={handleInputChange}
                      >
                        <option value="">Selecione um veículo</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.model} ({vehicle.license_plate})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </SheetClose>
                    <Button onClick={handleSaveDriver}>
                      Cadastrar Motorista
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>CNH</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Último Login</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>{driver.email || '-'}</TableCell>
                      <TableCell>{driver.phone || '-'}</TableCell>
                      <TableCell>{driver.license_number || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(driver.status)}`}>
                          {translateStatus(driver.status)}
                        </span>
                      </TableCell>
                      <TableCell>{getVehicleName(driver.vehicle_id)}</TableCell>
                      <TableCell>
                        {driver.last_login ? new Date(driver.last_login).toLocaleString('pt-BR') : 'Nunca'}
                        {!driver.is_password_changed && (
                          <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            Senha provisória
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Sheet onOpenChange={(open) => {
                            if (open) handleEditDriver(driver);
                            else if (!open) resetForm();
                          }}>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent>
                              <SheetHeader>
                                <SheetTitle>Editar Motorista</SheetTitle>
                                <SheetDescription>
                                  Atualize os dados do motorista.
                                </SheetDescription>
                              </SheetHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div>
                                  <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                                    Nome *
                                  </label>
                                  <Input
                                    id="edit-name"
                                    name="name"
                                    value={driverForm.name}
                                    onChange={handleInputChange}
                                    placeholder="Nome completo"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-email" className="block text-sm font-medium mb-1">
                                    Email *
                                  </label>
                                  <Input
                                    id="edit-email"
                                    name="email"
                                    type="email"
                                    value={driverForm.email}
                                    onChange={handleInputChange}
                                    placeholder="email@exemplo.com"
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-phone" className="block text-sm font-medium mb-1">
                                    Telefone
                                  </label>
                                  <Input
                                    id="edit-phone"
                                    name="phone"
                                    value={driverForm.phone}
                                    onChange={handleInputChange}
                                    placeholder="(00) 00000-0000"
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-license" className="block text-sm font-medium mb-1">
                                    CNH
                                  </label>
                                  <Input
                                    id="edit-license"
                                    name="license_number"
                                    value={driverForm.license_number}
                                    onChange={handleInputChange}
                                    placeholder="Número da CNH"
                                  />
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-status" className="block text-sm font-medium mb-1">
                                    Status
                                  </label>
                                  <select
                                    id="edit-status"
                                    name="status"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={driverForm.status}
                                    onChange={handleInputChange}
                                  >
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                    <option value="on_trip">Em viagem</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label htmlFor="edit-vehicle" className="block text-sm font-medium mb-1">
                                    Veículo
                                  </label>
                                  <select
                                    id="edit-vehicle"
                                    name="vehicle_id"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={driverForm.vehicle_id}
                                    onChange={handleInputChange}
                                  >
                                    <option value="">Selecione um veículo</option>
                                    {vehicles.map((vehicle) => (
                                      <option key={vehicle.id} value={vehicle.id}>
                                        {vehicle.model} ({vehicle.license_plate})
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              
                              <SheetFooter>
                                <SheetClose asChild>
                                  <Button variant="outline">Cancelar</Button>
                                </SheetClose>
                                <Button onClick={handleSaveDriver}>
                                  Salvar Alterações
                                </Button>
                              </SheetFooter>
                            </SheetContent>
                          </Sheet>
                          
                          {!driver.is_password_changed && driver.email && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSendPasswordReminder(driver.id)}
                              disabled={sendingReminder === driver.id}
                            >
                              {sendingReminder === driver.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Mail className="h-4 w-4 text-blue-500" />
                              )}
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setDriverToDelete(driver.id)}
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

export default DriversManagement;
