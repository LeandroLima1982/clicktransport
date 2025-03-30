
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface RegisterFormProps {
  handleRegister: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  isBusinessUser: boolean;
  toggleUserType: () => void;
  accountType: string;
  setAccountType: (type: string) => void;
  setActiveTab: (tab: string) => void;
}

// Shared schema parts
const nameSchema = z.object({
  firstName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  lastName: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
});

const contactSchema = z.object({
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido').max(15, 'Telefone muito longo'),
});

// Modified to not use refine which returns ZodEffects instead of ZodObject
const passwordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Por favor confirme sua senha'),
});

// Client schema
const clientSchema = nameSchema.merge(contactSchema).merge(passwordSchema);

// Company schema adds company name
const companySchema = nameSchema.merge(contactSchema).merge(passwordSchema).extend({
  companyName: z.string().min(3, 'Nome da empresa deve ter pelo menos 3 caracteres'),
  cnpj: z.string().min(14, 'CNPJ inválido').max(18, 'CNPJ inválido').optional(),
});

// Union type for all possible form values
type RegisterFormValues = z.infer<typeof clientSchema> | z.infer<typeof companySchema>;

const RegisterForm: React.FC<RegisterFormProps> = ({
  handleRegister,
  loading,
  isBusinessUser,
  toggleUserType,
  accountType,
  setAccountType,
  setActiveTab
}) => {
  // Dynamic schema based on user type
  const schema = isBusinessUser ? companySchema : clientSchema;
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      ...(isBusinessUser ? { companyName: '', cnpj: '' } : {})
    },
    // Add custom validation for password confirmation
    mode: 'onBlur'
  });

  // Add custom validation for password confirmation
  const validatePasswords = (data: RegisterFormValues) => {
    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', {
        type: 'manual',
        message: 'As senhas não coincidem'
      });
      return false;
    }
    return true;
  };

  const onSubmit = async (data: RegisterFormValues) => {
    // First validate passwords match
    if (!validatePasswords(data)) {
      return;
    }
    
    const formData = new FormData();
    
    // Add all form values to FormData
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    
    // Add account type
    formData.append('accountType', accountType);
    
    // Create a synthetic event with the formData
    const event = {
      preventDefault: () => {},
      target: { elements: { 
        'reg-email': { value: data.email },
        'reg-password': { value: data.password },
        'confirm-password': { value: data.confirmPassword },
        'first-name': { value: data.firstName },
        'last-name': { value: data.lastName },
        'phone': { value: data.phone },
        ...('companyName' in data ? { 'company-name': { value: data.companyName } } : {}),
        ...('cnpj' in data ? { 'cnpj': { value: data.cnpj } } : {})
      }}
    } as unknown as React.FormEvent;
    
    // Call the original handler
    await handleRegister(event);
  };

  // Handle CNPJ formatting
  const formatCNPJ = (value: string) => {
    // Remove non-digits
    let digits = value.replace(/\D/g, '');
    if (digits.length > 14) digits = digits.slice(0, 14);
    
    // Format: XX.XXX.XXX/XXXX-XX
    if (digits.length > 12) {
      return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    } else if (digits.length > 8) {
      return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '$1.$2.$3/$4');
    } else if (digits.length > 5) {
      return digits.replace(/^(\d{2})(\d{3})(\d+)$/, '$1.$2.$3');
    } else if (digits.length > 2) {
      return digits.replace(/^(\d{2})(\d+)$/, '$1.$2');
    }
    
    return digits;
  };

  return (
    <TabsContent value="register">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex justify-center mb-4">
              <Button 
                type="button" 
                variant={isBusinessUser ? "default" : "outline"}
                className="rounded-l-full"
                onClick={() => !isBusinessUser && toggleUserType()}
              >
                Business
              </Button>
              <Button 
                type="button" 
                variant={!isBusinessUser ? "default" : "outline"}
                className="rounded-r-full"
                onClick={() => isBusinessUser && toggleUserType()}
              >
                Client
              </Button>
            </div>
            
            {isBusinessUser && (
              <div className="space-y-2">
                <FormLabel htmlFor="reg-account-type">
                  Tipo de Conta
                </FormLabel>
                <Select
                  value={accountType}
                  onValueChange={setAccountType}
                  defaultValue="company"
                >
                  <SelectTrigger id="reg-account-type">
                    <SelectValue placeholder="Selecione o tipo de conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Empresa de Transporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {isBusinessUser && accountType === 'company' && (
              <>
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome da sua empresa" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="XX.XXX.XXX/XXXX-XX" 
                          value={formatCNPJ(field.value || '')}
                          onChange={(e) => {
                            field.onChange(formatCNPJ(e.target.value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Seu nome" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sobrenome</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Seu sobrenome" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="nome@exemplo.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Seu número de telefone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Senha</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                isBusinessUser ? 'Criar Conta Empresarial' : 'Criar Conta de Cliente'
              )}
            </Button>
            
            <div className="text-sm text-center text-foreground/70">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-primary hover:underline"
              >
                Entrar
              </button>
            </div>
          </CardFooter>
        </form>
      </Form>
    </TabsContent>
  );
};

export default RegisterForm;
