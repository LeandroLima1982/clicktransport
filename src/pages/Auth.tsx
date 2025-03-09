
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import TransitionEffect from '@/components/TransitionEffect';
import { Car } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [accountType, setAccountType] = useState('company');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('register') === 'true') {
      setActiveTab('register');
    }
    
    const type = searchParams.get('type');
    if (type && ['company', 'driver', 'admin'].includes(type)) {
      setAccountType(type);
    }
  }, [location]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // This would normally authenticate with the backend
    toast.success('Login realizado com sucesso');
    
    // Redirect based on account type
    if (accountType === 'company') {
      navigate('/company/dashboard');
    } else if (accountType === 'driver') {
      navigate('/driver/dashboard');
    } else if (accountType === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // This would normally register with the backend
    toast.success('Cadastro realizado com sucesso', {
      description: 'Por favor, verifique seu e-mail para confirmar sua conta.',
    });
    
    // Redirect to login
    setActiveTab('login');
  };

  return (
    <TransitionEffect>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex justify-center items-center p-6">
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              Click<span className="text-primary">Transfer</span>
            </span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md shadow-lg animate-fade-in">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {activeTab === 'login' ? 'Bem-vindo de volta' : 'Criar uma conta'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'login' 
                  ? 'Digite suas credenciais para acessar sua conta' 
                  : 'Preencha o formulário abaixo para criar sua conta'}
              </CardDescription>
            </CardHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Cadastro</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <label htmlFor="account-type" className="text-sm font-medium">
                        Tipo de Conta
                      </label>
                      <Select
                        value={accountType}
                        onValueChange={setAccountType}
                      >
                        <SelectTrigger id="account-type">
                          <SelectValue placeholder="Selecione o tipo de conta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">Empresa de Transporte</SelectItem>
                          <SelectItem value="driver">Motorista</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="nome@exemplo.com" required />
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
                      <Input id="password" type="password" required />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full rounded-full">
                      Entrar
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
                  </CardFooter>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <label htmlFor="reg-account-type" className="text-sm font-medium">
                        Tipo de Conta
                      </label>
                      <Select
                        value={accountType}
                        onValueChange={setAccountType}
                      >
                        <SelectTrigger id="reg-account-type">
                          <SelectValue placeholder="Selecione o tipo de conta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">Empresa de Transporte</SelectItem>
                          <SelectItem value="driver">Motorista</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {accountType === 'company' && (
                      <div className="space-y-2">
                        <label htmlFor="company-name" className="text-sm font-medium">
                          Nome da Empresa
                        </label>
                        <Input id="company-name" placeholder="Nome da sua empresa" required />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="first-name" className="text-sm font-medium">
                          Nome
                        </label>
                        <Input id="first-name" placeholder="Seu nome" required />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="last-name" className="text-sm font-medium">
                          Sobrenome
                        </label>
                        <Input id="last-name" placeholder="Seu sobrenome" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="reg-email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input id="reg-email" type="email" placeholder="nome@exemplo.com" required />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Telefone
                      </label>
                      <Input id="phone" placeholder="Seu número de telefone" required />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="reg-password" className="text-sm font-medium">
                        Senha
                      </label>
                      <Input id="reg-password" type="password" required />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-sm font-medium">
                        Confirmar Senha
                      </label>
                      <Input id="confirm-password" type="password" required />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full rounded-full">
                      Criar Conta
                    </Button>
                    
                    <div className="text-sm text-center text-foreground/70">
                      Já tem uma conta?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-primary hover:underline"
                      >
                        Entrar
                      </button>
                    </div>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </TransitionEffect>
  );
};

export default Auth;
