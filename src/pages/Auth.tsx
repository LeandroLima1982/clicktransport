
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthContainer, LoginForm, RegisterForm } from '@/components/auth';
import { useAuth } from '../hooks/useAuth';
import { Car, Briefcase, Shield, User } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [accountType, setAccountType] = useState('company');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBusinessUser, setIsBusinessUser] = useState(true);

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
    if (type && ['company', 'driver', 'admin', 'client'].includes(type)) {
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
      navigate(returnTo);
      return;
    }
    
    // Direct route redirections based on user role
    if (userRole === 'company') {
      navigate('/company/dashboard');
    } else if (userRole === 'driver') {
      navigate('/driver/dashboard');
    } else if (userRole === 'admin') {
      navigate('/admin/dashboard');
    } else if (userRole === 'client') {
      navigate('/bookings');
    } else {
      // Default fallback if role is not recognized
      navigate('/');
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
      const { error } = await signIn(email, password);
      
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
      if (accountType === 'driver') return 'Cadastro de Motorista';
      if (accountType === 'company') return 'Cadastro de Empresa';
      if (accountType === 'admin') return 'Cadastro de Administrador';
      return 'Cadastro de Conta Empresarial';
    }
    
    return 'Cadastro de Cliente';
  };

  const getDescription = () => {
    if (activeTab === 'login') {
      return 'Digite suas credenciais para acessar sua conta';
    }
    
    if (isBusinessUser) {
      return 'Preencha o formulário abaixo para criar sua conta empresarial';
    }
    
    return 'Preencha o formulário abaixo para criar sua conta de cliente';
  };

  const getRoleIcon = () => {
    if (accountType === 'client') return <User className="h-8 w-8 text-primary mb-2" />;
    if (accountType === 'driver') return <Car className="h-8 w-8 text-primary mb-2" />;
    if (accountType === 'company') return <Briefcase className="h-8 w-8 text-primary mb-2" />;
    if (accountType === 'admin') return <Shield className="h-8 w-8 text-primary mb-2" />;
    return null;
  };

  return (
    <AuthContainer
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      title={getTitle()}
      description={getDescription()}
      error={error}
      icon={getRoleIcon()}
    >
      <LoginForm 
        handleLogin={handleLogin} 
        loading={loading} 
        setActiveTab={setActiveTab} 
      />
      <RegisterForm 
        handleRegister={handleRegister}
        loading={loading}
        isBusinessUser={isBusinessUser}
        toggleUserType={toggleUserType}
        accountType={accountType}
        setAccountType={setAccountType}
        setActiveTab={setActiveTab}
      />
    </AuthContainer>
  );
};

export default Auth;
