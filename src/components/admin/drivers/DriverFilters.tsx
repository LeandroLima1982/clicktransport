
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from 'lucide-react';

interface Company {
  id: string;
  name: string;
}

interface DriverFiltersProps {
  companies: Company[];
  onCompanyChange: (companyId: string | null) => void;
  onStatusChange: (status: string | null) => void;
  selectedCompany: string | null;
  selectedStatus: string | null;
}

const DriverFilters: React.FC<DriverFiltersProps> = ({
  companies,
  onCompanyChange,
  onStatusChange,
  selectedCompany,
  selectedStatus
}) => {
  const clearFilters = () => {
    onCompanyChange(null);
    onStatusChange(null);
  };

  const hasFilters = selectedCompany || selectedStatus;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 bg-slate-50 p-4 rounded-lg">
      <div className="flex-1">
        <label className="text-sm font-medium block mb-1">Empresa</label>
        <Select value={selectedCompany || "all"} onValueChange={(value) => onCompanyChange(value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <label className="text-sm font-medium block mb-1">Status</label>
        <Select value={selectedStatus || "all"} onValueChange={(value) => onStatusChange(value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="on_trip">Em viagem</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <div className="flex items-end">
          <Button variant="ghost" onClick={clearFilters} className="h-10">
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default DriverFilters;
