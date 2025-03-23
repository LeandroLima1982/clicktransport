
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPinIcon, PlusIcon, SearchIcon, TrashIcon, PencilIcon, SaveIcon, XIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDestinationsService } from '@/hooks/useDestinationsService';
import CityForm from './CityForm';
import DistanceCalculator from './DistanceCalculator';

const DestinationManagement = () => {
  const { toast } = useToast();
  const { 
    cities, 
    loading, 
    error, 
    addCity, 
    updateCity, 
    deleteCity,
    fetchCities
  } = useDestinationsService();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('cities');

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  const filteredCities = cities.filter(city => 
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCity = async (cityData: any) => {
    try {
      await addCity(cityData);
      setShowForm(false);
      toast({
        title: "Cidade adicionada",
        description: `${cityData.name} foi adicionada com sucesso.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao adicionar cidade",
        description: "Ocorreu um erro ao adicionar a cidade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCity = async (cityData: any) => {
    try {
      await updateCity(cityData);
      setSelectedCity(null);
      toast({
        title: "Cidade atualizada",
        description: `${cityData.name} foi atualizada com sucesso.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao atualizar cidade",
        description: "Ocorreu um erro ao atualizar a cidade. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCity = async (city: any) => {
    if (window.confirm(`Tem certeza que deseja excluir ${city.name}?`)) {
      try {
        await deleteCity(city.id);
        toast({
          title: "Cidade excluída",
          description: `${city.name} foi excluída com sucesso.`,
        });
      } catch (err) {
        toast({
          title: "Erro ao excluir cidade",
          description: "Ocorreu um erro ao excluir a cidade. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-500">Erro ao carregar cidades: {error.message}</p>
            <Button onClick={fetchCities} className="mt-4">Tentar novamente</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Gerenciamento de Destinos</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs 
          defaultValue="cities" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cities">Cidades</TabsTrigger>
            <TabsTrigger value="distances">Calcular Distâncias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="cities" className="mt-4">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-sm">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar cidades..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button onClick={() => {
                setSelectedCity(null);
                setShowForm(true);
              }} className="ml-4">
                <PlusIcon className="mr-2 h-4 w-4" />
                Nova Cidade
              </Button>
            </div>

            {/* Formulário para adicionar/editar cidade */}
            {showForm && (
              <Card className="mb-6 border border-blue-200 bg-blue-50">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">
                      {selectedCity ? 'Editar Cidade' : 'Adicionar Nova Cidade'}
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowForm(false)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <CityForm 
                    initialData={selectedCity} 
                    onSubmit={selectedCity ? handleUpdateCity : handleAddCity}
                    onCancel={() => setShowForm(false)}
                  />
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="flex justify-center my-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Nenhuma cidade encontrada com esse termo.' : 'Nenhuma cidade cadastrada.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>País</TableHead>
                      <TableHead>Coordenadas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCities.map((city) => (
                      <TableRow key={city.id}>
                        <TableCell className="font-medium">{city.name}</TableCell>
                        <TableCell>{city.state || '-'}</TableCell>
                        <TableCell>{city.country || 'Brasil'}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1 text-red-500" />
                            <span>{city.latitude.toFixed(6)}, {city.longitude.toFixed(6)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={city.is_active ? "default" : "secondary"}>
                            {city.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCity(city);
                              setShowForm(true);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCity(city)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="distances" className="mt-4">
            <DistanceCalculator cities={cities} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DestinationManagement;
