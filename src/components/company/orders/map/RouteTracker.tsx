import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MapPin, AlertCircle, Timer, Award } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface RouteTrackerProps {
  orderId: string;
  originCoords: [number, number];
  destinationCoords: [number, number];
  routeDistance: number;
  routeDuration: number;
  originAddress?: string;
  destinationAddress?: string;
}

const RouteTracker: React.FC<RouteTrackerProps> = ({
  orderId,
  originCoords,
  destinationCoords,
  routeDistance,
  routeDuration,
  originAddress,
  destinationAddress
}) => {
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialDriverLocation = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('driver_locations')
          .select('*')
          .eq('order_id', orderId)
          .single();

        if (error) {
          console.error('Error fetching initial driver location:', error);
          setError('Erro ao carregar a localização do motorista.');
          return;
        }

        if (data) {
          setDriverLocation({ latitude: data.latitude, longitude: data.longitude });
        } else {
          setError('Localização do motorista não encontrada.');
        }
      } catch (error) {
        console.error('Error fetching driver location:', error);
        setError('Erro ao carregar a localização do motorista.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialDriverLocation();
  }, [orderId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rastreamento da Rota</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Carregando localização do motorista...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rastreamento da Rota</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
          {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rastreamento da Rota</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {driverLocation ? (
          <>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
               {originAddress && destinationAddress ? (
                <>
                  <span>{originAddress}</span>
                  <span> - </span>
                  <span>{destinationAddress}</span>
                </>
              ) : (
                <span>Rota não especificada</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-gray-500" />
              <span>
                {routeDuration ? `${(routeDuration / 60).toFixed(0)} minutos` : 'Calculando...'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-gray-500" />
              <span>
                {routeDistance ? `${(routeDistance / 1000).toFixed(1)} km` : 'Calculando...'}
              </span>
            </div>
            <div>
              <p>
                <strong>Latitude do Motorista:</strong> {driverLocation?.latitude}
              </p>
              <p>
                <strong>Longitude do Motorista:</strong> {driverLocation?.longitude}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-32">
            <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
            Localização do motorista não disponível.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RouteTracker;
