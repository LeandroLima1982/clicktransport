
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const PaymentMethods: React.FC = () => {
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
  
  // Exemplo de cartões (em uma aplicação real, estes seriam carregados do backend)
  const paymentMethods = [
    { id: 1, type: 'Visa', last4: '4242', expiryMonth: 12, expiryYear: 2025, isDefault: true },
    { id: 2, type: 'Mastercard', last4: '5555', expiryMonth: 10, expiryYear: 2024, isDefault: false },
  ];
  
  const handleAddCard = () => {
    toast.info('Funcionalidade de adicionar cartão será implementada em breve.');
  };
  
  const handleRemoveCard = (id: number) => {
    toast.success('Cartão removido com sucesso.');
  };
  
  const handleSetDefault = (id: number) => {
    toast.success('Cartão definido como padrão.');
  };
  
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
            <h1 className="text-2xl md:text-3xl font-bold">Métodos de Pagamento</h1>
            <p className="text-muted-foreground">Gerencie seus cartões e formas de pagamento</p>
          </div>
          
          <Button 
            onClick={handleAddCard}
            className="mt-4 md:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Cartão
          </Button>
        </div>
        
        {paymentMethods.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mb-4 text-gray-400">
              <CreditCard className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg mb-2">Você ainda não possui cartões cadastrados</p>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione um cartão para facilitar seus pagamentos!
              </p>
              <Button onClick={handleAddCard}>Adicionar Cartão</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {paymentMethods.map((card) => (
              <Card key={card.id} className="p-6 relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-14 bg-gray-100 rounded flex items-center justify-center mr-4">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{card.type}</span>
                        {card.isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                            Padrão
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        **** **** **** {card.last4}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Expira em {card.expiryMonth}/{card.expiryYear}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!card.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefault(card.id)}
                      >
                        Definir como Padrão
                      </Button>
                    )}
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Cartão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover este cartão? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveCard(card.id)}>
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TransitionEffect>
  );
};

export default PaymentMethods;
