
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VehicleFormProps {
  companyId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ companyId, onSuccess, onCancel }) => {
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [type, setType] = useState('sedan');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!model || !licensePlate || !year) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          model,
          license_plate: licensePlate,
          year,
          company_id: companyId,
          status: 'active',
          type
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Veículo adicionado com sucesso!');
      onSuccess();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Erro ao adicionar veículo');
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
          value={model} 
          onChange={(e) => setModel(e.target.value)}
          placeholder="Ex: Toyota Corolla"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="licensePlate">Placa</Label>
        <Input 
          id="licensePlate" 
          value={licensePlate} 
          onChange={(e) => setLicensePlate(e.target.value)}
          placeholder="Ex: ABC1234"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="year">Ano</Label>
        <Input 
          id="year" 
          type="number"
          value={year} 
          onChange={(e) => setYear(parseInt(e.target.value))}
          min={1900}
          max={new Date().getFullYear() + 1}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Tipo de Veículo</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedan">Sedan</SelectItem>
            <SelectItem value="suv">SUV</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
            <SelectItem value="van">Van</SelectItem>
            <SelectItem value="minibus">Minibus</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adicionando...' : 'Adicionar Veículo'}
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm;
