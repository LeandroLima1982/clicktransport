
import React, { useState, useEffect } from 'react';
import CompanyPanel from '@/components/company/CompanyPanel';
import TransitionEffect from '@/components/TransitionEffect';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CompanyDashboard: React.FC = () => {
  const { user, userRole, isLoading, signOut } = useAuth();
  const [isLoadingCompany, setIsLoadingCompany] = useState(true);
  const [companyData, setCompanyData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  
  useEffect(() => {
    if (user && userRole === 'company') {
      fetchCompanyData();
    }
  }, [user, userRole]);
  
  const fetchCompanyData = async () => {
    try {
      setIsLoadingCompany(true);
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching company data:', error);
        setError('Erro ao carregar dados da empresa. Por favor, tente novamente.');
        toast.error('Erro ao carregar dados da empresa', { 
          description: error.message 
        });
      } else if (!data) {
        console.error('No company data found for this user');
        setError('Não foi possível encontrar dados da empresa associados à sua conta.');
        toast.error('Empresa não encontrada', {
          description: 'Conta de empresa não configurada corretamente.'
        });
      } else {
        setCompanyData(data);
        setError(null);
      }
    } catch (err: any) {
      console.error('Exception fetching company data:', err);
      setError('Ocorreu um erro inesperado. Por favor, tente novamente.');
      toast.error('Erro inesperado', {
        description: err.message || 'Falha ao carregar dados da empresa'
      });
    } finally {
      setIsLoadingCompany(false);
    }
  };
  
  const handleLogout = async () => {
    setIsNavigating(true);
    try {
      await signOut();
      // The user will be redirected by the AuthProvider after signOut
    } catch (error) {
      console.error('Error during sign out:', error);
      setIsNavigating(false);
    }
  };
  
  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prevCount => prevCount + 1);
      fetchCompanyData();
    } else {
      // Too many retries, suggest logout
      toast.error('Muitas tentativas sem sucesso', {
        description: 'Recomendamos fazer logout e tentar novamente.'
      });
    }
  };
  
  const handleGoToHome = () => {
    setIsNavigating(true);
    window.location.href = '/';
  };
  
  if (isLoading || isLoadingCompany || isNavigating) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-sm text-muted-foreground">
          {isNavigating ? 'Redirecionando...' : isLoading ? 'Verificando usuário...' : 'Carregando dados da empresa...'}
        </span>
      </div>
    );
  }
  
  if (!user || userRole !== 'company') {
    return <Navigate to="/auth?type=company" replace />;
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 max-w-md text-center mb-4">
          <h2 className="font-bold text-lg mb-2">Erro ao carregar dados da empresa</h2>
          <p>{error}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={handleRetry} 
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
            disabled={retryCount >= 3}
          >
            Tentar novamente
          </button>
          <button 
            onClick={handleGoToHome} 
            className="bg-secondary hover:bg-secondary/90 text-white px-4 py-2 rounded-md mt-2 sm:mt-0"
          >
            Voltar para o início
          </button>
          <button 
            onClick={handleLogout} 
            className="bg-destructive hover:bg-destructive/90 text-white px-4 py-2 rounded-md mt-2 sm:mt-0"
          >
            Fazer logout
          </button>
        </div>
      </div>
    );
  }
  
  if (!companyData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="bg-amber-100 text-amber-800 rounded-lg p-4 max-w-md text-center mb-4">
          <h2 className="font-bold text-lg mb-2">Conta não configurada</h2>
          <p>Sua conta de empresa não está completamente configurada. Por favor, contate o suporte.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={handleGoToHome} 
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
          >
            Voltar para o início
          </button>
          <button 
            onClick={handleLogout} 
            className="bg-destructive hover:bg-destructive/90 text-white px-4 py-2 rounded-md mt-2 sm:mt-0"
          >
            Fazer logout
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <TransitionEffect>
      <CompanyPanel companyId={companyData.id} />
    </TransitionEffect>
  );
};

export default CompanyDashboard;
