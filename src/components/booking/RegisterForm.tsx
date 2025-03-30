
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ChevronLeft } from 'lucide-react';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onShowLogin: () => void;
  goToPreviousStep: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onShowLogin, goToPreviousStep }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: 'client'
          }
        }
      });
      
      if (error) throw error;
      
      if (data?.session) {
        toast.success('Cadastro realizado com sucesso!');
        console.log('User registered and logged in automatically, proceeding with booking');
        onRegisterSuccess(); // This should proceed with the booking now that we're logged in
      } else {
        // No session yet, but registration in progress
        toast.info('Verifique seu email para confirmar o cadastro');
        
        // Try to automatically log in the user to complete the booking flow
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (!loginError && loginData.session) {
          toast.success('Login automático realizado com sucesso');
          console.log('Auto-login successful, proceeding with booking');
          onRegisterSuccess();
        } else {
          // If auto-login fails, show login form
          console.log('Auto-login failed, showing login form', loginError);
          onShowLogin();
        }
      }
    } catch (error: any) {
      console.error('Register error:', error);
      setError(error.message || 'Erro ao fazer cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow text-center rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-1">Criar uma conta</h3>
        <p className="text-white/80 mb-4 text-sm">
          Cadastre-se para concluir sua reserva
        </p>
        
        {error && (
          <Alert variant="destructive" className="my-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          <div className="space-y-2 text-left">
            <Label htmlFor="name" className="text-white">Nome completo</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          
          <div className="space-y-2 text-left">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email" 
              placeholder="seu-email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          
          <div className="space-y-2 text-left">
            <Label htmlFor="password" className="text-white">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="bg-white/10 border-white/20 text-white"
            />
            <p className="text-xs text-white/70">
              Mínimo de 6 caracteres
            </p>
          </div>
          
          <Button type="submit" className="w-full bg-amber-400 hover:bg-amber-500 text-[#002366]" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : 'Cadastrar'}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm text-white">
          Já tem uma conta?{' '}
          <button 
            className="font-semibold text-amber-300 hover:underline" 
            onClick={onShowLogin}
          >
            Faça login
          </button>
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <Button 
          onClick={goToPreviousStep}
          variant="outline" 
          className="px-3 md:px-4 py-2 h-auto rounded-lg text-white border-amber-300/50 hover:bg-white/10 hover:text-amber-300 shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          <span className="hidden md:inline">Voltar</span>
        </Button>
      </div>
    </div>
  );
};

export default RegisterForm;
