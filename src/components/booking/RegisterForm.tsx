
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ChevronLeft } from 'lucide-react';
import StepTransition from './StepTransition';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onShowLogin: () => void;
  goToPreviousStep: () => void;
  direction?: number;
  currentStep?: number;
  isFirstStep?: boolean;
  isLastStep?: boolean;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onRegisterSuccess, 
  onShowLogin,
  goToPreviousStep,
  direction = 0,
  currentStep = 1,
  isFirstStep = false,
  isLastStep = false
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Register user with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            role: 'client',
          },
        },
      });
      
      if (error) throw error;
      
      toast.success('Cadastro realizado com sucesso!');
      onRegisterSuccess();
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StepTransition step={currentStep} direction={direction}>
      <div className="space-y-4">
        <div className="booking-input-container p-3 hover:bg-white/20 shadow-lg input-shadow rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-1">Crie sua conta</h3>
          <p className="text-white/80 mb-4 text-sm">
            Crie uma conta para continuar com sua reserva
          </p>
          
          {error && (
            <Alert variant="destructive" className="my-3">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2 text-left">
                <Label htmlFor="firstName" className="text-white">Nome</Label>
                <Input
                  id="firstName"
                  placeholder="Seu nome"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-2 text-left">
                <Label htmlFor="lastName" className="text-white">Sobrenome</Label>
                <Input
                  id="lastName"
                  placeholder="Seu sobrenome"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2 text-left">
              <Label htmlFor="register-email" className="text-white">Email</Label>
              <Input
                id="register-email"
                type="email"
                placeholder="seu-email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2 text-left">
              <Label htmlFor="phone" className="text-white">Telefone/WhatsApp</Label>
              <Input
                id="phone"
                placeholder="(XX) XXXXX-XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2 text-left">
              <Label htmlFor="register-password" className="text-white">Senha</Label>
              <Input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2 text-left">
              <Label htmlFor="confirm-password" className="text-white">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <Button type="submit" className="w-full bg-amber-400 hover:bg-amber-500 text-[#002366]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : 'Criar Conta'}
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm text-white">
            Já tem uma conta?{' '}
            <button 
              className="font-semibold text-amber-300 hover:underline" 
              onClick={onShowLogin}
            >
              Entrar
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
    </StepTransition>
  );
};

export default RegisterForm;
