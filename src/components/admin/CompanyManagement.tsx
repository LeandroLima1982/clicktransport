
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/main';
import { toast } from 'sonner';
import { CheckSquare, Search, UserCheck, XSquare } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
}

const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (companyId: string, newStatus: 'active' | 'inactive' | 'pending') => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ status: newStatus })
        .eq('id', companyId);
      
      if (error) throw error;
      
      setCompanies(companies.map(company => 
        company.id === companyId ? { ...company, status: newStatus } : company
      ));
      
      toast.success(`Status da empresa atualizado para ${translateStatus(newStatus)}`);
    } catch (error) {
      console.error('Error updating company status:', error);
      toast.error('Erro ao atualizar status da empresa');
    }
  };

  const translateStatus = (status: string) => {
    const statusMap: {[key: string]: string} = {
      'active': 'Ativo',
      'inactive': 'Inativo',
      'pending': 'Pendente'
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCompanies = companies.filter(company => 
    (company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm)) &&
    (!statusFilter || company.status === statusFilter)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <UserCheck className="mr-2 h-5 w-5" />
          Gerenciamento de Empresas
        </CardTitle>
        <CardDescription>
          Aprove, rejeite ou monitore empresas cadastradas na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou CNPJ..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchCompanies} variant="outline">
            Atualizar
          </Button>
        </div>
        
        {isLoading ? (
          <div className="h-40 flex items-center justify-center">
            <p>Carregando...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="h-40 flex items-center justify-center">
            <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-muted-foreground text-sm">{company.phone || 'Telefone não informado'}</p>
                      </div>
                    </TableCell>
                    <TableCell>{company.cnpj}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(company.status)}`}>
                        {translateStatus(company.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {company.status !== 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center text-green-600"
                            onClick={() => handleStatusChange(company.id, 'active')}
                          >
                            <CheckSquare className="h-4 w-4 mr-1" />
                            Aprovar
                          </Button>
                        )}
                        {company.status !== 'inactive' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex items-center text-red-600"
                            onClick={() => handleStatusChange(company.id, 'inactive')}
                          >
                            <XSquare className="h-4 w-4 mr-1" />
                            Rejeitar
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompanyManagement;
