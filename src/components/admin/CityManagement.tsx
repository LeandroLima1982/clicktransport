
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Pencil, Trash2, MapPin, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { cityService, City, CityInput } from '@/services/db/cityService';
import CityLookup from './CityLookup';

const CityManagement: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [newCity, setNewCity] = useState<CityInput>({
    name: '',
    state: '',
    country: 'Brasil',
    latitude: 0,
    longitude: 0,
    is_active: true
  });

  const queryClient = useQueryClient();

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: cityService.getAllCities
  });

  const createCityMutation = useMutation({
    mutationFn: cityService.createCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('Cidade adicionada com sucesso!');
      setIsAddDialogOpen(false);
      resetNewCity();
    },
    onError: (error) => {
      console.error('Error creating city:', error);
      toast.error('Erro ao adicionar cidade.');
    }
  });

  const updateCityMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CityInput> }) => 
      cityService.updateCity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('Cidade atualizada com sucesso!');
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating city:', error);
      toast.error('Erro ao atualizar cidade.');
    }
  });

  const deleteCityMutation = useMutation({
    mutationFn: (id: string) => cityService.deleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success('Cidade removida com sucesso!');
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error deleting city:', error);
      toast.error('Erro ao remover cidade.');
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      cityService.toggleCityStatus(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
      toast.success(`Cidade ${data.is_active ? 'ativada' : 'desativada'} com sucesso!`);
    },
    onError: (error) => {
      console.error('Error toggling city status:', error);
      toast.error('Erro ao alterar status da cidade.');
    }
  });

  const handleAddCity = () => {
    if (!newCity.name || !newCity.latitude || !newCity.longitude) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    createCityMutation.mutate(newCity);
  };

  const handleUpdateCity = () => {
    if (!selectedCity) return;
    
    updateCityMutation.mutate({ 
      id: selectedCity.id, 
      data: {
        name: selectedCity.name,
        state: selectedCity.state || undefined,
        country: selectedCity.country || undefined,
        latitude: selectedCity.latitude,
        longitude: selectedCity.longitude,
      } 
    });
  };

  const handleDeleteCity = () => {
    if (!selectedCity) return;
    deleteCityMutation.mutate(selectedCity.id);
  };

  const handleToggleStatus = (city: City) => {
    toggleStatusMutation.mutate({ 
      id: city.id, 
      isActive: !city.is_active 
    });
  };

  const resetNewCity = () => {
    setNewCity({
      name: '',
      state: '',
      country: 'Brasil',
      latitude: 0,
      longitude: 0,
      is_active: true
    });
  };

  const openEditDialog = (city: City) => {
    setSelectedCity(city);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (city: City) => {
    setSelectedCity(city);
    setIsDeleteDialogOpen(true);
  };

  const handleMapLocationSelect = (location: { lat: number; lng: number; name?: string; state?: string; country?: string }) => {
    setNewCity({
      ...newCity,
      latitude: location.lat,
      longitude: location.lng,
      name: location.name || newCity.name,
      state: location.state || newCity.state,
      country: location.country || newCity.country || 'Brasil'
    });
  };

  const handleEditMapLocationSelect = (location: { lat: number; lng: number; name?: string; state?: string; country?: string }) => {
    if (selectedCity) {
      setSelectedCity({
        ...selectedCity,
        latitude: location.lat,
        longitude: location.lng,
        name: location.name || selectedCity.name,
        state: location.state || selectedCity.state,
        country: location.country || selectedCity.country || 'Brasil'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Cidades Disponíveis</h3>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Cidade
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-10">Carregando cidades...</div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {cities.map((city) => (
            <div 
              key={city.id}
              className={`p-4 rounded-lg border ${city.is_active ? 'bg-white' : 'bg-gray-50'}`}
            >
              <div className="flex justify-between">
                <h4 className="font-semibold text-lg">{city.name}</h4>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => openEditDialog(city)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => openDeleteDialog(city)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant={city.is_active ? "secondary" : "outline"}
                    size="icon" 
                    onClick={() => handleToggleStatus(city)}
                  >
                    {city.is_active ? 
                      <ToggleRight className="h-4 w-4" /> : 
                      <ToggleLeft className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                {city.state && <div>{city.state}, {city.country || 'Brasil'}</div>}
                <div className="flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>
                    {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add City Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Cidade</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Label htmlFor="city-lookup">Buscar cidade no mapa</Label>
            <CityLookup onLocationSelect={handleMapLocationSelect} />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Cidade *</Label>
                <Input 
                  id="name" 
                  value={newCity.name} 
                  onChange={(e) => setNewCity({...newCity, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input 
                  id="state" 
                  value={newCity.state || ''} 
                  onChange={(e) => setNewCity({...newCity, state: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input 
                  id="latitude" 
                  type="number" 
                  step="0.000001"
                  value={newCity.latitude} 
                  onChange={(e) => setNewCity({...newCity, latitude: parseFloat(e.target.value)})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input 
                  id="longitude" 
                  type="number" 
                  step="0.000001"
                  value={newCity.longitude} 
                  onChange={(e) => setNewCity({...newCity, longitude: parseFloat(e.target.value)})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddCity}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit City Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Cidade</DialogTitle>
          </DialogHeader>
          
          {selectedCity && (
            <div className="grid gap-4 py-4">
              <Label htmlFor="edit-city-lookup">Ajustar localização no mapa</Label>
              <CityLookup 
                initialLocation={{ 
                  lat: selectedCity.latitude, 
                  lng: selectedCity.longitude,
                  name: selectedCity.name
                }} 
                onLocationSelect={handleEditMapLocationSelect} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome da Cidade *</Label>
                  <Input 
                    id="edit-name" 
                    value={selectedCity.name} 
                    onChange={(e) => setSelectedCity({...selectedCity, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-state">Estado</Label>
                  <Input 
                    id="edit-state" 
                    value={selectedCity.state || ''} 
                    onChange={(e) => setSelectedCity({...selectedCity, state: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-latitude">Latitude *</Label>
                  <Input 
                    id="edit-latitude" 
                    type="number" 
                    step="0.000001"
                    value={selectedCity.latitude} 
                    onChange={(e) => setSelectedCity({...selectedCity, latitude: parseFloat(e.target.value)})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-longitude">Longitude *</Label>
                  <Input 
                    id="edit-longitude" 
                    type="number" 
                    step="0.000001"
                    value={selectedCity.longitude} 
                    onChange={(e) => setSelectedCity({...selectedCity, longitude: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdateCity}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete City Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Tem certeza que deseja excluir a cidade {selectedCity?.name}?</p>
            <p className="text-sm text-gray-500 mt-2">Esta ação não poderá ser desfeita.</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteCity}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CityManagement;
