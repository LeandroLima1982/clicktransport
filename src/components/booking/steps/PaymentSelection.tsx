
import React, { useState, useEffect } from 'react';
import { Check, CreditCard, QrCode, Building, Landmark } from 'lucide-react';
import { Vehicle } from './VehicleSelection';
import { supabase } from '@/integrations/supabase/client';
import { VehicleRate } from '@/utils/routeUtils';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

interface PaymentSelectionProps {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string | null;
  onSelectPaymentMethod: (id: string) => void;
  selectedVehicle: Vehicle | undefined;
  estimatedDistance: number;
  bookingData: {
    tripType: string;
    passengerData?: {
      name: string;
      phone: string;
    }[];
  };
  totalPrice: number;
  formatCurrency: (value: number) => string;
}

const PaymentSelection: React.FC<PaymentSelectionProps> = ({
  paymentMethods,
  selectedPaymentMethod,
  onSelectPaymentMethod,
  selectedVehicle,
  estimatedDistance,
  bookingData,
  totalPrice,
  formatCurrency
}) => {
  const [vehicleRates, setVehicleRates] = useState<VehicleRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchVehicleRates();
  }, []);

  const fetchVehicleRates = async () => {
    setIsLoading(true);
    try {
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
        setVehicleRates(mappedData);
      } else {
        // Use default rates if none found in database
        setVehicleRates([
          { id: 'sedan', name: 'Sedan Executivo', basePrice: 79.90, pricePerKm: 2.10, capacity: 5 },
          { id: 'suv', name: 'SUV Premium', basePrice: 119.90, pricePerKm: 2.49, capacity: 7 },
          { id: 'van', name: 'Van Executiva', basePrice: 199.90, pricePerKm: 3.39, capacity: 10 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching vehicle rates:', error);
      // Set default values on error
      setVehicleRates([
        { id: 'sedan', name: 'Sedan Executivo', basePrice: 79.90, pricePerKm: 2.10, capacity: 5 },
        { id: 'suv', name: 'SUV Premium', basePrice: 119.90, pricePerKm: 2.49, capacity: 7 },
        { id: 'van', name: 'Van Executiva', basePrice: 199.90, pricePerKm: 3.39, capacity: 10 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine default capacity based on vehicle type
  const getDefaultCapacity = (vehicleId: string): number => {
    switch (vehicleId) {
      case 'sedan': return 5;
      case 'suv': return 7;
      case 'van': return 10;
      default: return 5;
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return <CreditCard className="h-5 w-5" />;
      case 'qr-code':
        return <QrCode className="h-5 w-5" />;
      case 'building':
        return <Building className="h-5 w-5" />;
      case 'bank':
        return <Landmark className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  // Find vehicle rate based on selected vehicle
  const getVehicleRate = () => {
    if (!selectedVehicle) return null;
    return vehicleRates.find(rate => rate.id === selectedVehicle.id) || null;
  };

  const vehicleRate = getVehicleRate();
  const basePrice = vehicleRate?.basePrice || (selectedVehicle?.basePrice || 0);
  const pricePerKm = vehicleRate?.pricePerKm || (selectedVehicle?.pricePerKm || 0);
  
  // Calculate price components
  const distancePrice = pricePerKm * estimatedDistance;
  const subtotal = basePrice + distancePrice;
  const oneWayPrice = bookingData.tripType === 'roundtrip' ? totalPrice / 2 : totalPrice;
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Escolha a forma de pagamento</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPaymentMethod === method.id ? 'border-primary bg-primary/5' : 'border-gray-200'
            }`}
            onClick={() => onSelectPaymentMethod(method.id)}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${
                selectedPaymentMethod === method.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {renderIcon(method.icon)}
              </div>
              <div>
                <div className="font-medium">{method.name}</div>
              </div>
              {selectedPaymentMethod === method.id && (
                <Check className="ml-auto h-5 w-5 text-primary" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {bookingData.passengerData && bookingData.passengerData.length > 0 && (
        <div className="border rounded-lg p-4 mt-6">
          <h4 className="font-medium mb-2">Detalhes dos Passageiros</h4>
          <div className="space-y-3">
            {bookingData.passengerData.map((passenger, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-md">
                <div className="font-medium">Passageiro {index + 1}: {passenger.name}</div>
                <div className="text-sm text-gray-500">WhatsApp: {passenger.phone}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 p-4 rounded-lg mt-6">
        <h4 className="font-medium mb-2">Resumo de valores</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tarifa base ({selectedVehicle?.name})</span>
            <span>{formatCurrency(basePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Distância ({estimatedDistance} km x {formatCurrency(pricePerKm)}/km)</span>
            <span>{formatCurrency(distancePrice)}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 mt-2 border-t">
            <span className="font-medium">Subtotal por trecho:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          {bookingData.tripType === 'roundtrip' && (
            <>
              <div className="flex justify-between text-sm">
                <span>Valor da ida:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Valor da volta:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </>
          )}
          <div className="border-t pt-2 mt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(bookingData.tripType === 'roundtrip' ? subtotal * 2 : subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelection;
