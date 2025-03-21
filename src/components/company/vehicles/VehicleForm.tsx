
import React from 'react';
import { Input } from "@/components/ui/input";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { VehicleForm as VehicleFormType } from './types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleFormProps {
  isEditing: boolean;
  vehicleForm: VehicleFormType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSaveVehicle: () => Promise<void>;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  isEditing,
  vehicleForm,
  handleInputChange,
  handleSaveVehicle
}) => {
  const handleStatusChange = (value: string) => {
    // Create a synthetic event to work with existing handleInputChange
    const syntheticEvent = {
      target: {
        name: 'status',
        value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleInputChange(syntheticEvent);
  };

  return (
    <>
      <SheetHeader>
        <SheetTitle>{isEditing ? 'Editar Veículo' : 'Cadastrar Veículo'}</SheetTitle>
        <SheetDescription>
          {isEditing ? 'Atualize os dados do veículo.' : 'Preencha os dados para cadastrar um novo veículo.'}
        </SheetDescription>
      </SheetHeader>
      
      <div className="grid gap-4 py-4">
        <div>
          <label htmlFor="model" className="block text-sm font-medium mb-1">
            Modelo *
          </label>
          <Input
            id="model"
            name="model"
            value={vehicleForm.model}
            onChange={handleInputChange}
            placeholder="Modelo do veículo"
            required
          />
        </div>
        
        <div>
          <label htmlFor="license_plate" className="block text-sm font-medium mb-1">
            Placa *
          </label>
          <Input
            id="license_plate"
            name="license_plate"
            value={vehicleForm.license_plate}
            onChange={handleInputChange}
            placeholder="Placa do veículo"
            required
          />
        </div>
        
        <div>
          <label htmlFor="year" className="block text-sm font-medium mb-1">
            Ano
          </label>
          <Input
            id="year"
            name="year"
            type="number"
            value={vehicleForm.year}
            onChange={handleInputChange}
            placeholder="Ano do veículo"
          />
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            Status
          </label>
          <Select 
            value={vehicleForm.status}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="maintenance">Em manutenção</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <SheetFooter>
        <SheetClose asChild>
          <Button variant="outline">Cancelar</Button>
        </SheetClose>
        <Button onClick={handleSaveVehicle}>
          {isEditing ? 'Salvar Alterações' : 'Cadastrar Veículo'}
        </Button>
      </SheetFooter>
    </>
  );
};

export default VehicleForm;
