
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from 'lucide-react';
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

interface VehicleSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewVehicleClick?: () => void;
}

const VehicleSearchBar: React.FC<VehicleSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onNewVehicleClick
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar veículos..."
          className="w-full pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Sheet onOpenChange={(open) => !open && onNewVehicleClick && onNewVehicleClick()}>
        <SheetTrigger asChild>
          <Button className="ml-4">
            <Plus className="mr-2 h-4 w-4" />
            Novo Veículo
          </Button>
        </SheetTrigger>
      </Sheet>
    </div>
  );
};

export default VehicleSearchBar;
