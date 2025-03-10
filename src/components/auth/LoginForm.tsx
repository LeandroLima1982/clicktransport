
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  
  const searchParams = new URLSearchParams(location.search);
  const accountType = searchParams.get('type') || 'client';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Use the parent handleLogin if provided, otherwise use local logic
      if (handleLogin) {
        await handleLogin(e);
      } else {
        if (!email || !password) {
          toast.error('Por favor, preencha email e senha');
          return;
        }
        
        const { error } = await signIn(email, password);
        if (error) {
          toast.error('Falha no login', { description: error.message });
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
          <Button type="submit" className="w-full rounded-full" disabled={loading}>
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
