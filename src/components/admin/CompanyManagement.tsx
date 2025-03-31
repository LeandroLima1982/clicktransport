
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import CompanyTable from './CompanyTable';
import { Company } from '@/types/company';
import CompanyFormDialog from './CompanyFormDialog';
import { identifyDuplicateCompanies, fixDuplicateCompanies } from '@/utils/fixDuplicateCompanies';

const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [isFixingDuplicates, setIsFixingDuplicates] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchTotalCount();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.cnpj && company.cnpj.includes(searchTerm)) ||
        (company.formatted_cnpj && company.formatted_cnpj.includes(searchTerm)) ||
        company.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchTerm, companies]);

  const fetchTotalCount = async () => {
    try {
      const { count, error } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setTotalCompanies(count || 0);
    } catch (error) {
      console.error('Error fetching total companies count:', error);
    }
  };

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Format CNPJ and add formatted_cnpj property
      const formattedCompanies = data.map(company => {
        const formatted_cnpj = company.cnpj 
          ? company.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5") 
          : null;
        
        return {
          ...company,
          formatted_cnpj
        };
      });
      
      setCompanies(formattedCompanies);
      setFilteredCompanies(formattedCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Falha ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setIsFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsFormOpen(true);
  };

  const handleFormClose = (shouldRefresh: boolean) => {
    setIsFormOpen(false);
    if (shouldRefresh) {
      fetchCompanies();
      fetchTotalCount();
    }
  };

  const handleRefresh = () => {
    fetchCompanies();
    fetchTotalCount();
  };

  const handleFixDuplicates = async () => {
    setIsFixingDuplicates(true);
    try {
      // Step 1: Identify duplicates
      const { duplicates, count, error } = await identifyDuplicateCompanies();
      
      if (error) {
        toast.error(`Erro ao identificar duplicatas: ${error}`);
        return;
      }
      
      if (count === 0) {
        toast.info('Não foram encontradas empresas duplicadas');
        return;
      }
      
      // Step 2: Show confirmation with count
      const confirmFix = window.confirm(`Foram encontradas ${count} empresas duplicadas. Deseja corrigir?`);
      
      if (!confirmFix) {
        toast.info('Operação cancelada pelo usuário');
        return;
      }
      
      // Step 3: Fix duplicates
      const { fixed, error: fixError } = await fixDuplicateCompanies();
      
      if (fixError) {
        toast.error(`Erro ao corrigir duplicatas: ${fixError}`);
        return;
      }
      
      toast.success(`${fixed.length} registros duplicados foram corrigidos`);
      fetchCompanies();
      fetchTotalCount();
      
    } catch (err) {
      console.error('Error fixing duplicates:', err);
      toast.error('Erro ao tentar corrigir empresas duplicadas');
    } finally {
      setIsFixingDuplicates(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Gerenciamento de Empresas</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleFixDuplicates}
            disabled={isFixingDuplicates}
          >
            {isFixingDuplicates ? "Corrigindo..." : "Corrigir Duplicatas"}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button size="sm" onClick={handleAddCompany}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, CNPJ ou status..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            Total: <strong>{totalCompanies}</strong> empresas
          </div>
        </div>
        
        <CompanyTable 
          companies={filteredCompanies} 
          isLoading={isLoading}
          onEdit={handleEditCompany}
          onRefreshData={handleRefresh}
        />
        
        {isFormOpen && (
          <CompanyFormDialog
            company={selectedCompany}
            isOpen={isFormOpen}
            onClose={handleFormClose}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyManagement;
