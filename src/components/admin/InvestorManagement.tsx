
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  PieChart,
  Loader2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Investor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  cpf_cnpj?: string;
  created_at: string;
  companies_count?: number;
  total_investment?: number;
}

interface InvestorShare {
  id: string;
  investor_id: string;
  company_id: string;
  percentage: number;
  start_date: string;
  end_date?: string;
  status: string;
  company_name?: string;
}

const InvestorManagement: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('investors');
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [shares, setShares] = useState<InvestorShare[]>([]);
  const [filteredInvestors, setFilteredInvestors] = useState<Investor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [selectedShare, setSelectedShare] = useState<InvestorShare | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [shareFormOpen, setShareFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf_cnpj: '',
    password: ''
  });
  const [shareFormData, setShareFormData] = useState({
    investor_id: '',
    company_id: '',
    percentage: 0,
    start_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  useEffect(() => {
    fetchInvestors();
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = investors.filter(investor =>
        investor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (investor.cpf_cnpj && investor.cpf_cnpj.includes(searchTerm))
      );
      setFilteredInvestors(filtered);
    } else {
      setFilteredInvestors(investors);
    }
  }, [searchTerm, investors]);

  const fetchInvestors = async () => {
    setIsLoading(true);
    try {
      // Buscar investidores
      const { data, error } = await supabase
        .from('investors')
        .select('*')
        .order('name');

      if (error) throw error;

      // Buscar contagem de empresas e total de investimento para cada investidor
      const investorsWithData = await Promise.all((data || []).map(async (investor) => {
        const { data: shareData, error: shareError } = await supabase
          .from('investor_company_shares')
          .select('*, companies:company_id(name)')
          .eq('investor_id', investor.id);

        if (shareError) throw shareError;

        const companies_count = shareData?.length || 0;
        const total_investment = shareData?.reduce((sum, share) => sum + share.percentage, 0);

        return {
          ...investor,
          companies_count,
          total_investment
        };
      }));

      setInvestors(investorsWithData);
      setFilteredInvestors(investorsWithData);
    } catch (error) {
      console.error('Erro ao buscar investidores:', error);
      toast.error('Falha ao carregar investidores');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      toast.error('Falha ao carregar empresas');
    }
  };

  const fetchInvestorShares = async (investorId: string) => {
    try {
      const { data, error } = await supabase
        .from('investor_company_shares')
        .select('*, companies:company_id(name)')
        .eq('investor_id', investorId);

      if (error) throw error;

      // Formatar dados para incluir o nome da empresa
      const formattedShares = data?.map(share => ({
        ...share,
        company_name: share.companies?.name
      }));

      setShares(formattedShares || []);
    } catch (error) {
      console.error('Erro ao buscar participações:', error);
      toast.error('Falha ao carregar participações');
    }
  };

  const handleAddInvestor = async () => {
    try {
      setIsLoading(true);

      // 1. Criar usuário na autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: 'investor'
          }
        }
      });

      if (authError) throw authError;

      // 2. Criar perfil de investidor
      const { data, error } = await supabase
        .from('investors')
        .insert([
          {
            user_id: authData.user?.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            cpf_cnpj: formData.cpf_cnpj
          }
        ])
        .select();

      if (error) throw error;

      toast.success('Investidor adicionado com sucesso!');
      fetchInvestors();
      setFormOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        cpf_cnpj: '',
        password: ''
      });
    } catch (error: any) {
      console.error('Erro ao adicionar investidor:', error);
      toast.error(`Falha ao adicionar investidor: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddShare = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('investor_company_shares')
        .insert([shareFormData])
        .select();

      if (error) throw error;

      toast.success('Participação adicionada com sucesso!');
      
      if (selectedInvestor) {
        fetchInvestorShares(selectedInvestor.id);
      }
      
      setShareFormOpen(false);
      setShareFormData({
        investor_id: '',
        company_id: '',
        percentage: 0,
        start_date: new Date().toISOString().split('T')[0],
        status: 'active'
      });
    } catch (error: any) {
      console.error('Erro ao adicionar participação:', error);
      toast.error(`Falha ao adicionar participação: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInvestor = async (investor: Investor) => {
    if (!confirm(`Tem certeza que deseja excluir o investidor ${investor.name}?`)) {
      return;
    }

    try {
      setIsLoading(true);

      // 1. Excluir participações
      const { error: sharesError } = await supabase
        .from('investor_company_shares')
        .delete()
        .eq('investor_id', investor.id);

      if (sharesError) throw sharesError;

      // 2. Excluir investidor
      const { error } = await supabase
        .from('investors')
        .delete()
        .eq('id', investor.id);

      if (error) throw error;

      toast.success('Investidor excluído com sucesso!');
      fetchInvestors();
    } catch (error: any) {
      console.error('Erro ao excluir investidor:', error);
      toast.error(`Falha ao excluir investidor: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteShare = async (share: InvestorShare) => {
    if (!confirm(`Tem certeza que deseja excluir esta participação?`)) {
      return;
    }

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('investor_company_shares')
        .delete()
        .eq('id', share.id);

      if (error) throw error;

      toast.success('Participação excluída com sucesso!');
      
      if (selectedInvestor) {
        fetchInvestorShares(selectedInvestor.id);
        fetchInvestors(); // Atualizar a contagem de empresas na lista de investidores
      }
    } catch (error: any) {
      console.error('Erro ao excluir participação:', error);
      toast.error(`Falha ao excluir participação: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInvestorDetails = (investor: Investor) => {
    setSelectedInvestor(investor);
    fetchInvestorShares(investor.id);
    setActiveTab('shares');
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Gestão de Investidores
            </div>
          </CardTitle>
          <CardDescription>
            Gerencie investidores e suas participações em empresas
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Investidor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Investidor</DialogTitle>
                <DialogDescription>
                  Preencha os dados para adicionar um novo investidor.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do investidor"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="********"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
                  <Input
                    id="cpf_cnpj"
                    value={formData.cpf_cnpj}
                    onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddInvestor} disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={fetchInvestors} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="investors">Investidores</TabsTrigger>
            <TabsTrigger value="shares">Participações</TabsTrigger>
          </TabsList>

          <TabsContent value="investors">
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar investidor por nome, email ou CPF/CNPJ..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredInvestors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum investidor encontrado.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Empresas</TableHead>
                      <TableHead>Total Participação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvestors.map((investor) => (
                      <TableRow key={investor.id}>
                        <TableCell className="font-medium">{investor.name}</TableCell>
                        <TableCell>{investor.email}</TableCell>
                        <TableCell>{investor.cpf_cnpj || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{investor.companies_count || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {investor.total_investment || 0}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleViewInvestorDetails(investor)}>
                                <PieChart className="mr-2 h-4 w-4" />
                                Ver Participações
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteInvestor(investor)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shares">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <h3 className="text-lg font-medium">
                  {selectedInvestor ? `Participações de ${selectedInvestor.name}` : 'Todas as Participações'}
                </h3>
              </div>
              <div className="flex space-x-2">
                <Dialog open={shareFormOpen} onOpenChange={setShareFormOpen}>
                  <DialogTrigger asChild>
                    <Button disabled={!selectedInvestor}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Participação
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Participação</DialogTitle>
                      <DialogDescription>
                        Defina a participação do investidor em uma empresa.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="company">Empresa</Label>
                        <Select
                          id="company"
                          value={shareFormData.company_id}
                          onChange={(e) => setShareFormData({ ...shareFormData, company_id: e.target.value })}
                        >
                          <option value="">Selecione uma empresa</option>
                          {companies.map((company) => (
                            <option key={company.id} value={company.id}>
                              {company.name}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="percentage">Percentual (%)</Label>
                        <Input
                          id="percentage"
                          type="number"
                          min="0"
                          max="100"
                          value={shareFormData.percentage}
                          onChange={(e) => setShareFormData({ ...shareFormData, percentage: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="start_date">Data Inicial</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={shareFormData.start_date}
                          onChange={(e) => setShareFormData({ ...shareFormData, start_date: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShareFormOpen(false)}>Cancelar</Button>
                      <Button onClick={handleAddShare} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" onClick={() => {
                  if (selectedInvestor) {
                    fetchInvestorShares(selectedInvestor.id);
                  }
                }} disabled={isLoading || !selectedInvestor}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : !selectedInvestor ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Selecione um investidor para ver suas participações.</p>
              </div>
            ) : shares.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhuma participação encontrada para este investidor.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Percentual</TableHead>
                      <TableHead>Data Inicial</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shares.map((share) => (
                      <TableRow key={share.id}>
                        <TableCell className="font-medium">{share.company_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{share.percentage}%</Badge>
                        </TableCell>
                        <TableCell>{new Date(share.start_date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell>
                          <Badge className={share.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {share.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteShare(share)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Componente Label para o formulário
const Label = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
    {children}
  </label>
);

// Componente Select para o formulário
const Select = ({ id, value, onChange, children }: { 
  id: string, 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void,
  children: React.ReactNode
}) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {children}
  </select>
);

export default InvestorManagement;
