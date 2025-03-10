
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
          <select
            id="status"
            name="status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={vehicleForm.status}
            onChange={handleInputChange}
          >
            <option value="active">Ativo</option>
            <option value="maintenance">Em manutenção</option>
            <option value="inactive">Inativo</option>
          </select>
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
