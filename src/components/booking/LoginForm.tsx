
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onShowRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn } = useAuth();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError('Email ou senha inválidos');
        toast.error('Erro ao fazer login: ' + error.message);
      } else {
        toast.success('Login realizado com sucesso!');
        onLoginSuccess();
      }
    } catch (error) {
      setError('Ocorreu um erro durante o login');
      toast.error('Ocorreu um erro durante o login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 mb-4">
          <LogIn className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Entrar na sua conta</h3>
        <p className="text-white/70 mt-2">
          Para finalizar sua reserva, é necessário fazer login
        </p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm border border-red-500/50">
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/10 text-white border-amber-300/30 focus-visible:ring-amber-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/10 text-white border-amber-300/30 focus-visible:ring-amber-400"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-amber-400 to-amber-300 
                    hover:from-amber-500 hover:to-amber-400 text-[#002366] font-medium" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
        
        <div className="text-center text-sm text-white/70 mt-4">
          <p>
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={onShowRegister}
              className="text-amber-300 hover:text-amber-200 hover:underline"
            >
              Registre-se
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
