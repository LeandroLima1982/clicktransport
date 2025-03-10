
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Loader2, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { fetchCompanies } from '@/hooks/auth/authFunctions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LoginFormProps {
  handleLogin: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  setActiveTab: (tab: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  handleLogin, 
  loading, 
  setActiveTab 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);
  const [fetchingCompanies, setFetchingCompanies] = useState(false);
  const { signIn } = useAuth();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const accountType = searchParams.get('type') || 'client';
  
  useEffect(() => {
    // Fetch companies when in driver login mode or company login mode
    if (accountType === 'driver' || accountType === 'company') {
      loadCompanies();
    }
  }, [accountType]);

  const loadCompanies = async () => {
    setFetchingCompanies(true);
    const { data, error } = await fetchCompanies();
    
    if (error) {
      toast.error('Erro ao carregar empresas', {
        description: 'Por favor, tente novamente mais tarde.'
      });
    } else if (data) {
      setCompanies(data);
    }
    
    setFetchingCompanies(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate form
      if (!email || !password) {
        toast.error('Por favor, preencha email e senha');
        return;
      }
      
      // If it's a driver login or company login, require company selection
      if ((accountType === 'driver' || accountType === 'company') && !selectedCompanyId) {
        toast.error('Por favor, selecione uma empresa');
        return;
      }
      
      // Use the parent handleLogin if provided, otherwise use local logic
      if (handleLogin) {
        await handleLogin(e);
      } else {
        // For driver logins or company logins, pass the company ID for verification
        const companyIdToUse = (accountType === 'driver' || accountType === 'company') ? selectedCompanyId : undefined;
        
        const { error } = await signIn(email, password, companyIdToUse);
        if (error) {
          if (error.message === 'You are not registered as a driver for this company') {
            toast.error('Acesso negado', { 
              description: 'Você não está registrado como motorista para esta empresa'
            });
          } else if (error.message === 'You are not registered as a company admin') {
            toast.error('Acesso negado', { 
              description: 'Você não está registrado como administrador desta empresa'
            });
          } else {
            toast.error('Falha no login', { description: error.message });
          }
        } else {
          toast.success('Login realizado com sucesso!');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Ocorreu um erro inesperado');
    }
  };
  
  return (
    <TabsContent value="login">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          {/* Show company selection for driver and company logins */}
          {(accountType === 'driver' || accountType === 'company') && (
            <div className="space-y-2">
              <label htmlFor="company-select" className="text-sm font-medium flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                Empresa
              </label>
              <Select
                value={selectedCompanyId}
                onValueChange={setSelectedCompanyId}
                disabled={fetchingCompanies}
              >
                <SelectTrigger id="company-select" className="w-full">
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fetchingCompanies && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Carregando empresas...
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input 
              id="email" 
              type="email" 
              placeholder="nome@exemplo.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full rounded-full" 
            disabled={loading || ((accountType === 'driver' || accountType === 'company') && !selectedCompanyId)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </Button>
          
          <div className="text-sm text-center text-foreground/70">
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="text-primary hover:underline"
            >
              Cadastre-se
            </button>
          </div>
          
          {accountType !== 'client' && (
            <div className="text-sm text-center">
              <Link to="/auth?type=client" className="text-primary hover:underline">
                Entrar como cliente
              </Link>
            </div>
          )}
          
          {accountType !== 'driver' && (
            <div className="text-sm text-center">
              <Link to="/auth?type=driver" className="text-primary hover:underline">
                Entrar como motorista
              </Link>
            </div>
          )}
          
          {accountType !== 'company' && (
            <div className="text-sm text-center">
              <Link to="/auth?type=company" className="text-primary hover:underline">
                Entrar como empresa
              </Link>
            </div>
          )}
        </CardFooter>
      </form>
    </TabsContent>
  );
};

export default LoginForm;
