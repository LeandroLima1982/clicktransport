
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon, PhoneIcon } from 'lucide-react';
import TransitionEffect from '@/components/TransitionEffect';

interface PassengerData {
  name: string;
  phone: string;
}

interface PassengerInfoProps {
  passengerData: PassengerData[];
  setPassengerData: React.Dispatch<React.SetStateAction<PassengerData[]>>;
  passengerCount: number;
}

const PassengerInfo: React.FC<PassengerInfoProps> = ({
  passengerData,
  setPassengerData,
  passengerCount
}) => {
  const handleChange = (index: number, field: keyof PassengerData, value: string) => {
    const newData = [...passengerData];
    
    // Ensure we have an entry for this passenger
    if (!newData[index]) {
      newData[index] = { name: '', phone: '' };
    }
    
    newData[index][field] = value;
    setPassengerData(newData);
  };

  // Ensure we have enough passenger entries in our data array
  React.useEffect(() => {
    if (passengerData.length < passengerCount) {
      const newData = [...passengerData];
      
      // Add empty passenger entries up to the required count
      for (let i = passengerData.length; i < passengerCount; i++) {
        newData.push({ name: '', phone: '' });
      }
      
      setPassengerData(newData);
    }
  }, [passengerCount, passengerData, setPassengerData]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Informações dos Passageiros</h3>
        <p className="text-gray-500 text-sm">
          Por favor, forneça as informações de contato para {passengerCount} passageiro(s).
        </p>
      </div>

      {Array.from({ length: passengerCount }).map((_, index) => (
        <TransitionEffect key={index} delay={index * 100} direction="up">
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="font-medium text-sm text-gray-500 mb-3">
                Passageiro {index + 1}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor={`passenger-name-${index}`} className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    Nome
                  </Label>
                  <Input
                    id={`passenger-name-${index}`}
                    placeholder="Nome completo"
                    value={passengerData[index]?.name || ''}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`passenger-phone-${index}`} className="flex items-center">
                    <PhoneIcon className="h-4 w-4 mr-1" />
                    Telefone
                  </Label>
                  <Input
                    id={`passenger-phone-${index}`}
                    placeholder="(00) 00000-0000"
                    value={passengerData[index]?.phone || ''}
                    onChange={(e) => handleChange(index, 'phone', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número que será usado para contato se necessário
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TransitionEffect>
      ))}
    </div>
  );
};

export default PassengerInfo;
