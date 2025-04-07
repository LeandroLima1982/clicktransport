
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { fetchAddressSuggestions } from '@/utils/googlemaps';

interface CityLookupProps {
  onLocationSelected: (location: {
    name: string;
    state?: string;
    country?: string;
    latitude: number;
    longitude: number;
  }) => void;
}

const CityLookup: React.FC<CityLookupProps> = ({ onLocationSelected }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const results = await fetchAddressSuggestions(searchTerm);
      setSuggestions(results);
      
      if (results.length === 0) {
        toast({
          title: "Nenhum resultado encontrado",
          description: "Tente refinar sua busca com termos mais específicos",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar localizações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectLocation = (suggestion: any) => {
    // Extrai o nome da cidade do place_name (normalmente o primeiro componente)
    const nameParts = suggestion.place_name.split(',');
    const cityName = suggestion.text || nameParts[0].trim();
    
    // Extrai o estado (geralmente o penúltimo elemento)
    let state = '';
    if (nameParts.length > 1) {
      state = nameParts[nameParts.length - 2].trim();
    }
    
    // Extrai o país (geralmente o último elemento)
    let country = 'Brasil';
    if (nameParts.length > 2) {
      country = nameParts[nameParts.length - 1].trim();
    }
    
    const location = {
      name: cityName,
      state,
      country,
      latitude: suggestion.center?.[1] || 0,
      longitude: suggestion.center?.[0] || 0,
    };
    
    onLocationSelected(location);
    setSuggestions([]);
    setSearchTerm('');
    
    toast({
      title: "Localização selecionada",
      description: `${cityName}, ${state}`,
    });
  };

  return (
    <div className="space-y-4">
      <Label>Buscar Cidade</Label>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Digite o nome da cidade"
            className="pl-8"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading || !searchTerm.trim()}
          type="button"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Buscar
            </>
          )}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <Card>
          <CardContent className="p-2">
            <ul className="max-h-60 overflow-auto">
              {suggestions.map((suggestion, index) => (
                <li 
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer rounded flex items-start"
                  onClick={() => selectLocation(suggestion)}
                >
                  <MapPin className="h-4 w-4 mt-1 mr-2 flex-shrink-0 text-red-500" />
                  <div>
                    <div className="font-medium">{suggestion.text}</div>
                    <div className="text-sm text-gray-500">{suggestion.place_name}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CityLookup;
