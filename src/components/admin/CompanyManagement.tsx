
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, RefreshCw, PlusCircle, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import CompanyManagementList from './CompanyManagementList';
import CompanyDetail from './CompanyDetail';
import CompanyCreateForm from './CompanyCreateForm';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
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

  const handleViewCompanyDetail = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailOpen(true);
  };

  const handleCreateCompany = () => {
    setIsCreateOpen(true);
  };

  const handleCompanyCreated = () => {
    setIsCreateOpen(false);
    fetchCompanies();
    toast.success('Empresa criada com sucesso');
  };

  const handleExportCompanies = async () => {
    try {
      // Convert companies to CSV
      const headers = ['Nome', 'CNPJ', 'Status', 'Data de Cadastro'];
      const csvRows = [
        headers.join(','),
        ...filteredCompanies.map(company => {
          const formattedDate = new Date(company.created_at).toLocaleDateString('pt-BR');
          return [
            `"${company.name}"`,
            `"${company.cnpj || ''}"`,
            `"${translateStatus(company.status)}"`,
            `"${formattedDate}"`
          ].join(',');
        })
      ];
      
      const csvContent = csvRows.join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `empresas_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Dados exportados com sucesso');
    } catch (error) {
      console.error('Error exporting companies:', error);
      toast.error('Falha ao exportar dados');
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
        <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
          <TabsList className="grid grid-cols-2 md:w-[400px]">
            <TabsTrigger value="list">Lista de Empresas</TabsTrigger>
            <TabsTrigger value="analytics">Análise & Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
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
                <div className="flex gap-2">
                  {(searchTerm || statusFilter) && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Limpar Filtros
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleExportCompanies}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
            
            <CompanyManagementList 
              companies={filteredCompanies} 
              isLoading={isLoading}
              onRefreshData={handleRefresh}
              onViewDetail={handleViewCompanyDetail}
            />
            
            {selectedCompany && (
              <CompanyDetail
                company={selectedCompany}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                onStatusChange={handleRefresh}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="space-y-2 w-full">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <div className="flex-1">Ativas</div>
                        <div className="font-bold">{stats.byStatus.active}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ 
                            width: `${stats.totalCompanies ? (stats.byStatus.active / stats.totalCompanies * 100) : 0}%` 
                          }}></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <div className="flex-1">Pendentes</div>
                        <div className="font-bold">{stats.byStatus.pending}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ 
                            width: `${stats.totalCompanies ? (stats.byStatus.pending / stats.totalCompanies * 100) : 0}%` 
                          }}></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                        <div className="flex-1">Inativas</div>
                        <div className="font-bold">{stats.byStatus.inactive}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                          <div className="bg-gray-500 h-2.5 rounded-full" style={{ 
                            width: `${stats.totalCompanies ? (stats.byStatus.inactive / stats.totalCompanies * 100) : 0}%` 
                          }}></div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <div className="flex-1">Suspensas</div>
                        <div className="font-bold">{stats.byStatus.suspended}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 ml-2">
                          <div className="bg-red-500 h-2.5 rounded-full" style={{ 
                            width: `${stats.totalCompanies ? (stats.byStatus.suspended / stats.totalCompanies * 100) : 0}%` 
                          }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ações em Lote</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Importar/Exportar</h3>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" size="sm" onClick={handleExportCompanies}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar Empresas (CSV)
                      </Button>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Importar Empresas (CSV)
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Relatório Detalhado (Excel)
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Ações em Massa</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        Ativar Selecionadas
                      </Button>
                      <Button variant="outline" size="sm">
                        Suspender Selecionadas
                      </Button>
                      <Button variant="outline" size="sm">
                        Enviar E-mail
                      </Button>
                      <Button variant="outline" size="sm">
                        Notificar Todas
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {isCreateOpen && (
          <CompanyCreateForm
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSuccess={handleCompanyCreated}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyManagement;
