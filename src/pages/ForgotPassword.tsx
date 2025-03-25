
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { CarFront, Plane, ArrowLeft, Loader2 } from 'lucide-react';
import TransitionEffect from '@/components/TransitionEffect';
import { useSiteLogo } from '@/hooks/useSiteLogo';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const { light: lightLogo, refreshLogos } = useSiteLogo();
  
  useEffect(() => {
    console.log('ForgotPassword: Refreshing logos');
    refreshLogos();
  }, [refreshLogos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, informe seu email');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        console.error('Password reset error:', error);
        toast.error('Não foi possível enviar o link de recuperação', {
          description: error.message
        });
      } else {
        setSuccess(true);
        toast.success('Link de recuperação enviado', {
          description: 'Verifique seu email para redefinir sua senha'
        });
      }
    } catch (err) {
      console.error('Error in password reset:', err);
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransitionEffect>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex justify-center items-center p-6">
          <Link to="/" className="flex items-center space-x-2">
            {lightLogo ? (
              <img 
                src={lightLogo} 
                alt="LaTransfer" 
                className="h-8 w-auto"
                key={`forgot-pwd-${lightLogo}`} // Forçar re-renderização com key mais específica
              />
            ) : (
              <>
                <div className="relative">
                  <CarFront className="h-6 w-6 text-secondary" />
                  <Plane className="h-5 w-5 text-primary absolute -top-2 -right-2 transform rotate-45" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  La<span className="text-primary">Transfer</span>
                </span>
              </>
            )}
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md shadow-lg animate-fade-in">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Recuperar Senha</CardTitle>
              <CardDescription className="text-center">
                {success 
                  ? 'Link de recuperação enviado para seu email'
                  : 'Informe seu email para receber um link de recuperação de senha'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {success ? (
                <div className="text-center space-y-4">
                  <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                    Um link para redefinir sua senha foi enviado para {email}.
                    Verifique sua caixa de entrada (e a pasta de spam).
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full rounded-full" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar link de recuperação'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Link 
                to="/auth" 
                className="text-sm flex items-center text-primary hover:underline"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Voltar para o login
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </TransitionEffect>
  );
};

export default ForgotPassword;
