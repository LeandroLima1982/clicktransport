
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { User, Phone } from 'lucide-react';

interface PassengerInfoFieldsProps {
  passengerCount: number;
  passengerData: {
    name: string;
    phone: string;
  }[];
  onPassengerDataChange: (data: {name: string; phone: string}[]) => void;
}

const PassengerInfoFields: React.FC<PassengerInfoFieldsProps> = ({ 
  passengerCount, 
  passengerData,
  onPassengerDataChange
}) => {
  const numPassengers = parseInt(passengerCount, 10);
  
  // Initialize or update passenger data array based on count
  React.useEffect(() => {
    const currentLength = passengerData.length;
    
    if (numPassengers > currentLength) {
      // Add new empty passengers
      const newData = [...passengerData];
      for (let i = currentLength; i < numPassengers; i++) {
        newData.push({ name: '', phone: '' });
      }
      onPassengerDataChange(newData);
    } else if (numPassengers < currentLength) {
      // Remove excess passengers
      onPassengerDataChange(passengerData.slice(0, numPassengers));
    }
  }, [numPassengers, passengerData, onPassengerDataChange]);
  
  const handleNameChange = (index: number, value: string) => {
    const newData = [...passengerData];
    newData[index] = { ...newData[index], name: value };
    onPassengerDataChange(newData);
  };
  
  const handlePhoneChange = (index: number, value: string) => {
    const newData = [...passengerData];
    newData[index] = { ...newData[index], phone: value };
    onPassengerDataChange(newData);
  };
  
  if (numPassengers <= 0) return null;
  
  return (
    <div className="mt-6 pt-6 border-t border-amber-200 space-y-5 animate-fade-in">
      <h4 className="text-lg font-semibold text-gray-800">Informações dos Passageiros</h4>
      
      {Array.from({ length: numPassengers }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-600 mr-3">
                {index + 1}
              </span>
              <h5 className="font-medium">Passageiro {index + 1}</h5>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`passenger-name-${index}`}>
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
                  <Input
                    id={`passenger-name-${index}`}
                    placeholder="Nome do passageiro"
                    className="pl-10 py-6 rounded-lg border border-gray-100 shadow-sm bg-white focus:border-amber-300 focus:ring-amber-300"
                    value={passengerData[index]?.name || ''}
                    onChange={(e) => handleNameChange(index, e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`passenger-phone-${index}`}>
                  WhatsApp
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-amber-400" />
                  <Input
                    id={`passenger-phone-${index}`}
                    placeholder="Número do WhatsApp"
                    className="pl-10 py-6 rounded-lg border border-gray-100 shadow-sm bg-white focus:border-amber-300 focus:ring-amber-300"
                    value={passengerData[index]?.phone || ''}
                    onChange={(e) => handlePhoneChange(index, e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PassengerInfoFields;
