
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import TransitionEffect from '@/components/TransitionEffect';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('/lovable-uploads/8a9d78f7-0536-4e85-9c4b-0debc4c61fcf.png');

  useEffect(() => {
    const fetchLogoSetting = async () => {
      try {
        const { data, error } = await supabase
          .from('site_images')
          .select('image_url')
          .eq('section_id', 'logo')
          .single();
        
        if (error) {
          console.error('Error fetching logo from settings:', error);
          return;
        }
        
        if (data && data.image_url) {
          setLogoUrl(data.image_url);
        }
      } catch (error) {
        console.error('Error loading logo from settings:', error);
      }
    };

    fetchLogoSetting();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        toast.error('Erro ao enviar email de recuperação: ' + error.message);
        return;
      }
      
      setSent(true);
      toast.success('Email de recuperação enviado com sucesso!');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <TransitionEffect>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex justify-center items-center p-6">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={logoUrl} 
              alt="LaTransfer Logo" 
              className="h-10 w-auto" 
            />
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle>Recuperação de Senha</CardTitle>
              <CardDescription>
                {sent 
                  ? "Verifique seu email para instruções de recuperação de senha." 
                  : "Insira seu email para receber um link de recuperação de senha."}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {!sent ? (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading}
                    >
                      {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    Se o email existir em nosso sistema, você receberá um link para redefinir sua senha em breve.
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-center border-t pt-6">
              <div className="text-sm text-center">
                <Link to="/auth" className="text-primary hover:underline">
                  Voltar para login
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </TransitionEffect>
  );
};

export default ForgotPassword;
