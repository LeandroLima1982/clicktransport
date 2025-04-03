
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PassengerInfoFieldsProps {
  passengerCount: number;
  passengerData: {name: string; phone: string}[];
  onPassengerDataChange: (data: {name: string; phone: string}[]) => void;
}

const PassengerInfoFields: React.FC<PassengerInfoFieldsProps> = ({
  passengerCount,
  passengerData,
  onPassengerDataChange
}) => {
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

  // Ensure we have the correct number of passenger data entries
  React.useEffect(() => {
    if (passengerData.length !== passengerCount) {
      const newData = Array(passengerCount).fill(null).map((_, i) => 
        passengerData[i] || { name: '', phone: '' }
      );
      onPassengerDataChange(newData);
    }
  }, [passengerCount, passengerData, onPassengerDataChange]);

  return (
    <div className="space-y-4">
      {Array.from({ length: passengerCount }).map((_, index) => (
        <div key={index} className="border border-amber-300/30 rounded-md p-4 bg-[#002366]/30">
          <h4 className="text-amber-300 font-semibold mb-3">Passageiro {index + 1}</h4>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`passenger-name-${index}`} className="text-white">
                Nome completo
              </Label>
              <Input
                id={`passenger-name-${index}`}
                value={passengerData[index]?.name || ''}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder="Nome do passageiro"
                className="bg-[#002366]/50 border-amber-300/30 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`passenger-phone-${index}`} className="text-white">
                WhatsApp
              </Label>
              <Input
                id={`passenger-phone-${index}`}
                value={passengerData[index]?.phone || ''}
                onChange={(e) => handlePhoneChange(index, e.target.value)}
                placeholder="(00) 00000-0000"
                className="bg-[#002366]/50 border-amber-300/30 text-white"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PassengerInfoFields;
