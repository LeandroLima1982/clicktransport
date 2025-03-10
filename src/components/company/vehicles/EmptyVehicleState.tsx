
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

interface EmptyVehicleStateProps {
  onNewVehicleClick?: () => void;
}

const EmptyVehicleState: React.FC<EmptyVehicleStateProps> = ({ onNewVehicleClick }) => {
  return (
    <div className="h-40 flex items-center justify-center flex-col">
      <p className="text-muted-foreground mb-2">Nenhum veículo encontrado</p>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" onClick={onNewVehicleClick}>
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Veículo
          </Button>
        </SheetTrigger>
      </Sheet>
    </div>
  );
};

export default EmptyVehicleState;
