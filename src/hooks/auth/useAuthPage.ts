
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../useAuth';

export const useAuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [accountType, setAccountType] = useState('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBusinessUser, setIsBusinessUser] = useState(false);

  const { signIn, signUp, user, userRole } = useAuth();

  useEffect(() => {
    if (user) {
      redirectToDashboard();
    }
    
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('register') === 'true') {
      setActiveTab('register');
    }
    
    const type = searchParams.get('type');
    if (type && ['company', 'admin', 'client', 'driver'].includes(type)) {
      setAccountType(type);
      setIsBusinessUser(type !== 'client');
    }

    if (searchParams.get('client') === 'true') {
      setIsBusinessUser(false);
      setAccountType('client');
    }
  }, [location, user, userRole]);

  const redirectToDashboard = () => {
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get('return_to');
    
    console.log('Redirecting user with role:', userRole);
    
    if (returnTo) {
      navigate(returnTo, { replace: true });
      return;
    }
    
    // Strict role-based redirections - each user type has own dashboard
    if (userRole === 'company') {
      navigate('/company/dashboard', { replace: true });
    } else if (userRole === 'driver') {
      navigate('/driver/dashboard', { replace: true });
    } else if (userRole === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    } else if (userRole === 'client') {
      navigate('/bookings', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    // Get company ID if applicable (required for driver logins only)
    const companyIdElement = form.querySelector('[id="company-select"]') as HTMLSelectElement;
    const companyId = (accountType === 'driver' && companyIdElement) ? companyIdElement.value : undefined;
    
    // Validate company selection for driver logins only
    if (accountType === 'driver' && !companyId) {
      setError('Por favor, selecione uma empresa para fazer login');
      setLoading(false);
      return;
    }
    
    try {
      console.log(`Attempting login with accountType: ${accountType}, companyId: ${companyId}`);
      const { error } = await signIn(email, password, companyId);
      
      if (error) throw error;
      
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err.message || 'Error signing in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('reg-email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('reg-password') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirm-password') as HTMLInputElement).value;
    const firstName = (form.elements.namedItem('first-name') as HTMLInputElement).value;
    const lastName = (form.elements.namedItem('last-name') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    
    const companyName = isBusinessUser && accountType === 'company'
      ? (form.elements.namedItem('company-name') as HTMLInputElement).value 
      : '';
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const finalAccountType = isBusinessUser ? accountType : 'client';
      
      console.log('Registering user with account type:', finalAccountType);
      
      const userData = {
        accountType: finalAccountType,
        firstName,
        lastName,
        phone,
        companyName
      };
      
      const { error } = await signUp(email, password, userData);
      
      if (error) throw error;
      
      toast.success('Conta criada com sucesso! Verifique seu email para ativar sua conta.');
      setActiveTab('login');
    } catch (err: any) {
      console.error('Error registering:', err);
      setError(err.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserType = () => {
    setIsBusinessUser(!isBusinessUser);
    setAccountType(isBusinessUser ? 'client' : 'company');
  };

  const getTitle = () => {
    if (activeTab === 'login') {
      if (accountType === 'client') return 'Login de Cliente';
      if (accountType === 'driver') return 'Login de Motorista';
      if (accountType === 'company') return 'Login de Empresa';
      if (accountType === 'admin') return 'Login de Administrador';
      return 'Login';
    }
    
    if (isBusinessUser) {
      if (accountType === 'company') return 'Cadastro de Empresa';
      if (accountType === 'admin') return 'Cadastro de Administrador';
      return 'Cadastro de Conta Empresarial';
    }
    
    return 'Cadastro de Cliente';
  };

  const getDescription = () => {
    if (activeTab === 'login') {
      if (accountType === 'client') return 'Digite suas credenciais para acessar sua conta de cliente';
      if (accountType === 'driver') return 'Digite suas credenciais para acessar sua conta de motorista';
      if (accountType === 'company') return 'Digite suas credenciais para acessar sua conta de empresa';
      if (accountType === 'admin') return 'Digite suas credenciais para acessar sua conta de administrador';
      return 'Digite suas credenciais para acessar sua conta';
    }
    
    if (isBusinessUser) {
      return 'Preencha o formulário abaixo para criar sua conta empresarial';
    }
    
    return 'Preencha o formulário abaixo para criar sua conta de cliente';
  };

  const getRoleIcon = () => {
    if (accountType === 'client') return 'client';
    if (accountType === 'driver') return 'driver';
    if (accountType === 'company') return 'company';
    if (accountType === 'admin') return 'admin';
    return null;
  };

  return {
    activeTab,
    setActiveTab,
    accountType,
    setAccountType,
    loading,
    error,
    isBusinessUser,
    handleLogin,
    handleRegister,
    toggleUserType,
    getTitle,
    getDescription,
    getRoleIcon
  };
};
