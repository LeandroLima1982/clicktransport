
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
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
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">{user.email?.split('@')[0]}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm mt-2">Cliente desde {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
              <Separator className="mb-6" />
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input id="firstName" placeholder="Seu nome" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input id="lastName" placeholder="Seu sobrenome" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input id="email" type="email" value={user.email} disabled />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input id="phone" placeholder="(XX) XXXXX-XXXX" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="birthdate">Data de Nascimento</Label>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input id="birthdate" type="date" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button>Salvar Alterações</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TransitionEffect>
  );
};

export default Profile;
