
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const Profile: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  
  if (!user || userRole !== 'client') {
    return (
      <div className="container mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
        <p className="mb-6">Você precisa estar logado como cliente para acessar esta página.</p>
        <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
      </div>
    );
  }
  
  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-4">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 bg-primary/10 h-24 w-24 rounded-full flex items-center justify-center">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <CardTitle>{user.user_metadata?.full_name || user.email?.split('@')[0]}</CardTitle>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Nome Completo</span>
                  </div>
                  <p className="text-muted-foreground">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || "Não informado"}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center mb-2">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Email</span>
                  </div>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center mb-2">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Telefone</span>
                  </div>
                  <p className="text-muted-foreground">{user.user_metadata?.phone || "Não informado"}</p>
                </div>
                
                <div className="pt-4">
                  <Button>Atualizar Informações</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Alterar Senha
                </Button>
                <Button variant="destructive" className="w-full">
                  Excluir Conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TransitionEffect>
  );
};

export default Profile;
