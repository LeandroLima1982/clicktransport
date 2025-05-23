
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { createCompany, formatCNPJ } from '@/hooks/auth/services/companyService';

interface CompanyCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CompanyData {
  name: string;
  cnpj: string;
  status: string;
  user_id?: string | null;
}

const CompanyCreateForm: React.FC<CompanyCreateFormProps> = ({ 
  isOpen, 
  onClose,
  onSuccess
}) => {
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    cnpj: '',
    status: 'pending',
  });
  const [userEmail, setUserEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setCompanyData(prev => ({ ...prev, status: value }));
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setCompanyData(prev => ({ ...prev, cnpj: formatted }));
  };

  const validateForm = () => {
    if (!companyData.name.trim()) {
      setError('O nome da empresa é obrigatório');
      return false;
    }
    
    if (companyData.cnpj && companyData.cnpj.replace(/\D/g, '').length !== 14) {
      setError('CNPJ inválido');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let userId = null;
      
      if (userEmail.trim()) {
        const { data: existingUsers, error: searchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', userEmail.trim())
          .maybeSingle();
        
        if (searchError) throw searchError;
        
        if (existingUsers) {
          userId = existingUsers.id;
          
          const { data: existingCompany, error: companyCheckError } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
            
          if (companyCheckError) throw companyCheckError;
          
          if (existingCompany) {
            setError(`Este usuário já tem uma empresa associada (ID: ${existingCompany.id})`);
            setIsSubmitting(false);
            return;
          }
        } else {
          userId = null;
          toast.warning('Usuário não encontrado. A empresa será criada sem associação a um usuário.', {
            description: 'Você pode associar um usuário posteriormente.'
          });
        }
      }
      
      const companyDataWithUserId = {
        name: companyData.name.trim(),
        cnpj: companyData.cnpj || null,
        status: companyData.status,
        user_id: userId,
        manual_creation: true
      };
      
      const { data: newCompany, error: companyError } = await createCompany(companyDataWithUserId);
      
      if (companyError) throw new Error(companyError);
      
      toast.success('Empresa criada com sucesso', {
        description: userId ? 'Empresa associada ao usuário' : 'Empresa criada sem usuário associado'
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating company:', error);
      setError(error.message || 'Erro ao criar empresa');
      toast.error('Falha ao criar empresa', {
        description: error.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Empresa</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar uma nova empresa
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nome completo da empresa"
                value={companyData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                name="cnpj"
                placeholder="XX.XXX.XXX/XXXX-XX"
                value={companyData.cnpj}
                onChange={handleCNPJChange}
              />
              <p className="text-xs text-muted-foreground">
                Formato: XX.XXX.XXX/XXXX-XX
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={companyData.status} onValueChange={handleStatusChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                  <SelectItem value="suspended">Suspensa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="userEmail">E-mail do Usuário (Opcional)</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="email@exemplo.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Se fornecido, a empresa será associada a este usuário.
                Se o usuário não existir, uma conta será criada automaticamente.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Empresa'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyCreateForm;
