
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Company } from '@/types/company';

// Form schema for company data
const formSchema = z.object({
  name: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  cnpj: z.string().optional(),
  status: z.string().default('active'),
});

type FormValues = z.infer<typeof formSchema>;

interface CompanyFormDialogProps {
  company: Company | null;
  isOpen: boolean;
  onClose: (shouldRefresh: boolean) => void;
}

const CompanyFormDialog: React.FC<CompanyFormDialogProps> = ({
  company,
  isOpen,
  onClose
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!company;

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cnpj: '',
      status: 'active',
    },
  });

  // Set form values when editing an existing company
  useEffect(() => {
    if (company) {
      form.reset({
        name: company.name,
        cnpj: company.cnpj || '',
        status: company.status,
      });
    } else {
      form.reset({
        name: '',
        cnpj: '',
        status: 'active',
      });
    }
  }, [company, form]);

  // Format CNPJ as user types (XX.XXX.XXX/XXXX-XX)
  const formatCNPJ = (value: string): string => {
    if (!value) return '';
    
    // Remove any non-digit characters
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

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Prepare data for Supabase (strip formatting from CNPJ)
      const formattedData = {
        ...data,
        cnpj: data.cnpj ? data.cnpj.replace(/\D/g, '') : null,
      };
      
      if (isEditing && company) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update(formattedData)
          .eq('id', company.id);
          
        if (error) throw error;
        toast.success('Empresa atualizada com sucesso');
      } else {
        // Create new company
        const { error } = await supabase
          .from('companies')
          .insert(formattedData);
          
        if (error) throw error;
        toast.success('Empresa criada com sucesso');
      }
      
      onClose(true); // Close and refresh the list
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Erro ao salvar empresa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize os dados da empresa abaixo' 
              : 'Preencha os dados da nova empresa abaixo'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome da empresa" />
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
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onClose(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyFormDialog;
