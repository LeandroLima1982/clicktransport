
import { fetchAddressSuggestions } from '@/utils/googlemaps';
import { toast } from 'sonner';

// Handles address suggestion fetching and error handling
export const getSuggestions = async (
  value: string, 
  errorCount: number
): Promise<any[]> => {
  if (value.length < 3 || errorCount >= 5) {
    return [];
  }
  
  try {
    const suggestions = await fetchAddressSuggestions(value);
    return suggestions;
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    
    // Only show toast on first error
    if (errorCount === 0) {
      toast.error('Erro ao buscar sugestões de endereço. Tente um formato diferente.', {
        description: 'Exemplo: "Rua Nome, 123, Bairro, Cidade"'
      });
    }
    
    return [];
  }
};
