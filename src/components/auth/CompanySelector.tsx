
import React, { useState, useEffect } from 'react';
import { Building2, Loader2, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CompanySelectorProps {
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  disabled?: boolean;
  error?: string | null;
}

interface Company {
  id: string;
  name: string;
  status: string;
  created_at?: string;
}

const CompanySelector: React.FC<CompanySelectorProps> = ({
  selectedCompanyId,
  setSelectedCompanyId,
  disabled = false,
  error
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [fetchingCompanies, setFetchingCompanies] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setFetchingCompanies(true);
    console.log('Starting company fetch process...');
    
    try {
      // Fetch all active companies from database
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, status, created_at')
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
        
        // Auto-select the first company if none is selected and there's only one company
        if (data.length === 1 && !selectedCompanyId) {
          setSelectedCompanyId(data[0].id);
          console.log('Auto-selected company:', data[0].name);
        }
      } else {
        console.log('No companies found or empty data returned');
        toast.warning('Nenhuma empresa encontrada', {
          description: 'Não há empresas ativas cadastradas no sistema.'
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const hasError = !!error;

  return (
    <div className="space-y-2">
      <label htmlFor="company-select" className="text-sm font-medium flex items-center">
        <Building2 className="h-4 w-4 mr-1" />
        Empresa
        {hasError && (
          <span className="text-destructive ml-1">*</span>
        )}
      </label>
      
      <Select
        value={selectedCompanyId}
        onValueChange={setSelectedCompanyId}
        disabled={disabled || fetchingCompanies}
      >
        <SelectTrigger 
          id="company-select" 
          className={`w-full bg-white ${hasError ? 'border-destructive ring-destructive' : ''}`}
        >
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent className="bg-white z-[100] max-h-60 overflow-y-auto">
          {companies.length > 0 ? (
            companies.map((company) => (
              <SelectItem key={company.id} value={company.id} className="py-2">
                <div className="flex items-center justify-between w-full">
                  <span>{company.name}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground ml-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <p>Status: {company.status === 'active' ? 'Ativa' : company.status}</p>
                          {company.created_at && (
                            <p>Desde: {formatDate(company.created_at)}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
      
      {hasError && (
        <div className="flex items-center text-xs text-destructive mt-1">
          <AlertTriangle className="h-3 w-3 mr-1" />
          {error}
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
          <RefreshCw className="h-3 w-3 mr-1" />
          Tentar novamente
        </button>
      )}
    </div>
  );
};

export default CompanySelector;
