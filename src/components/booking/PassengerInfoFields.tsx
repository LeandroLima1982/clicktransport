
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PassengerInfoFieldsProps {
  passengerCount: number;
  passengerData: { name: string; phone: string }[];
  onPassengerDataChange: (data: { name: string; phone: string }[]) => void;
}

const PassengerInfoFields: React.FC<PassengerInfoFieldsProps> = ({ 
  passengerCount, 
  passengerData, 
  onPassengerDataChange 
}) => {
  const handleNameChange = (index: number, value: string) => {
    const newData = [...passengerData];
    if (newData[index]) {
      newData[index].name = value;
    } else {
      newData[index] = { name: value, phone: '' };
    }
    onPassengerDataChange(newData);
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newData = [...passengerData];
    if (newData[index]) {
      newData[index].phone = value;
    } else {
      newData[index] = { name: '', phone: value };
    }
    onPassengerDataChange(newData);
  };

  return (
    <div className="space-y-6">
      {Array.from({ length: passengerCount }).map((_, index) => (
        <div 
          key={index} 
          className="p-5 rounded-lg bg-[#002366]/70 border border-amber-300/30 shadow-md"
        >
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-[#002366] flex items-center justify-center font-bold mr-3">
              {index + 1}
            </div>
            <h3 className="text-white font-semibold">Passageiro {index + 1}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`passenger-name-${index}`} className="text-white">
                Nome completo
              </Label>
              <div className="relative">
                <Input
                  id={`passenger-name-${index}`}
                  placeholder="Nome do passageiro"
                  value={passengerData[index]?.name || ''}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="pl-9 bg-white/10 text-white border-amber-300/30 focus-visible:ring-amber-400"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`passenger-phone-${index}`} className="text-white">
                WhatsApp
              </Label>
              <div className="relative">
                <Input
                  id={`passenger-phone-${index}`}
                  placeholder="Número do WhatsApp"
                  value={passengerData[index]?.phone || ''}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  className="pl-9 bg-white/10 text-white border-amber-300/30 focus-visible:ring-amber-400"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PassengerInfoFields;
