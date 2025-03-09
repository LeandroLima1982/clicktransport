import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input'; 
import { Label } from '@/components/ui/label';
import { CheckCircle, ArrowRight, ArrowLeft, Car, Clock, MapPin, CreditCard, Users, Calendar, CheckCheck, LogIn, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const vehicleOptions = [
  {
    id: 1,
    name: 'Sedan Executivo',
    image: '/lovable-uploads/sedan-exec.jpg',
    description: 'Conforto para até 4 passageiros',
    capacity: 4,
    pricePerKm: 3.5,
    basePrice: 120,
  },
  {
    id: 2,
    name: 'SUV Premium',
    image: '/lovable-uploads/suv-premium.jpg',
    description: 'Espaço e conforto para até 6 passageiros',
    capacity: 6,
    pricePerKm: 4.2,
    basePrice: 180,
  },
  {
    id: 3,
    name: 'Van Executiva',
    image: '/lovable-uploads/van-exec.jpg',
    description: 'Ideal para grupos de até 10 passageiros',
    capacity: 10,
    pricePerKm: 5.8,
    basePrice: 250,
  },
];

const paymentMethods = [
  { id: 'credit', name: 'Cartão de Crédito', icon: 'credit-card' },
  { id: 'pix', name: 'PIX', icon: 'qr-code' },
  { id: 'bank', name: 'Transferência Bancária', icon: 'bank' },
  { id: 'company', name: 'Faturar para Empresa', icon: 'building' },
];

interface BookingStepsProps {
  bookingData: {
    origin: string;
    destination: string;
    date: Date | undefined;
    returnDate: Date | undefined;
    tripType: 'oneway' | 'roundtrip';
    passengers: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const BookingSteps: React.FC<BookingStepsProps> = ({ bookingData, isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginIsLoading, setLoginIsLoading] = useState(false);
  const [accountType, setAccountType] = useState('company');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registerIsLoading, setRegisterIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const { user, signIn, signUp } = useAuth();

  const estimatedDistance = 120;
  const estimatedTime = 95;

  const calculatePrice = () => {
    if (!selectedVehicle) return 0;
    const vehicle = vehicleOptions.find(v => v.id === selectedVehicle);
    if (!vehicle) return 0;
    
    const distancePrice = vehicle.pricePerKm * estimatedDistance;
    const totalPrice = vehicle.basePrice + distancePrice;
    
    return bookingData.tripType === 'roundtrip' ? totalPrice * 2 : totalPrice;
  };

  const totalPrice = calculatePrice();

  const handleVehicleSelect = (vehicleId: number) => {
    setSelectedVehicle(vehicleId);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedVehicle) {
      toast.error('Selecione um veículo para continuar');
      return;
    }
    
    if (currentStep === 3 && !selectedPaymentMethod) {
      toast.error('Selecione um método de pagamento para continuar');
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!user) {
        setShowLoginForm(true);
      } else {
        handleSubmitBooking();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    setLoginIsLoading(true);
    
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      
      if (error) {
        toast.error('Erro ao fazer login: ' + error.message);
      } else {
        toast.success('Login realizado com sucesso!');
        setShowLoginForm(false);
        handleSubmitBooking();
      }
    } catch (error) {
      toast.error('Ocorreu um erro durante o login');
      console.error('Login error:', error);
    } finally {
      setLoginIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterIsLoading(true);
    setRegisterError(null);
    
    if (!registerEmail || !registerPassword || !firstName || !lastName) {
      setRegisterError('Por favor, preencha todos os campos obrigatórios');
      setRegisterIsLoading(false);
      return;
    }
    
    if (registerPassword !== confirmPassword) {
      setRegisterError('As senhas não coincidem');
      setRegisterIsLoading(false);
      return;
    }
    
    if (accountType === 'company' && !companyName) {
      setRegisterError('Nome da empresa é obrigatório para conta empresarial');
      setRegisterIsLoading(false);
      return;
    }
    
    try {
      const userData = {
        accountType,
        firstName,
        lastName,
        phone,
        companyName
      };
      
      const { error } = await signUp(registerEmail, registerPassword, userData);
      
      if (error) {
        setRegisterError(error.message);
      } else {
        toast.success('Cadastro realizado com sucesso!');
        const { error: loginError } = await signIn(registerEmail, registerPassword);
        
        if (!loginError) {
          setShowRegisterForm(false);
          setShowLoginForm(false);
          handleSubmitBooking();
        } else {
          toast.info('Por favor, faça login com suas credenciais');
        }
      }
    } catch (error: any) {
      setRegisterError(error.message || 'Erro ao criar conta');
    } finally {
      setRegisterIsLoading(false);
    }
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const reference = 'TRF-' + Math.floor(100000 + Math.random() * 900000);
      setBookingReference(reference);
      setBookingComplete(true);
      
      toast.success('Reserva confirmada com sucesso!');
    } catch (error) {
      toast.error('Erro ao confirmar reserva. Tente novamente.');
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    setCurrentStep(1);
    setSelectedVehicle(null);
    setSelectedPaymentMethod(null);
    setBookingComplete(false);
    setBookingReference('');
    setShowLoginForm(false);
    setShowRegisterForm(false);
    setLoginEmail('');
    setLoginPassword('');
    setAccountType('company');
    setFirstName('');
    setLastName('');
    setRegisterEmail('');
    setPhone('');
    setCompanyName('');
    setRegisterPassword('');
    setConfirmPassword('');
    setRegisterError(null);
    onClose();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const selectedVehicleDetails = vehicleOptions.find(v => v.id === selectedVehicle);

  const LoginForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          <LogIn className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold">Faça login para continuar</h3>
        <p className="text-gray-500 mt-2">
          Para finalizar sua reserva, é necessário fazer login
        </p>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={loginIsLoading}>
          {loginIsLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
        
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={() => {
                setShowLoginForm(false);
                setShowRegisterForm(true);
              }}
              className="text-primary hover:underline"
            >
              Registre-se
            </button>
          </p>
        </div>
      </form>
    </div>
  );

  const RegisterForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          <UserPlus className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold">Crie sua conta</h3>
        <p className="text-gray-500 mt-2">
          Registre-se para finalizar sua reserva
        </p>
      </div>
      
      {registerError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {registerError}
        </div>
      )}
      
      <form onSubmit={handleRegister} className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
        <div className="space-y-2">
          <Label htmlFor="account-type">Tipo de Conta</Label>
          <Select
            value={accountType}
            onValueChange={setAccountType}
          >
            <SelectTrigger id="account-type">
              <SelectValue placeholder="Selecione o tipo de conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="company">Empresa</SelectItem>
              <SelectItem value="driver">Motorista</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {accountType === 'company' && (
          <div className="space-y-2">
            <Label htmlFor="company-name">Nome da Empresa</Label>
            <Input
              id="company-name"
              placeholder="Nome da sua empresa"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">Nome</Label>
            <Input
              id="first-name"
              placeholder="Seu nome"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last-name">Sobrenome</Label>
            <Input
              id="last-name"
              placeholder="Seu sobrenome"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            type="email"
            placeholder="seu@email.com"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            placeholder="Seu telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="register-password">Senha</Label>
          <Input
            id="register-password"
            type="password"
            placeholder="********"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirmar Senha</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={registerIsLoading}>
          {registerIsLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar Conta'
          )}
        </Button>
        
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>
            Já tem uma conta?{' '}
            <button
              type="button"
              onClick={() => {
                setShowRegisterForm(false);
                setShowLoginForm(true);
              }}
              className="text-primary hover:underline"
            >
              Faça login
            </button>
          </p>
        </div>
      </form>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseAndReset}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {showLoginForm ? (
          <LoginForm />
        ) : showRegisterForm ? (
          <RegisterForm />
        ) : !bookingComplete ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Finalize sua reserva</DialogTitle>
              <DialogDescription>
                Sua viagem de {bookingData.origin} para {bookingData.destination}
                {bookingData.date && ` no dia ${format(bookingData.date, "dd 'de' MMMM", { locale: ptBR })}`}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4">
              <div className="flex justify-between mb-8">
                {['Veículo', 'Detalhes', 'Pagamento', 'Confirmação'].map((step, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col items-center ${index + 1 <= currentStep ? 'text-primary' : 'text-gray-400'}`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full mb-2 ${
                      index + 1 < currentStep ? 'bg-primary text-white' : 
                      index + 1 === currentStep ? 'border-2 border-primary text-primary' : 
                      'border-2 border-gray-300 text-gray-400'
                    }`}>
                      {index + 1 < currentStep ? <CheckCircle className="w-6 h-6" /> : index + 1}
                    </div>
                    <span className="text-xs font-medium">{step}</span>
                  </div>
                ))}
              </div>
              
              <div className="mb-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Escolha o veículo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {vehicleOptions.map((vehicle) => (
                        <Card 
                          key={vehicle.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedVehicle === vehicle.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handleVehicleSelect(vehicle.id)}
                        >
                          <div className="relative h-40 overflow-hidden rounded-t-lg">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                            <div 
                              className="absolute w-full h-full bg-gray-200"
                              style={{
                                backgroundImage: `url(${vehicle.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            />
                            {selectedVehicle === vehicle.id && (
                              <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full z-20">
                                <CheckCheck className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <CardHeader className="py-3">
                            <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                            <CardDescription>{vehicle.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="py-2">
                            <div className="flex items-center text-sm">
                              <Users className="mr-2 h-4 w-4" />
                              <span>Até {vehicle.capacity} passageiros</span>
                            </div>
                            <div className="mt-4 font-bold text-lg text-primary">
                              {formatCurrency(vehicle.basePrice)}
                            </div>
                            <div className="text-xs text-gray-500">
                              + {formatCurrency(vehicle.pricePerKm)}/km
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Detalhes da viagem</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-lg">
                            <Car className="mr-2 h-5 w-5 text-primary" />
                            Veículo Selecionado
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedVehicleDetails && (
                            <div className="space-y-2">
                              <div className="font-semibold text-lg">{selectedVehicleDetails.name}</div>
                              <div className="text-gray-600">{selectedVehicleDetails.description}</div>
                              <div className="flex items-center text-sm">
                                <Users className="mr-2 h-4 w-4" />
                                <span>Até {selectedVehicleDetails.capacity} passageiros</span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-lg">
                            <MapPin className="mr-2 h-5 w-5 text-primary" />
                            Trajeto
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <div className="text-sm text-gray-500">Origem:</div>
                              <div className="font-medium">{bookingData.origin}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Destino:</div>
                              <div className="font-medium">{bookingData.destination}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Distância estimada:</div>
                              <div className="font-medium">{estimatedDistance} km</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-lg">
                            <Calendar className="mr-2 h-5 w-5 text-primary" />
                            Data e Horário
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <div className="text-sm text-gray-500">Data de ida:</div>
                              <div className="font-medium">
                                {bookingData.date ? format(bookingData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não especificado'}
                              </div>
                            </div>
                            {bookingData.tripType === 'roundtrip' && (
                              <div>
                                <div className="text-sm text-gray-500">Data de volta:</div>
                                <div className="font-medium">
                                  {bookingData.returnDate ? format(bookingData.returnDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não especificado'}
                                </div>
                              </div>
                            )}
                            <div>
                              <div className="text-sm text-gray-500">Tipo de viagem:</div>
                              <div className="font-medium">
                                {bookingData.tripType === 'oneway' ? 'Somente ida' : 'Ida e volta'}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center text-lg">
                            <Clock className="mr-2 h-5 w-5 text-primary" />
                            Tempo e Custo
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <div className="text-sm text-gray-500">Tempo estimado:</div>
                              <div className="font-medium">{Math.floor(estimatedTime / 60)}h {estimatedTime % 60}min</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Passageiros:</div>
                              <div className="font-medium">{bookingData.passengers}</div>
                            </div>
                            <div>
                              <div className="text-sm text-gray-500">Valor estimado:</div>
                              <div className="font-bold text-lg text-primary">{formatCurrency(totalPrice)}</div>
                              <div className="text-xs text-gray-500">
                                {bookingData.tripType === 'roundtrip' ? '(Inclui ida e volta)' : ''}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Selecione a forma de pagamento</h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paymentMethods.map((method) => (
                          <div
                            key={method.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-primary ${
                              selectedPaymentMethod === method.id ? 'bg-primary/10 border-primary' : ''
                            }`}
                            onClick={() => handlePaymentMethodSelect(method.id)}
                          >
                            <div className="flex items-center">
                              <CreditCard className="mr-3 h-5 w-5 text-primary" />
                              <div className="font-medium">{method.name}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Card className="mt-6">
                        <CardHeader>
                          <CardTitle>Resumo do pedido</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Veículo</span>
                              <span>{selectedVehicleDetails?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Trajeto</span>
                              <span>{estimatedDistance} km</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tipo de viagem</span>
                              <span>{bookingData.tripType === 'oneway' ? 'Somente ida' : 'Ida e volta'}</span>
                            </div>
                            <div className="border-t my-2"></div>
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total</span>
                              <span className="text-primary">{formatCurrency(totalPrice)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
                
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Confirme sua reserva</h3>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="text-center mb-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
                              <CheckCircle className="w-8 h-8" />
                            </div>
                            <h4 className="text-lg font-bold">Tudo pronto!</h4>
                            <p className="text-gray-500">Revise os detalhes abaixo e confirme sua reserva</p>
                          </div>
                          
                          <div className="border-t border-b py-4 space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Veículo:</span>
                              <span className="font-medium">{selectedVehicleDetails?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Origem:</span>
                              <span className="font-medium">{bookingData.origin}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Destino:</span>
                              <span className="font-medium">{bookingData.destination}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Data:</span>
                              <span className="font-medium">
                                {bookingData.date ? format(bookingData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não especificado'}
                              </span>
                            </div>
                            {bookingData.tripType === 'roundtrip' && bookingData.returnDate && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Retorno:</span>
                                <span className="font-medium">
                                  {format(bookingData.returnDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-500">Passageiros:</span>
                              <span className="font-medium">{bookingData.passengers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Pagamento:</span>
                              <span className="font-medium">
                                {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name || 'Não selecionado'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2">
                            <span className="font-bold">Total:</span>
                            <span className="font-bold text-xl text-primary">{formatCurrency(totalPrice)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="flex items-center"
                >
                  {currentStep === 4 ? (
                    isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Reserva Confirmada!</h2>
            <p className="text-gray-500 mb-6">Sua reserva foi confirmada com sucesso.</p>
            
            <Card className="mx-auto max-w-md">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <div className="text-lg font-bold">Código de Reserva</div>
                  <div className="text-3xl font-mono tracking-wider text-primary my-2">{bookingReference}</div>
                  <div className="text-sm text-gray-500">Guarde este código para referência futura</div>
                </div>
                
                <div className="border-t border-b py-4 space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Veículo:</span>
                    <span className="font-medium">{selectedVehicleDetails?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Data:</span>
                    <span className="font-medium">
                      {bookingData.date ? format(bookingData.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Não especificado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total:</span>
                    <span className="font-medium text-primary">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-2">
                  <p className="text-sm text-gray-500">
                    Um email com os detalhes da sua reserva foi enviado para o seu endereço de email.
                  </p>
                  <p className="text-sm text-gray-500">
                    Nossa equipe entrará em contato para confirmar os detalhes da sua viagem.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCloseAndReset} className="w-full">
                  Concluir
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingSteps;

