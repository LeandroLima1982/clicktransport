
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from 'sonner';
import { Loader2, Save, Users, DollarSign, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useForm } from 'react-hook-form';
import { VehicleRate } from '@/utils/routeUtils';

interface RatesFormValues {
  vehicles: VehicleRate[];
}

const TripRateSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<RatesFormValues>({
    defaultValues: {
      vehicles: []
    }
  });

  useEffect(() => {
    fetchVehicleRates();
  }, []);

  const fetchVehicleRates = async () => {
    setIsLoading(true);
    try {
      // Fetch the current vehicle rates from the database
      const { data, error } = await supabase
        .from('vehicle_rates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map database column names to our interface
        const mappedData = data.map(item => ({
          id: item.id,
          name: item.name,
          basePrice: item.baseprice,
          pricePerKm: item.priceperkm,
          capacity: item.capacity || getDefaultCapacity(item.id)
        }));
        form.reset({ vehicles: mappedData });
      } else {
        // If no rates exist yet, initialize with default values
        const defaultRates = [
          { id: 'sedan', name: 'Sedan Executivo', basePrice: 79.90, pricePerKm: 2.10, capacity: 4 },
          { id: 'suv', name: 'SUV Premium', basePrice: 119.90, pricePerKm: 2.49, capacity: 6 },
          { id: 'van', name: 'Van Executiva', basePrice: 199.90, pricePerKm: 3.39, capacity: 10 }
        ];
        form.reset({ vehicles: defaultRates });
      }
    } catch (error) {
      console.error('Error fetching vehicle rates:', error);
      toast.error('Erro ao carregar taxas de veículos');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDefaultCapacity = (vehicleId: string): number => {
    switch (vehicleId) {
      case 'sedan': return 4;
      case 'suv': return 6;
      case 'van': return 10;
      default: return 4;
    }
  };

  const onSubmit = async (values: RatesFormValues) => {
    setIsSaving(true);
    try {
      // For each vehicle rate, upsert it to the database
      for (const vehicle of values.vehicles) {
        // Map our interface properties to database column names
        const { error } = await supabase
          .from('vehicle_rates')
          .upsert({
            id: vehicle.id,
            name: vehicle.name,
            baseprice: vehicle.basePrice,
            priceperkm: vehicle.pricePerKm,
            capacity: vehicle.capacity || getDefaultCapacity(vehicle.id)
          }, { onConflict: 'id' });
        
        if (error) throw error;
      }
      
      toast.success('Taxas de veículos atualizadas com sucesso');
    } catch (error) {
      console.error('Error saving vehicle rates:', error);
      toast.error('Erro ao salvar taxas de veículos');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Taxas de Viagem</CardTitle>
        <CardDescription>
          Ajuste os valores base e taxas por quilômetro para cada tipo de veículo
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {form.watch('vehicles').map((vehicle, index) => (
                <div key={vehicle.id} className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-3">{vehicle.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`basePrice-${index}`} className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" /> 
                        Preço Base (R$)
                      </Label>
                      <Input
                        id={`basePrice-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={vehicle.basePrice}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value);
                          const vehicles = form.getValues('vehicles');
                          vehicles[index].basePrice = newValue;
                          form.setValue('vehicles', vehicles);
                        }}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Valor base para cada corrida, independente da distância
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`pricePerKm-${index}`} className="flex items-center">
                        <Percent className="h-4 w-4 mr-1" />
                        Taxa por Km (R$)
                      </Label>
                      <Input
                        id={`pricePerKm-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={vehicle.pricePerKm}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value);
                          const vehicles = form.getValues('vehicles');
                          vehicles[index].pricePerKm = newValue;
                          form.setValue('vehicles', vehicles);
                        }}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Valor cobrado por quilômetro percorrido
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`capacity-${index}`} className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Capacidade (passageiros)
                      </Label>
                      <Input
                        id={`capacity-${index}`}
                        type="number"
                        step="1"
                        min="1"
                        max="20"
                        value={vehicle.capacity || getDefaultCapacity(vehicle.id)}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value);
                          const vehicles = form.getValues('vehicles');
                          vehicles[index].capacity = newValue;
                          form.setValue('vehicles', vehicles);
                        }}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Número máximo de passageiros para este veículo
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving || isLoading}
                  className="flex gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default TripRateSettings;
