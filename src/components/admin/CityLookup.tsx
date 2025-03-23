
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface GeocodingResult {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  place_type: string[];
  relevance: number;
}

interface CityLookupProps {
  onSelectLocation: (name: string, lat: number, lng: number) => void;
}

const CityLookup: React.FC<CityLookupProps> = ({ onSelectLocation }) => {
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const searchForLocation = async () => {
    if (!searchText.trim()) {
      toast.error('Por favor, insira um nome de cidade válido');
      return;
    }

    setIsSearching(true);
    try {
      // Using Mapbox Geocoding API
      const mapboxToken = 'pk.eyJ1IjoibWFyY2Vsb3NhbiIsImEiOiJjbHl2MHRmYTQwZXVhMm5udW80aDBkZWhvIn0.06-sNaqmzfxuANwIFNt7yw';
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?access_token=${mapboxToken}&country=br&types=place&language=pt`
      );
      
      if (!response.ok) {
        throw new Error('Falha na busca de localização');
      }
      
      const data = await response.json();
      setResults(data.features || []);
      
      if (data.features.length === 0) {
        toast.warning('Nenhum resultado encontrado');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      toast.error('Erro ao buscar localização');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (result: GeocodingResult) => {
    const [longitude, latitude] = result.center;
    const cityName = result.place_name.split(',')[0].trim();
    
    onSelectLocation(cityName, latitude, longitude);
    setIsDialogOpen(false);
    setSearchText('');
    setResults([]);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <MapPin className="h-4 w-4 mr-2" />
          Buscar Coordenadas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Buscar Coordenadas da Cidade</DialogTitle>
          <DialogDescription>
            Pesquise a cidade para obter suas coordenadas geográficas precisas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="location-search" className="mb-2 block">Nome da Cidade</Label>
              <Input
                id="location-search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Ex: Rio de Janeiro"
                onKeyDown={(e) => e.key === 'Enter' && searchForLocation()}
              />
            </div>
            <Button 
              onClick={searchForLocation} 
              disabled={isSearching}
              className="mb-0"
            >
              {isSearching ? (
                <span className="animate-spin mr-2">◌</span>
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Buscar
            </Button>
          </div>
          
          {results.length > 0 && (
            <div className="border rounded-md overflow-hidden mt-4">
              <div className="bg-muted px-4 py-2 border-b">
                <h3 className="text-sm font-medium">Resultados da Busca</h3>
              </div>
              <div className="divide-y max-h-[300px] overflow-y-auto">
                {results.map((result) => (
                  <div 
                    key={result.id}
                    className="px-4 py-3 hover:bg-muted transition-colors cursor-pointer flex justify-between items-center"
                    onClick={() => handleSelectLocation(result)}
                  >
                    <div>
                      <div className="font-medium">{result.place_name.split(',')[0]}</div>
                      <div className="text-sm text-muted-foreground">{result.place_name.substring(result.place_name.indexOf(',') + 1).trim()}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {result.center[1].toFixed(6)}, {result.center[0].toFixed(6)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CityLookup;
