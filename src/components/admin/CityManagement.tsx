import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, RefreshCw, PlusCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cityService, City, CityInput } from '@/services/db/cityService';
import CityLookup from './CityLookup';

const CityManagement: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  
  const [cityForm, setCityForm] = useState<CityInput>({
    name: '',
    state: '',
    country: 'Brasil',
    latitude: 0,
    longitude: 0,
    is_active: true
  });

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = cities.filter(city => 
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (city.state && city.state.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchTerm, cities]);

  const fetchCities = async () => {
    setIsLoading(true);
    try {
      const data = await cityService.getAllCities();
      setCities(data);
      setFilteredCities(data);
    } catch (error) {
      toast.error('Erro ao carregar cidades');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCity = () => {
    setCityForm({
      name: '',
      state: '',
      country: 'Brasil',
      latitude: 0,
      longitude: 0,
      is_active: true
    });
    setShowAddDialog(true);
  };

  const handleEditCity = (city: City) => {
    setSelectedCity(city);
    setCityForm({
      name: city.name,
      state: city.state || '',
      country: city.country || 'Brasil',
      latitude: city.latitude,
      longitude: city.longitude,
      is_active: city.is_active
    });
    setShowEditDialog(true);
  };

  const handleSaveCity = async () => {
    try {
      if (!cityForm.name || !cityForm.latitude || !cityForm.longitude) {
        toast.error('Por favor, preencha todos os campos obrigatórios');
        return;
      }

      if (showAddDialog) {
        await cityService.createCity(cityForm);
        toast.success('Cidade adicionada com sucesso');
        setShowAddDialog(false);
      } else if (showEditDialog && selectedCity) {
        await cityService.updateCity(selectedCity.id, cityForm);
        toast.success('Cidade atualizada com sucesso');
        setShowEditDialog(false);
      }
      
      fetchCities();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar cidade');
      console.error(error);
    }
  };

  const handleToggleStatus = async (city: City) => {
    try {
      await cityService.toggleCityStatus(city.id, !city.is_active);
      toast.success(`Cidade ${!city.is_active ? 'ativada' : 'desativada'} com sucesso`);
      fetchCities();
    } catch (error) {
      toast.error('Erro ao alterar status da cidade');
      console.error(error);
    }
  };

  const handleDeleteCity = async (city: City) => {
    if (confirm(`Tem certeza que deseja excluir a cidade ${city.name}?`)) {
      try {
        await cityService.deleteCity(city.id);
        toast.success('Cidade excluída com sucesso');
        fetchCities();
      } catch (error) {
        toast.error('Erro ao excluir cidade');
        console.error(error);
      }
    }
  };

  const handleLocationSelect = (name: string, lat: number, lng: number) => {
    setCityForm({
      ...cityForm,
      name,
      latitude: lat,
      longitude: lng
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Gestão de Cidades
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie as cidades disponíveis para reservas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchCities}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleAddCity}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Cidade
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cidade..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="text-lg font-medium">Nenhuma cidade encontrada</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm ? 'Tente uma busca diferente ou ' : ''}
              <Button variant="link" className="p-0 h-auto" onClick={handleAddCity}>
                adicione uma nova cidade
              </Button>
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Coordenadas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCities.map((city) => (
                  <TableRow key={city.id}>
                    <TableCell className="font-medium">{city.name}</TableCell>
                    <TableCell>{city.state || '-'}</TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        Lat: {city.latitude.toFixed(6)}, Lng: {city.longitude.toFixed(6)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={city.is_active ? "success" : "secondary"}
                        className={city.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                      >
                        {city.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditCity(city)}>
                          Editar
                        </Button>
                        <Switch
                          checked={city.is_active}
                          onCheckedChange={() => handleToggleStatus(city)}
                        />
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteCity(city)}>
                          Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Cidade</DialogTitle>
              <DialogDescription>
                Preencha as informações da nova cidade. As coordenadas geográficas são necessárias para cálculos de distância.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Cidade*</Label>
                  <Input
                    id="name"
                    value={cityForm.name}
                    onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                    placeholder="Ex: Rio de Janeiro"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={cityForm.state}
                    onChange={(e) => setCityForm({ ...cityForm, state: e.target.value })}
                    placeholder="Ex: RJ"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Coordenadas*</Label>
                  <div className="flex items-center gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        value={cityForm.latitude}
                        onChange={(e) => setCityForm({ ...cityForm, latitude: parseFloat(e.target.value) })}
                        placeholder="Latitude"
                      />
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        value={cityForm.longitude}
                        onChange={(e) => setCityForm({ ...cityForm, longitude: parseFloat(e.target.value) })}
                        placeholder="Longitude"
                      />
                    </div>
                    <CityLookup onSelectLocation={handleLocationSelect} />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-active"
                    checked={cityForm.is_active}
                    onCheckedChange={(checked) => setCityForm({ ...cityForm, is_active: checked })}
                  />
                  <Label htmlFor="is-active">Cidade Ativa</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
              <Button onClick={handleSaveCity}>Salvar Cidade</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Cidade</DialogTitle>
              <DialogDescription>
                Atualize as informações da cidade.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nome da Cidade*</Label>
                  <Input
                    id="edit-name"
                    value={cityForm.name}
                    onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-state">Estado</Label>
                  <Input
                    id="edit-state"
                    value={cityForm.state}
                    onChange={(e) => setCityForm({ ...cityForm, state: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Coordenadas*</Label>
                  <div className="flex items-center gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <Input
                        id="edit-latitude"
                        type="number"
                        step="0.000001"
                        value={cityForm.latitude}
                        onChange={(e) => setCityForm({ ...cityForm, latitude: parseFloat(e.target.value) })}
                        placeholder="Latitude"
                      />
                      <Input
                        id="edit-longitude"
                        type="number"
                        step="0.000001"
                        value={cityForm.longitude}
                        onChange={(e) => setCityForm({ ...cityForm, longitude: parseFloat(e.target.value) })}
                        placeholder="Longitude"
                      />
                    </div>
                    <CityLookup onSelectLocation={handleLocationSelect} />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is-active"
                    checked={cityForm.is_active}
                    onCheckedChange={(checked) => setCityForm({ ...cityForm, is_active: checked })}
                  />
                  <Label htmlFor="edit-is-active">Cidade Ativa</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
              <Button onClick={handleSaveCity}>Atualizar Cidade</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default CityManagement;
