
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export interface CityLookupProps {
  onLocationSelect: (location: { 
    lat: number; 
    lng: number; 
    name?: string; 
    state?: string; 
    country?: string;
  }) => void;
  initialLocation?: {
    lat: number;
    lng: number;
    name: string;
  };
}

const CityLookup: React.FC<CityLookupProps> = ({ onLocationSelect, initialLocation }) => {
  const [searchQuery, setSearchQuery] = useState(initialLocation?.name || '');
  const [isSearching, setIsSearching] = useState(false);

  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

  const { data: suggestions, isLoading, refetch } = useQuery({
    queryKey: ['geocoding', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 3) return [];

      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json`;
      const url = `${endpoint}?access_token=${mapboxAccessToken}&types=place&language=pt`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch geocoding data');
      }
      
      return data.features.map((feature: any) => ({
        id: feature.id,
        name: feature.text,
        place_name: feature.place_name,
        lat: feature.center[1],
        lng: feature.center[0],
        context: feature.context
      }));
    },
    enabled: false
  });
  
  useEffect(() => {
    // If we have an initial location, don't automatically search
    if (!initialLocation && searchQuery.length >= 3) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [searchQuery, initialLocation]);
  
  const handleSearch = () => {
    if (searchQuery.length >= 3) {
      setIsSearching(true);
      refetch().finally(() => setIsSearching(false));
    }
  };
  
  const handleLocationSelect = (suggestion: any) => {
    // Parse context to extract state and country
    let state: string | undefined;
    let country: string | undefined;
    
    if (suggestion.context) {
      suggestion.context.forEach((ctx: any) => {
        if (ctx.id.startsWith('region')) {
          state = ctx.text;
        } else if (ctx.id.startsWith('country')) {
          country = ctx.text;
        }
      });
    }
    
    onLocationSelect({
      lat: suggestion.lat,
      lng: suggestion.lng,
      name: suggestion.name,
      state,
      country
    });
    
    setSearchQuery(suggestion.name);
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex space-x-2">
        <Input
          placeholder="Digite o nome da cidade..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading || isSearching}>
          {isLoading || isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </Button>
      </div>
      
      {suggestions && suggestions.length > 0 && (
        <Card className="mt-2">
          <CardContent className="p-2">
            <ul className="divide-y">
              {suggestions.map((suggestion: any) => (
                <li
                  key={suggestion.id}
                  className="py-2 px-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
                  onClick={() => handleLocationSelect(suggestion)}
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{suggestion.place_name}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {initialLocation && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>
            Localização atual: {initialLocation.name} ({initialLocation.lat.toFixed(6)}, {initialLocation.lng.toFixed(6)})
          </span>
        </div>
      )}
    </div>
  );
};

export default CityLookup;
