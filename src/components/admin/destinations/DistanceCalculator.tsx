
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Route, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { calculateRoute } from '@/utils/routeUtils';
import { useDestinationsService } from '@/hooks/useDestinationsService';

interface City {
  id: string;
  name: string;
  state?: string;
  latitude: number;
  longitude: number;
  is_active?: boolean;
}

interface DistanceCalculatorProps {
  cities: City[];
}

const DistanceCalculator: React.FC<DistanceCalculatorProps> = ({ cities }) => {
  const { toast } = useToast();
  const { getDistanceBetweenCities, saveDistanceBetweenCities } = useDestinationsService();
  const [originCityId, setOriginCityId] = useState<string>('');
  const [destinationCityId, setDestinationCityId] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [hasStoredDistance, setHasStoredDistance] = useState(false);

  const activeCities = cities.filter(city => city.is_active !== false);

  const resetResults = () => {
    setDistance(null);
    setDuration(null);
    setHasStoredDistance(false);
  };

  useEffect(() => {
    resetResults();
    
    // Check if there's already a stored distance between the selected cities
    const checkStoredDistance = async () => {
      if (originCityId && destinationCityId) {
        try {
          const distanceData = await getDistanceBetweenCities(originCityId, destinationCityId);
          if (distanceData) {
            setDistance(distanceData.distance);
            setDuration(distanceData.duration);
            setHasStoredDistance(true);
            
            toast({
              title: "Distância existente",
              description: "Usando distância já calculada anteriormente",
            });
          } else {
            setHasStoredDistance(false);
          }
        } catch (error) {
          console.error("Error checking stored distance:", error);
        }
      }
    };
    
    checkStoredDistance();
  }, [originCityId, destinationCityId, getDistanceBetweenCities]);

  const handleCalculate = async () => {
    if (!originCityId || !destinationCityId) {
      toast({
        title: "Seleção incompleta",
        description: "Selecione as cidades de origem e destino",
        variant: "destructive",
      });
      return;
    }

    const originCity = cities.find(city => city.id === originCityId);
    const destinationCity = cities.find(city => city.id === destinationCityId);

    if (!originCity || !destinationCity) {
      toast({
        title: "Erro",
        description: "Cidade não encontrada",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    resetResults();

    try {
      // Use city coordinates for more accurate route calculation
      const originCoords = `${originCity.longitude},${originCity.latitude}`;
      const destinationCoords = `${destinationCity.longitude},${destinationCity.latitude}`;
      
      const routeInfo = await calculateRoute(originCoords, destinationCoords);
      
      if (routeInfo) {
        setDistance(routeInfo.distance);
        setDuration(routeInfo.duration);
        setHasStoredDistance(false);
        
        toast({
          title: "Cálculo concluído",
          description: `Distância: ${routeInfo.distance.toFixed(2)}km, Tempo: ${Math.round(routeInfo.duration)}min`,
        });
      } else {
        toast({
          title: "Erro no cálculo",
          description: "Não foi possível calcular a rota entre as cidades",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao calcular a distância. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveDistance = async () => {
    if (!originCityId || !destinationCityId || distance === null || duration === null) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      await saveDistanceBetweenCities(originCityId, destinationCityId, distance, duration);
      setHasStoredDistance(true);
      
      toast({
        title: "Distância salva",
        description: "A distância entre as cidades foi salva com sucesso",
      });
    } catch (error) {
      console.error("Error saving distance:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a distância entre as cidades",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCityLabel = (city: City) => {
    return `${city.name}${city.state ? `, ${city.state}` : ''}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Calcular Distância entre Cidades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="origin-city">Cidade de Origem</Label>
            <Select
              value={originCityId}
              onValueChange={setOriginCityId}
            >
              <SelectTrigger id="origin-city">
                <SelectValue placeholder="Selecione a cidade de origem" />
              </SelectTrigger>
              <SelectContent>
                {activeCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {formatCityLabel(city)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination-city">Cidade de Destino</Label>
            <Select
              value={destinationCityId}
              onValueChange={setDestinationCityId}
            >
              <SelectTrigger id="destination-city">
                <SelectValue placeholder="Selecione a cidade de destino" />
              </SelectTrigger>
              <SelectContent>
                {activeCities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {formatCityLabel(city)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-center gap-3">
          <Button 
            onClick={handleCalculate} 
            disabled={isCalculating || !originCityId || !destinationCityId}
            className="w-full md:w-auto"
          >
            {isCalculating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Route className="mr-2 h-4 w-4" />
                Calcular Distância
              </>
            )}
          </Button>
          
          {distance !== null && duration !== null && !hasStoredDistance && (
            <Button 
              onClick={handleSaveDistance} 
              variant="outline"
              disabled={isSaving}
              className="w-full md:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Distância
                </>
              )}
            </Button>
          )}
        </div>
        
        {(distance !== null || duration !== null) && (
          <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
            <h3 className="font-semibold mb-2 flex items-center">
              <Route className="mr-2 h-5 w-5 text-blue-500" />
              Resultados do Cálculo
              {hasStoredDistance && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  Distância armazenada
                </span>
              )}
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              {distance !== null && (
                <div>
                  <Label className="text-sm text-gray-500">Distância:</Label>
                  <p className="text-xl font-bold">{distance.toFixed(2)} km</p>
                </div>
              )}
              
              {duration !== null && (
                <div>
                  <Label className="text-sm text-gray-500">Tempo estimado:</Label>
                  <p className="text-xl font-bold">
                    {Math.floor(duration / 60) > 0 ? `${Math.floor(duration / 60)}h ` : ''}
                    {Math.round(duration % 60)}min
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeCities.length < 2 && (
          <div className="text-center py-4 text-amber-600">
            É necessário cadastrar pelo menos duas cidades para calcular distâncias.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DistanceCalculator;
