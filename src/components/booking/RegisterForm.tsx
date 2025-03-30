
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onShowLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onShowLogin }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signUp, signIn } = useAuth();
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    if (!email || !password || !firstName || !lastName) {
      setError('Por favor, preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }
    
    try {
      // Always register as client when from booking flow
      const userData = {
        accountType: 'client', // Force client role
        firstName,
        lastName,
        phone
      };
      
      console.log('Registering client account with data:', userData);
      
      const { error } = await signUp(email, password, userData);
      
      if (error) {
        setError(error.message);
      } else {
        toast.success('Cadastro realizado com sucesso!');
        const { error: loginError } = await signIn(email, password);
        
        if (!loginError) {
          onRegisterSuccess();
        } else {
          toast.info('Por favor, faça login com suas credenciais');
          onShowLogin();
        }
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-400/20 text-amber-300 mb-4">
          <UserPlus className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">Crie sua conta de cliente</h3>
        <p className="text-white/70 mt-2">
          Registre-se como cliente para finalizar sua reserva
        </p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-md text-sm border border-red-500/50">
          {error}
        </div>
      )}
      
      <form onSubmit={handleRegister} className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name" className="text-white">Nome</Label>
            <Input
              id="first-name"
              placeholder="Seu nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="bg-white/10 text-white border-amber-300/30 focus-visible:ring-amber-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last-name" className="text-white">Sobrenome</Label>
            <Input
              id="last-name"
              placeholder="Seu sobrenome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="bg-white/10 text-white border-amber-300/30 focus-visible:ring-amber-400"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-email" className="text-white">Email</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/10 text-white border-amber-300/30 focus-visible:ring-amber-400"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white">Telefone</Label>
          <Input
            id="phone"
            placeholder="Seu telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="bg-white/10 text-white border-amber-300/30 focus-visible:ring-amber-400"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-password" className="text-white">Senha</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/10 text-white border-amber-300/30 focus-visible:ring-amber-400"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-white">Confirmar Senha</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              Criando conta...
            </>
          ) : (
            'Criar Conta de Cliente'
          )}
        </Button>
        
        <div className="text-center text-sm text-white/70 mt-4">
          <p>
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={onShowLogin}
              className="text-amber-300 hover:text-amber-200 hover:underline"
            >
              Faça login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
