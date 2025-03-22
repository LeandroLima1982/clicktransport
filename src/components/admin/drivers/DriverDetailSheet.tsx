import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, Mail, Building2, Calendar, Car, User, Key, RotateCw, 
  ShieldAlert, ShieldCheck, ShieldX, Clock
} from 'lucide-react';
import { Driver } from '@/hooks/auth/types';
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatRelativeDate } from '@/components/company/orders/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

interface Company {
  id: string;
  name: string;
}

interface Driver {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  license_number: string | null;
  last_login: string | null;
  is_password_changed: boolean | null;
  company_id: string | null;
  vehicle_id: string | null;
  companies?: {
    name: string;
    id: string;
  } | null;
}

interface DriverDetailSheetProps {
  driver: Driver;
  isOpen: boolean;
  onClose: () => void;
  onResetPassword: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
  companies: Company[];
}

const DriverDetailSheet: React.FC<DriverDetailSheetProps> = ({
  driver,
  isOpen,
  onClose,
  onResetPassword,
  onStatusChange,
  companies
}) => {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(driver.company_id);

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Inativo</Badge>;
      case 'on_trip':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Em Viagem</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Indefinido</Badge>;
    }
  };

  const handleCompanyChange = async (companyId: string) => {
    try {
      setIsUpdating(true);
      setSelectedCompany(companyId);
      
      const { error } = await supabase
        .from('drivers')
        .update({ company_id: companyId })
        .eq('id', driver.id);
      
      if (error) throw error;
      
      toast.success('Empresa atualizada com sucesso');
      
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Erro ao atualizar empresa');
      // Reset to original value
      setSelectedCompany(driver.company_id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-xl">{driver.name}</SheetTitle>
            <SheetDescription>Detalhes do motorista</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Status</h3>
              {getStatusBadge(driver.status)}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Button 
                  variant={driver.status === 'active' ? "default" : "outline"}
                  className="flex-1 mr-2"
                  onClick={() => onStatusChange(driver.id, 'active')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Ativar
                </Button>
                <Button 
                  variant={driver.status === 'inactive' ? "destructive" : "outline"}
                  className="flex-1"
                  onClick={() => onStatusChange(driver.id, 'inactive')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Desativar
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Empresa
              </h3>
              <Select 
                defaultValue={driver.company_id || ""} 
                onValueChange={handleCompanyChange}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </h3>
              <p className="text-slate-700 bg-slate-50 p-2 rounded">
                {driver.email || "Não informado"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                Telefone
              </h3>
              <p className="text-slate-700 bg-slate-50 p-2 rounded">
                {driver.phone || "Não informado"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Car className="h-4 w-4 mr-2" />
                CNH
              </h3>
              <p className="text-slate-700 bg-slate-50 p-2 rounded">
                {driver.license_number || "Não informado"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Último Acesso
              </h3>
              <p className="text-slate-700 bg-slate-50 p-2 rounded">
                {driver.last_login ? formatRelativeDate(driver.last_login) : "Nunca acessou"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center">
                <Key className="h-4 w-4 mr-2" />
                Status da Senha
              </h3>
              <p className="text-slate-700 bg-slate-50 p-2 rounded flex justify-between items-center">
                <span>
                  {driver.is_password_changed 
                    ? "Senha personalizada"
                    : "Senha provisória"}
                </span>
                <Badge className={driver.is_password_changed 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"}>
                  {driver.is_password_changed ? "OK" : "Pendente"}
                </Badge>
              </p>
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setIsResetConfirmOpen(true)}
            >
              <Key className="h-4 w-4 mr-2" />
              Redefinir Senha
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redefinir senha do motorista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá gerar uma nova senha provisória para o motorista. A senha atual será invalidada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              onResetPassword(driver.id);
              setIsResetConfirmOpen(false);
            }}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DriverDetailSheet;
