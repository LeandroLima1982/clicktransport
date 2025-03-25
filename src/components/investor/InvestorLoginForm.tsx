
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const InvestorLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Verificar se o usuário é um investidor
      const { data: investor, error: investorError } = await supabase
        .from('investors')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (investorError) {
        // Se não encontrou registro de investidor, verificar o perfil
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        // Se não for investidor ou admin, mostrar erro
        if (profile.role !== 'investor' && profile.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error('Acesso negado. Esta conta não tem perfil de investidor.');
        }
      }

      toast.success('Login realizado com sucesso!');
      navigate('/investor');
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-2 text-center">
        <TrendingUp className="mx-auto h-12 w-12 text-primary" />
        <h1 className="text-2xl font-bold">Login de Investidor</h1>
        <p className="text-sm text-muted-foreground">
          Entre com suas credenciais para acessar o painel de investidor
        </p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu.email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <a href="/auth/forgot-password" className="text-xs text-primary hover:underline">
              Esqueceu a senha?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Não tem uma conta? </span>
        <a href="/auth?register=true&type=investor" className="text-primary hover:underline">
          Solicite acesso
        </a>
      </div>
    </div>
  );
};

export default InvestorLoginForm;
