
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { isValidApiKey } from '@/utils/googlemaps';

interface MapApiKeyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveApiKey: (apiKey: string) => void;
}

const MapApiKeyForm: React.FC<MapApiKeyFormProps> = ({ 
  open, 
  onOpenChange,
  onSaveApiKey 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!apiKey || apiKey.length < 20) {
      toast.error('Por favor, insira uma chave de API válida');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Save the API key
      onSaveApiKey(apiKey);
      
      // Update localStorage for persistence (optional)
      localStorage.setItem('GOOGLE_MAPS_API_KEY', apiKey);
      
      toast.success('Chave da API salva com sucesso');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Erro ao salvar a chave da API');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar API do Google Maps</DialogTitle>
          <DialogDescription>
            Insira sua chave da API do Google Maps para habilitar recursos de mapa e sugestões de endereço.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Chave da API do Google Maps</Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSyC..."
              className="font-mono"
              required
            />
            <p className="text-xs text-gray-500">
              Você precisa habilitar as APIs: Places, Directions, Maps JavaScript e Geocoding
            </p>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Onde encontrar sua chave:</p>
            <ol className="list-decimal pl-4 mt-1 space-y-1">
              <li>Acesse o Console do Google Cloud</li>
              <li>Crie um projeto ou selecione um existente</li>
              <li>Habilite as APIs necessárias em "API e Serviços"</li>
              <li>Crie credenciais e copie a chave API</li>
            </ol>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MapApiKeyForm;
