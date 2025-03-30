
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import StepTransition from './StepTransition';
import RegisterForm from './RegisterForm';

interface LoginFormProps {
  onLoginSuccess: () => void;
  goToPreviousStep: () => void;
  direction: number;
  currentStep: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  onShowRegister?: () => void; // Added to match usage in BookingSteps.tsx
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onLoginSuccess, 
  goToPreviousStep,
  direction,
  currentStep,
  isFirstStep,
  isLastStep,
  onShowRegister
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.session) {
        console.log('Login successful, session established');
        toast.success('Login realizado com sucesso!');
        onLoginSuccess(); // Proceed with booking flow
      } else {
        throw new Error('Não foi possível estabelecer sessão após login');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSuccess = () => {
    toast.success('Cadastro realizado com sucesso!');
    onLoginSuccess();
  };

  const handleShowRegister = () => {
    if (onShowRegister) {
      onShowRegister();
    } else {
      setShowRegister(true);
    }
  };

  return (
    <StepTransition step={currentStep} direction={direction}>
      {showRegister ? (
        <RegisterForm 
          onRegisterSuccess={handleRegisterSuccess} 
          onShowLogin={() => setShowRegister(false)}
          goToPreviousStep={goToPreviousStep}
          direction={direction}
          currentStep={currentStep}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
        />
      ) : (
        <div className="space-y-4">
          <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow text-center rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-1">Entre na sua conta</h3>
            <p className="text-white/80 mb-4 text-sm">
              Faça login para continuar com sua reserva
            </p>
            
            {error && (
              <Alert variant="destructive" className="my-3">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
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
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <Button type="submit" className="w-full bg-amber-400 hover:bg-amber-500 text-[#002366]" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : 'Entrar'}
              </Button>
            </form>
            
            <div className="mt-4 text-center text-sm text-white">
              Não tem uma conta?{' '}
              <button 
                className="font-semibold text-amber-300 hover:underline" 
                onClick={handleShowRegister}
              >
                Cadastre-se
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
      )}
    </StepTransition>
  );
};

export default LoginForm;
