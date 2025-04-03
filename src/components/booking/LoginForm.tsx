
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2 } from 'lucide-react';
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
  
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error('Erro ao fazer login: ' + error.message);
      } else {
        toast.success('Login realizado com sucesso!');
        onLoginSuccess();
      }
    } catch (error) {
      toast.error('Ocorreu um erro durante o login');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-300/20 text-amber-300 mb-4">
          <LogIn className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Faça login para continuar</h3>
        <p className="text-amber-200/70 mt-2">
          Para finalizar sua reserva, é necessário fazer login
        </p>
      </div>
      
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
            className="bg-[#002366]/50 border-amber-300/30 text-white"
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
            className="bg-[#002366]/50 border-amber-300/30 text-white"
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-amber-400 to-amber-300 
            hover:from-amber-500 hover:to-amber-400 text-[#002366]" 
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
        
        <div className="text-center text-sm text-amber-200/70 mt-4">
          <p>
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={onShowRegister}
              className="text-amber-300 hover:underline"
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
