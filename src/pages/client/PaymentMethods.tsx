
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CreditCard, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const paymentMethodSchema = z.object({
  cardNumber: z.string().min(16, "Número de cartão inválido").max(19),
  cardholderName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  expiryDate: z.string().min(5, "Data de expiração inválida"),
  cvv: z.string().min(3, "CVV inválido").max(4),
});

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

interface PaymentMethod {
  id: string;
  lastFour: string;
  type: 'credit' | 'debit';
  expiryDate: string;
  cardholderName: string;
}

const PaymentMethods: React.FC = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      lastFour: '4242',
      type: 'credit',
      expiryDate: '12/25',
      cardholderName: 'João Silva'
    }
  ]);
  const [isAddingCard, setIsAddingCard] = useState(false);
  
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: '',
    },
  });
  
  const onSubmit = (data: PaymentMethodFormValues) => {
    const newCard: PaymentMethod = {
      id: `card_${Date.now()}`,
      lastFour: data.cardNumber.slice(-4),
      type: 'credit',
      expiryDate: data.expiryDate,
      cardholderName: data.cardholderName
    };
    
    setPaymentMethods([...paymentMethods, newCard]);
    setIsAddingCard(false);
    form.reset();
  };
  
  const handleDeleteCard = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };
  
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
            <h1 className="text-2xl md:text-3xl font-bold">Métodos de Pagamento</h1>
            <p className="text-muted-foreground">Gerencie seus cartões e formas de pagamento</p>
          </div>
          
          <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cartão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                <DialogDescription>
                  Preencha os dados do seu cartão para adicioná-lo à sua conta
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Cartão</FormLabel>
                        <FormControl>
                          <Input placeholder="4242 4242 4242 4242" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cardholderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome no Cartão</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome como aparece no cartão" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Expiração</FormLabel>
                          <FormControl>
                            <Input placeholder="MM/AA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="cvv"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CVV</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddingCard(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar Cartão</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {paymentMethods.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="mb-4 text-gray-400">
              <CreditCard className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg mb-2">Nenhum método de pagamento cadastrado</p>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione um cartão para facilitar suas reservas
              </p>
              <Button onClick={() => setIsAddingCard(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cartão
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {paymentMethods.map((method) => (
              <Card key={method.id} className="overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {method.type === 'credit' ? 'Cartão de Crédito' : 'Cartão de Débito'}
                    </span>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="mt-4 text-xl font-mono">
                    •••• •••• •••• {method.lastFour}
                  </div>
                  <div className="mt-4 flex justify-between text-sm">
                    <span>{method.cardholderName}</span>
                    <span>Validade: {method.expiryDate}</span>
                  </div>
                </div>
                <CardContent className="flex justify-end p-4">
                  <Button variant="outline" size="sm" className="mr-2">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteCard(method.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TransitionEffect>
  );
};

export default PaymentMethods;
