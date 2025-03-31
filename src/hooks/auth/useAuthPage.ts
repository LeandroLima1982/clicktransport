
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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [awaitingEmailConfirmation, setAwaitingEmailConfirmation] = useState(false);

  const { signIn, signUp, user, userRole } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      redirectToDashboard();
    }
    
    // Check URL params for initial tab and account type
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
    
    try {
      if (!email || !password) {
        throw new Error('Por favor, preencha todos os campos');
      }
      
      console.log(`Attempting login with accountType: ${accountType}`);
      const { error } = await signIn(email, password);
      
      if (error) {
        // Special handling for common authentication errors
        if (error.message.includes('Email not confirmed')) {
          toast.warning('Email não confirmado', {
            description: 'Por favor, verifique seu email para confirmar sua conta antes de fazer login.'
          });
          setError('Por favor, confirme seu email antes de fazer login.');
        } else if (error.message.includes('Invalid login credentials')) {
          setError('Credenciais inválidas. Verifique seu email e senha.');
        } else {
          throw error;
        }
      }
      
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
    setAwaitingEmailConfirmation(false);
    
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
      
    const cnpj = isBusinessUser && accountType === 'company'
      ? (form.elements.namedItem('cnpj') as HTMLInputElement)?.value || ''
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
        companyName,
        cnpj
      };
      
      const result = await signUp(email, password, userData);
      
      if (result.error) throw result.error;
      
      // Check if email confirmation is required
      // Only access requiresEmailConfirmation when there's no error
      if (result.requiresEmailConfirmation) {
        setAwaitingEmailConfirmation(true);
        toast.success('Verifique seu email', {
          description: 'Um link de confirmação foi enviado para seu email. Por favor, confirme para ativar sua conta.'
        });
      }
      
      setRegistrationSuccess(true);
      setActiveTab('login');
    } catch (err: any) {
      console.error('Error registering:', err);
      
      // Specific error handling for common registration issues
      if (err.message && err.message.includes('already registered')) {
        setError('Este email já está registrado. Por favor, tente fazer login ou use outro email.');
      } else {
        setError(err.message || 'Error creating account. Please try again.');
      }
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
    
    if (awaitingEmailConfirmation) {
      return 'Por favor, verifique seu email para confirmar seu cadastro antes de fazer login.';
    }
    
    if (isBusinessUser) {
      if (accountType === 'company') {
        return 'Preencha o formulário abaixo para criar sua conta de empresa. Seu cadastro será revisado antes da aprovação.';
      }
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
    registrationSuccess,
    awaitingEmailConfirmation,
    handleLogin,
    handleRegister,
    toggleUserType,
    getTitle,
    getDescription,
    getRoleIcon
  };
};
