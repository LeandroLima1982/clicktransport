
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onShowRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const schema = z.object({
    email: z.string().email({ message: 'Email inválido' }),
    password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = schema.parse({ email, password });
      setIsLoading(true);
      
      const { user, error } = await signIn(validatedData.email, validatedData.password);
      
      if (error) {
        console.error('Login error:', error);
        toast.error('Erro ao fazer login', { 
          description: error.message === 'Invalid login credentials'
            ? 'Email ou senha incorretos'
            : error.message
        });
        return;
      }
      
      if (user) {
        toast.success('Login realizado com sucesso');
        onLoginSuccess();
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        Object.values(fieldErrors).forEach(messages => {
          if (messages && messages.length > 0) {
            toast.error(messages[0]);
          }
        });
      } else {
        console.error('Unexpected login error:', error);
        toast.error('Erro ao fazer login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Faça login para continuar</h2>
        <p className="text-muted-foreground mt-2">
          Entre com sua conta para confirmar sua reserva
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Senha
            </label>
            <a href="#" className="text-sm text-primary hover:underline">
              Esqueceu a senha?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isLoading}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Ou
          </span>
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <p className="text-sm">
          Não tem uma conta?{' '}
          <button
            type="button"
            onClick={onShowRegister}
            className="text-primary hover:underline font-medium"
          >
            Cadastre-se
          </button>
        </p>
        
        <Button 
          variant="outline" 
          type="button" 
          className="flex items-center w-full"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
