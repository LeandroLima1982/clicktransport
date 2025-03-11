
import React, { useState, useEffect } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompanySelectorProps {
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  disabled?: boolean;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({
  selectedCompanyId,
  setSelectedCompanyId,
  disabled = false
}) => {
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
  const [fetchingCompanies, setFetchingCompanies] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setFetchingCompanies(true);
    console.log('Starting company fetch process...');
    
    try {
      // Directly fetch from companies table
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        console.error('Error fetching companies:', error);
        toast.error('Erro ao carregar empresas', {
          description: 'Por favor, tente novamente mais tarde.'
        });
      } else if (data && data.length > 0) {
        console.log(`Successfully loaded ${data.length} companies:`, data);
        setCompanies(data);
        
        // Auto-select the first company if there's only one
        if (data.length === 1) {
          setSelectedCompanyId(data[0].id);
          console.log('Auto-selected company:', data[0].name);
        }
      } else {
        console.log('No companies found or empty data returned');
        toast.warning('Nenhuma empresa encontrada', {
          description: 'Não há empresas cadastradas no sistema.'
        });
      }
    } catch (err) {
      console.error('Exception when loading companies:', err);
      toast.error('Erro ao carregar empresas', {
        description: 'Ocorreu um erro inesperado.'
      });
    } finally {
      setFetchingCompanies(false);
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="company-select" className="text-sm font-medium flex items-center">
        <Building2 className="h-4 w-4 mr-1" />
        Empresa
      </label>
      <Select
        value={selectedCompanyId}
        onValueChange={setSelectedCompanyId}
        disabled={disabled || fetchingCompanies}
      >
        <SelectTrigger id="company-select" className="w-full bg-white">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent className="bg-white z-[100] max-h-60 overflow-y-auto">
          {companies.length > 0 ? (
            companies.map((company) => (
              <SelectItem key={company.id} value={company.id} className="py-2">
                {company.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-companies" disabled>
              {fetchingCompanies ? 'Carregando empresas...' : 'Nenhuma empresa encontrada'}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      {fetchingCompanies && (
        <div className="flex items-center text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Carregando empresas...
        </div>
      )}
      {!fetchingCompanies && companies.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {companies.length} {companies.length === 1 ? 'empresa encontrada' : 'empresas encontradas'}
        </div>
      )}
      {!fetchingCompanies && companies.length === 0 && (
        <button 
          type="button" 
          onClick={loadCompanies}
          className="text-xs text-primary hover:underline flex items-center"
        >
          <Loader2 className="h-3 w-3 mr-1" />
          Tentar novamente
        </button>
      )}
    </div>
  );
};

export default CompanySelector;
