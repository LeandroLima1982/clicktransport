
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import CityLookup from './CityLookup';

interface CityFormProps {
  initialData?: {
    id?: string;
    name: string;
    state?: string;
    country?: string;
    latitude: number;
    longitude: number;
    is_active?: boolean;
  } | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const CityForm: React.FC<CityFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: initialData?.id || '',
    name: initialData?.name || '',
    state: initialData?.state || '',
    country: initialData?.country || 'Brasil',
    latitude: initialData?.latitude || 0,
    longitude: initialData?.longitude || 0,
    is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        state: initialData.state || '',
        country: initialData.country || 'Brasil',
        latitude: initialData.latitude || 0,
        longitude: initialData.longitude || 0,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLocationSelected = (location: any) => {
    setFormData(prev => ({
      ...prev,
      name: location.name || prev.name,
      state: location.state || prev.state,
      country: location.country || 'Brasil',
      latitude: location.latitude || prev.latitude,
      longitude: location.longitude || prev.longitude,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome da cidade é obrigatório';
    }
    
    if (formData.latitude === 0 && formData.longitude === 0) {
      newErrors.location = 'Coordenadas válidas são obrigatórias';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Cidade*</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nome da cidade"
            required
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Estado"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">País</Label>
        <Input
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          placeholder="País"
        />
      </div>

      <div className="space-y-2">
        <Label>Coordenadas*</Label>
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
            placeholder="Latitude"
            required
            className={errors.location ? 'border-red-500' : ''}
          />
          <Input
            name="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={handleChange}
            placeholder="Longitude"
            required
            className={errors.location ? 'border-red-500' : ''}
          />
        </div>
        {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
      </div>

      <div className="pt-2">
        <CityLookup onLocationSelected={handleLocationSelected} />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is-active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="is-active">Cidade Ativa</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Atualizar' : 'Adicionar'} Cidade
        </Button>
      </div>
    </form>
  );
};

export default CityForm;
