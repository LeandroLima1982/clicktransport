
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { VehicleForm as VehicleFormType } from './types';
import { Vehicle } from '@/types/vehicle';

interface VehicleFormProps {
  companyId: string;
  onSuccess: () => void;
  onCancel: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  vehicle?: Vehicle | null;
  isEditing?: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ 
  companyId, 
  onSuccess, 
  onCancel, 
  open,
  onOpenChange,
  vehicle,
  isEditing = false
}) => {
  const [form, setForm] = useState<VehicleFormType>({
    id: vehicle?.id || '',
    model: vehicle?.model || '',
    license_plate: vehicle?.license_plate || '',
    year: vehicle?.year?.toString() || new Date().getFullYear().toString(),
    status: vehicle?.status || 'active'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.model || !form.license_plate) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEditing && form.id) {
        const { error } = await supabase
          .from('vehicles')
          .update({
            model: form.model,
            license_plate: form.license_plate,
            year: form.year ? parseInt(form.year) : null,
            status: form.status,
          })
          .eq('id', form.id);
        
        if (error) throw error;
        
        toast.success('Veículo atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('vehicles')
          .insert({
            model: form.model,
            license_plate: form.license_plate,
            year: form.year ? parseInt(form.year) : null,
            company_id: companyId,
            status: form.status || 'active',
          });
        
        if (error) throw error;
        
        toast.success('Veículo adicionado com sucesso!');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      toast.error('Erro ao salvar veículo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="model">Modelo</Label>
        <Input 
          id="model" 
          name="model"
          value={form.model} 
          onChange={handleInputChange}
          placeholder="Ex: Toyota Corolla"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="license_plate">Placa</Label>
        <Input 
          id="license_plate" 
          name="license_plate"
          value={form.license_plate} 
          onChange={handleInputChange}
          placeholder="Ex: ABC1234"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="year">Ano</Label>
        <Input 
          id="year" 
          name="year"
          type="number"
          value={form.year} 
          onChange={handleInputChange}
          min={1900}
          max={new Date().getFullYear() + 1}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={form.status} 
          onValueChange={(value) => handleSelectChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="maintenance">Em manutenção</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditing ? 'Atualizar Veículo' : 'Adicionar Veículo'}
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm;
