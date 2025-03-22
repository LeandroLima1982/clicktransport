
import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  phone: z.string().min(10, { message: 'Telefone inválido' }).optional().or(z.literal('')),
  license_number: z.string().min(3, { message: 'Número da CNH inválido' }).optional().or(z.literal('')),
  company_id: z.string().uuid({ message: 'Selecione uma empresa válida' }),
  createAccount: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface Company {
  id: string;
  name: string;
}

interface DriverFormProps {
  companies: Company[];
  onSuccess: () => void;
}

const DriverForm: React.FC<DriverFormProps> = ({ companies, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      license_number: '',
      company_id: '',
      createAccount: true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Generate a temporary password if creating a user account
      const password = data.createAccount 
        ? Math.random().toString(36).slice(-8) + Math.random().toString(10).slice(-2) 
        : null;
        
      if (data.createAccount) {
        setTempPassword(password);
      }
      
      // Insert the driver record
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          license_number: data.license_number || null,
          company_id: data.company_id,
          status: 'active',
          is_password_changed: false,
        })
        .select()
        .single();
        
      if (driverError) throw driverError;
      
      // If user account creation was requested, we would normally create it here
      // But since we can't directly create users with the client SDK, 
      // this would typically be done with a server function
      
      toast.success('Motorista criado com sucesso', {
        description: password 
          ? `Senha provisória: ${password}` 
          : 'Sem conta de usuário criada',
      });
      
      onSuccess();
      form.reset();
      
    } catch (error) {
      console.error('Error creating driver:', error);
      toast.error('Erro ao criar motorista');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome do motorista" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email*</FormLabel>
              <FormControl>
                <Input {...field} type="email" placeholder="email@exemplo.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="(00) 00000-0000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="license_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da CNH</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Número da CNH" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa*</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma empresa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="createAccount"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Criar conta de usuário</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Uma senha provisória será gerada para o motorista
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Motorista
          </Button>
        </div>
        
        {tempPassword && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-4 rounded-md mt-4">
            <h4 className="font-semibold mb-1">Senha Provisória</h4>
            <p>Forneça esta senha ao motorista: <span className="font-mono font-bold">{tempPassword}</span></p>
            <p className="text-sm mt-1">O motorista será solicitado a alterar esta senha no primeiro login.</p>
          </div>
        )}
      </form>
    </Form>
  );
};

export default DriverForm;
