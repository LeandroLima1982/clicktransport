
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onShowLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onShowLogin }) => {
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
        onRegisterSuccess();
      } else {
        // No session yet, but registration in progress
        toast.info('Verifique seu email para confirmar o cadastro');
        onShowLogin();
      }
    } catch (error: any) {
      console.error('Register error:', error);
      setError(error.message || 'Erro ao fazer cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2 pb-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Criar uma conta</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre-se para concluir sua reserva
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input
            id="name"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email" 
            placeholder="seu-email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <p className="text-xs text-muted-foreground">
            Mínimo de 6 caracteres
          </p>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Processando...' : 'Cadastrar'}
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm">
        Já tem uma conta?{' '}
        <button 
          className="font-semibold text-primary hover:underline" 
          onClick={onShowLogin}
        >
          Faça login
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
