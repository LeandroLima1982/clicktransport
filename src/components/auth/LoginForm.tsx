
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import LoginFormInputs from './LoginFormInputs';
import LoginLinks from './LoginLinks';

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
  const { signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const accountType = searchParams.get('type') || 'client';
  
  // Set default email for admin for easier access during development
  useEffect(() => {
    if (accountType === 'admin') {
      setEmail('admin@clicktransfer.com');
      setPassword('Admin@123');
      console.log('Admin login form initialized with default credentials');
    }
  }, [accountType]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!email || !password) {
        toast.error('Por favor, preencha email e senha');
        return;
      }
      
      console.log(`Login attempt for account type: ${accountType}`);
      
      if (handleLogin) {
        await handleLogin(e);
      } else {
        console.log(`Attempting direct login with email: ${email}`);
        const { error } = await signIn(email, password);
        if (error) {
          console.error('Login error:', error);
          
          // Show specific error messages based on error type
          if (error.message === 'You do not have administrator privileges') {
            toast.error('Acesso negado', { 
              description: 'Você não tem privilégios de administrador'
            });
          } else if (error.message === 'You are not registered as a driver for this company') {
            toast.error('Acesso negado', { 
              description: 'Você não está registrado como motorista para esta empresa'
            });
          } else if (error.message === 'You are not registered as a company admin') {
            toast.error('Acesso negado', { 
              description: 'Você não está registrado como administrador desta empresa'
            });
          } else if (error.message.includes('Invalid login credentials')) {
            toast.error('Falha no login', { 
              description: 'Email ou senha inválidos'
            });
          } else {
            toast.error('Falha no login', { description: error.message });
          }
          
          // Maintain the account type in URL when redirecting after error
          navigate(`/auth?type=${accountType}`);
        } else {
          toast.success('Login realizado com sucesso!');
          // Let the AuthProvider handle the redirect based on user role
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Ocorreu um erro inesperado');
      // Maintain the account type in URL when redirecting after error
      navigate(`/auth?type=${accountType}`);
    }
  };
  
  return (
    <TabsContent value="login">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <LoginFormInputs 
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            accountType={accountType}
          />
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full rounded-full" 
            disabled={loading}
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
          
          <LoginLinks
            accountType={accountType}
            setActiveTab={setActiveTab}
          />
        </CardFooter>
      </form>
    </TabsContent>
  );
};

export default LoginForm;
