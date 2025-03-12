
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface LoginFormInputsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  accountType: string;
  companyError?: string | null;
}

const LoginFormInputs: React.FC<LoginFormInputsProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  selectedCompanyId,
  setSelectedCompanyId,
  accountType,
  companyError
}) => {
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  
  // Only show company selector for driver login type
  const showCompanySelector = accountType === 'driver';
  
  useEffect(() => {
    if (showCompanySelector) {
      fetchCompanies();
    }
  }, [showCompanySelector]);
  
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        console.error('Error fetching companies:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setCompanies(data);
        
        // Automatically select the first company if none is selected
        if (!selectedCompanyId && data.length > 0) {
          setSelectedCompanyId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Exception fetching companies:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Only show company selector for driver login type */}
      {showCompanySelector && (
        <div className="space-y-2">
          <Label htmlFor="company-select">Empresa</Label>
          <Select 
            value={selectedCompanyId} 
            onValueChange={setSelectedCompanyId}
            disabled={loading || companies.length === 0}
          >
            <SelectTrigger 
              id="company-select" 
              className={companyError ? "border-red-500" : ""}
            >
              <SelectValue placeholder={
                loading 
                  ? "Carregando empresas..." 
                  : companies.length === 0 
                    ? "Nenhuma empresa disponível" 
                    : "Selecione uma empresa"
              } />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Carregando...
                </div>
              ) : companies.length === 0 ? (
                <SelectItem value="none" disabled>
                  Nenhuma empresa disponível
                </SelectItem>
              ) : (
                companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {companyError && (
            <p className="text-xs text-red-500">{companyError}</p>
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
    </div>
  );
};

export default LoginFormInputs;
