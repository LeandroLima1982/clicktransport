
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Loader2, RefreshCw, EyeIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Color options
const colorOptions = [
  { value: 'black', label: 'Preto', sample: 'bg-black' },
  { value: 'white', label: 'Branco', sample: 'bg-white' },
  { value: 'slate', label: 'Cinza', sample: 'bg-slate-500' },
  { value: 'zinc', label: 'Cinza Escuro', sample: 'bg-zinc-700' },
  { value: 'gray', label: 'Cinza Claro', sample: 'bg-gray-400' },
  { value: 'red', label: 'Vermelho', sample: 'bg-red-500' },
  { value: 'orange', label: 'Laranja', sample: 'bg-orange-500' },
  { value: 'amber', label: 'Âmbar', sample: 'bg-amber-500' },
  { value: 'yellow', label: 'Amarelo', sample: 'bg-yellow-500' },
  { value: 'lime', label: 'Lima', sample: 'bg-lime-500' },
  { value: 'green', label: 'Verde', sample: 'bg-green-500' },
  { value: 'emerald', label: 'Esmeralda', sample: 'bg-emerald-500' },
  { value: 'teal', label: 'Turquesa', sample: 'bg-teal-500' },
  { value: 'cyan', label: 'Ciano', sample: 'bg-cyan-500' },
  { value: 'sky', label: 'Céu', sample: 'bg-sky-500' },
  { value: 'blue', label: 'Azul', sample: 'bg-blue-500' },
  { value: 'indigo', label: 'Índigo', sample: 'bg-indigo-500' },
  { value: 'violet', label: 'Violeta', sample: 'bg-violet-500' },
  { value: 'purple', label: 'Roxo', sample: 'bg-purple-500' },
  { value: 'fuchsia', label: 'Fúcsia', sample: 'bg-fuchsia-500' },
  { value: 'pink', label: 'Rosa', sample: 'bg-pink-500' },
  { value: 'rose', label: 'Rose', sample: 'bg-rose-500' },
  { value: 'transparent', label: 'Transparente', sample: 'bg-transparent border border-dashed' }
];

// Text color options with opacity
const textColorOptions = [
  { value: 'white', label: 'Branco', sample: 'bg-white' },
  { value: 'black', label: 'Preto', sample: 'bg-black' },
  { value: 'slate-100', label: 'Cinza Claro', sample: 'bg-slate-100' },
  { value: 'slate-800', label: 'Cinza Escuro', sample: 'bg-slate-800' },
  { value: 'zinc-100', label: 'Cinza Muito Claro', sample: 'bg-zinc-100' },
  { value: 'zinc-800', label: 'Cinza Muito Escuro', sample: 'bg-zinc-800' },
  { value: 'amber-200', label: 'Âmbar Claro', sample: 'bg-amber-200' },
  { value: 'amber-500', label: 'Âmbar', sample: 'bg-amber-500' },
  { value: 'yellow-200', label: 'Amarelo Claro', sample: 'bg-yellow-200' },
  { value: 'teal-200', label: 'Turquesa Claro', sample: 'bg-teal-200' },
  { value: 'sky-200', label: 'Azul Claro', sample: 'bg-sky-200' },
  { value: 'blue-200', label: 'Azul Claro', sample: 'bg-blue-200' },
  { value: 'indigo-200', label: 'Índigo Claro', sample: 'bg-indigo-200' },
  { value: 'purple-200', label: 'Roxo Claro', sample: 'bg-purple-200' },
  { value: 'pink-200', label: 'Rosa Claro', sample: 'bg-pink-200' }
];

interface HeroStyles {
  id?: string;
  gradient_from_color: string;
  gradient_from_opacity: number;
  gradient_to_color: string;
  gradient_to_opacity: number;
  title_color: string;
  description_color: string;
}

const defaultStyles: HeroStyles = {
  gradient_from_color: 'black',
  gradient_from_opacity: 40,
  gradient_to_color: 'transparent',
  gradient_to_opacity: 0,
  title_color: 'white',
  description_color: 'white/90'
};

const HeroStylesEditor: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [styles, setStyles] = useState<HeroStyles>(defaultStyles);
  const [activeTab, setActiveTab] = useState('gradient');
  const [gradientPreview, setGradientPreview] = useState<string>('');
  
  useEffect(() => {
    fetchHeroStyles();
  }, []);
  
  useEffect(() => {
    // Update gradient preview
    updateGradientPreview();
  }, [styles.gradient_from_color, styles.gradient_from_opacity, styles.gradient_to_color, styles.gradient_to_opacity]);
  
  const updateGradientPreview = () => {
    const preview = `bg-gradient-to-b from-${styles.gradient_from_color}/${styles.gradient_from_opacity} to-${styles.gradient_to_color}/${styles.gradient_to_opacity}`;
    setGradientPreview(preview);
  };
  
  const fetchHeroStyles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hero_styles')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching hero styles:', error);
        if (error.code !== 'PGRST116') { // Not found error
          toast.error('Erro ao carregar estilos do hero');
        }
      } else if (data) {
        setStyles({
          id: data.id,
          gradient_from_color: data.gradient_from_color,
          gradient_from_opacity: data.gradient_from_opacity,
          gradient_to_color: data.gradient_to_color,
          gradient_to_opacity: data.gradient_to_opacity,
          title_color: data.title_color,
          description_color: data.description_color
        });
      }
    } catch (error) {
      console.error('Error processing hero styles:', error);
      toast.error('Erro ao processar estilos do hero');
    } finally {
      setLoading(false);
    }
  };
  
  const saveHeroStyles = async () => {
    setLoading(true);
    try {
      // Get the current timestamp
      const now = new Date().toISOString();
      
      // Define styles to save
      const stylesToSave = {
        ...styles,
        updated_at: now
      };
      
      let result;
      
      if (styles.id) {
        // Update existing record
        result = await supabase
          .from('hero_styles')
          .update(stylesToSave)
          .eq('id', styles.id);
      } else {
        // Insert new record
        result = await supabase
          .from('hero_styles')
          .insert({
            ...stylesToSave,
            created_at: now
          });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast.success('Estilos do hero salvos com sucesso');
      await fetchHeroStyles(); // Reload the data
    } catch (error: any) {
      console.error('Error saving hero styles:', error);
      toast.error('Erro ao salvar estilos do hero', {
        description: error.message || 'Tente novamente mais tarde.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSliderChange = (name: keyof HeroStyles, value: number[]) => {
    setStyles({
      ...styles,
      [name]: value[0]
    });
  };
  
  const handleSelectChange = (name: keyof HeroStyles, value: string) => {
    setStyles({
      ...styles,
      [name]: value
    });
  };
  
  const resetToDefaults = () => {
    setStyles({
      ...styles,
      ...defaultStyles
    });
    toast.info('Estilos restaurados para os valores padrão');
  };
  
  const previewInNewTab = () => {
    window.open('/', '_blank');
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Estilos do Hero</CardTitle>
        <CardDescription>
          Configure as cores e opacidade do gradiente e dos textos da seção principal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="gradient">Gradiente</TabsTrigger>
            <TabsTrigger value="text">Textos</TabsTrigger>
            <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gradient" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cor Inicial do Gradiente</Label>
                <Select 
                  value={styles.gradient_from_color} 
                  onValueChange={(value) => handleSelectChange('gradient_from_color', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className={`${color.sample} h-4 w-4 rounded-full mr-2`}></div>
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Opacidade Inicial ({styles.gradient_from_opacity}%)</Label>
                </div>
                <Slider
                  value={[styles.gradient_from_opacity]}
                  min={0}
                  max={100}
                  step={5}
                  className="my-4"
                  onValueChange={(value) => handleSliderChange('gradient_from_opacity', value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Cor Final do Gradiente</Label>
                <Select 
                  value={styles.gradient_to_color} 
                  onValueChange={(value) => handleSelectChange('gradient_to_color', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className={`${color.sample} h-4 w-4 rounded-full mr-2`}></div>
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Opacidade Final ({styles.gradient_to_opacity}%)</Label>
                </div>
                <Slider
                  value={[styles.gradient_to_opacity]}
                  min={0}
                  max={100}
                  step={5}
                  className="my-4"
                  onValueChange={(value) => handleSliderChange('gradient_to_opacity', value)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cor do Título</Label>
                <Select 
                  value={styles.title_color.split('/')[0]} 
                  onValueChange={(value) => handleSelectChange('title_color', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {textColorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className={`${color.sample} h-4 w-4 rounded-full mr-2`}></div>
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Cor da Descrição</Label>
                <Select 
                  value={styles.description_color.split('/')[0]} 
                  onValueChange={(value) => handleSelectChange('description_color', `${value}/90`)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {textColorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center">
                          <div className={`${color.sample} h-4 w-4 rounded-full mr-2`}></div>
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-6">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gray-200">
                <div className={`absolute inset-0 ${gradientPreview}`}></div>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h3 className={`text-xl font-bold text-${styles.title_color} mb-2`}>Exemplo do Título</h3>
                <p className={`text-sm text-${styles.description_color}`}>
                  Este é um exemplo de como o texto será exibido sobre o gradiente que você configurou
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Código do Gradiente</Label>
              <div className="bg-muted p-2 rounded-md font-mono text-xs overflow-auto">
                {gradientPreview}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between mt-6">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={resetToDefaults} disabled={loading}>
              Restaurar Padrões
            </Button>
            <Button variant="outline" onClick={fetchHeroStyles} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Atualizar</span>
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={previewInNewTab} disabled={loading}>
              <EyeIcon className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
            <Button onClick={saveHeroStyles} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroStylesEditor;
