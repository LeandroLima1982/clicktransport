
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin } from 'lucide-react';
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
    address?: string;
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
    address: initialData?.address || '',
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
        address: initialData.address || '',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Convert state to uppercase if it's a state field and limit to 2 characters
    if (name === 'state') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value.toUpperCase().substring(0, 2)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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
    // Extract the state abbreviation when a location is selected
    const stateAbbreviation = location.state 
      ? location.state.substring(0, 2).toUpperCase() 
      : '';
      
    setFormData(prev => ({
      ...prev,
      name: location.name || prev.name,
      state: stateAbbreviation,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 p-6 bg-white shadow-sm rounded-lg border border-gray-100">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Dados da Cidade</h3>
          <p className="text-sm text-gray-500">Adicione as informações básicas da cidade</p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">Nome da Cidade*</Label>
            <div className="relative">
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome da cidade"
                required
                className={`pl-9 ${errors.name ? 'border-red-500' : ''}`}
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state" className="text-gray-700">UF</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="UF"
              maxLength={2}
              className="uppercase"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-gray-700">País</Label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="País"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-gray-700">Endereço Completo (opcional)</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Digite o endereço completo da cidade (rua, número, bairro, etc.)"
            className="min-h-[100px] resize-y"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700">Coordenadas*</Label>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="latitude" className="text-xs text-gray-500">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Latitude"
                required
                className={errors.location ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label htmlFor="longitude" className="text-xs text-gray-500">Longitude</Label>
              <Input
                name="longitude"
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Longitude"
                required
                className={errors.location ? 'border-red-500' : ''}
              />
            </div>
          </div>
          {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>
      </div>

      <div className="pt-2">
        <CityLookup onLocationSelected={handleLocationSelected} />
      </div>

      <div className="bg-white p-4 shadow-sm rounded-lg border border-gray-100 space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is-active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is-active" className="cursor-pointer">Cidade Ativa</Label>
        </div>
        
        <p className="text-sm text-gray-500">
          Cidades inativas não aparecerão nas opções de seleção para os usuários.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting}
          className="px-4"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="px-5"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Atualizar' : 'Adicionar'} Cidade
        </Button>
      </div>
    </form>
  );
};

export default CityForm;
