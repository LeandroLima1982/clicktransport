
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, RefreshCw, PlusCircle } from 'lucide-react';
import { supabase } from '@/utils/supabaseClient';
import { toast } from 'sonner';
import CompanyManagementList from './CompanyManagementList';
import CompanyDetail from './CompanyDetail';
import { Badge } from '@/components/ui/badge';

interface Company {
  id: string;
  name: string;
  cnpj: string | null;
  status: string;
  created_at: string;
  user_id: string | null;
}

interface CompanyStats {
  totalCompanies: number;
  byStatus: {
    active: number;
    pending: number;
    inactive: number;
    suspended: number;
  };
}

const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [stats, setStats] = useState<CompanyStats>({
    totalCompanies: 0,
    byStatus: {
      active: 0,
      pending: 0,
      inactive: 0,
      suspended: 0
    }
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, companies]);

  const applyFilters = () => {
    let filtered = [...companies];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.cnpj && company.cnpj.includes(searchTerm))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(company => company.status === statusFilter);
    }
    
    setFilteredCompanies(filtered);
  };

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const companiesData = data || [];
      setCompanies(companiesData);
      setFilteredCompanies(companiesData);
      
      // Calculate statistics
      const statsData: CompanyStats = {
        totalCompanies: companiesData.length,
        byStatus: {
          active: companiesData.filter(c => c.status === 'active').length,
          pending: companiesData.filter(c => c.status === 'pending').length,
          inactive: companiesData.filter(c => c.status === 'inactive').length,
          suspended: companiesData.filter(c => c.status === 'suspended').length
        }
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Falha ao carregar lista de empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCompanies();
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
  };

  const openCompanyDetail = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  const handleCreateCompany = async () => {
    const name = prompt('Digite o nome da nova empresa:');
    if (!name) return;
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();
      
      if (error) throw error;
      
      toast.success(`Empresa "${name}" criada com sucesso!`);
      fetchCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Falha ao criar empresa');
    }
  };

  const getStatusBadge = (status: keyof typeof stats.byStatus) => {
    const count = stats.byStatus[status];
    let className = '';
    
    switch (status) {
      case 'active':
        className = 'bg-green-100 text-green-800';
        break;
      case 'pending':
        className = 'bg-yellow-100 text-yellow-800';
        break;
      case 'inactive':
        className = 'bg-gray-100 text-gray-800';
        break;
      case 'suspended':
        className = 'bg-red-100 text-red-800';
        break;
    }
    
    return <Badge className={className}>{translateStatus(status)}: {count}</Badge>;
  };

  const translateStatus = (status: string) => {
    const statusNames: Record<string, string> = {
      'active': 'Ativas',
      'pending': 'Pendentes',
      'inactive': 'Inativas',
      'suspended': 'Suspensas'
    };
    
    return statusNames[status] || status;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Gestão de Empresas
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              (Total: {stats.totalCompanies})
            </span>
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.keys(stats.byStatus).map((status) => (
              <div key={status} onClick={() => setStatusFilter(status)} className="cursor-pointer">
                {getStatusBadge(status as keyof typeof stats.byStatus)}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={handleCreateCompany}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por nome ou CNPJ..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-64">
              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                  <SelectItem value="suspended">Suspensas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || statusFilter) && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>
        
        <CompanyManagementList 
          companies={filteredCompanies} 
          isLoading={isLoading}
          onRefreshData={handleRefresh}
          onViewDetails={openCompanyDetail}
        />
      </CardContent>

      {selectedCompany && (
        <CompanyDetail
          company={selectedCompany}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onStatusChange={handleRefresh}
        />
      )}
    </Card>
  );
};

export default CompanyManagement;
