
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle, Phone } from 'lucide-react';

interface PassengerInfoProps {
  passengerData: { name: string; phone: string }[];
  setPassengerData: React.Dispatch<React.SetStateAction<{ name: string; phone: string }[]>>;
  passengerCount: number;
}

const PassengerInfo: React.FC<PassengerInfoProps> = ({ 
  passengerData, 
  setPassengerData, 
  passengerCount 
}) => {
  const handleInputChange = (index: number, field: 'name' | 'phone', value: string) => {
    const updatedData = [...passengerData];
    
    // If this index doesn't exist, create it
    if (!updatedData[index]) {
      updatedData[index] = { name: '', phone: '' };
    }
    
    updatedData[index][field] = value;
    setPassengerData(updatedData);
  };

  // Ensure we have enough passenger data objects
  React.useEffect(() => {
    if (passengerData.length < passengerCount) {
      const newData = [...passengerData];
      for (let i = passengerData.length; i < passengerCount; i++) {
        newData.push({ name: '', phone: '' });
      }
      setPassengerData(newData);
    }
  }, [passengerCount, passengerData, setPassengerData]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">Informações dos Passageiros</h3>
        <p className="text-sm text-gray-500">
          Forneça os dados para {passengerCount} {passengerCount === 1 ? 'passageiro' : 'passageiros'}
        </p>
      </div>

      {Array.from({ length: passengerCount }).map((_, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              {index === 0 ? 'Passageiro Principal' : `Passageiro ${index + 1}`}
            </h4>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`name-${index}`} className="flex items-center">
                <UserCircle className="w-4 h-4 mr-2 text-gray-400" />
                Nome Completo
              </Label>
              <Input
                id={`name-${index}`}
                placeholder="Digite o nome completo"
                value={passengerData[index]?.name || ''}
                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`phone-${index}`} className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                Telefone
              </Label>
              <Input
                id={`phone-${index}`}
                placeholder="(XX) XXXXX-XXXX"
                value={passengerData[index]?.phone || ''}
                onChange={(e) => handleInputChange(index, 'phone', e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PassengerInfo;
