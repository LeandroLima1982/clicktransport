
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, MoveUp, MoveDown, Save, Undo, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Section {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  visible: boolean;
  componentPath: string;
}

const defaultSections: Section[] = [
  {
    id: 'hero',
    name: 'Banner Principal',
    description: 'Seção inicial com título e imagem de destaque',
    sort_order: 1,
    visible: true,
    componentPath: 'src/components/Hero.tsx'
  },
  {
    id: 'booking',
    name: 'Formulário de Agendamento',
    description: 'Formulário para solicitar transporte',
    sort_order: 2,
    visible: true,
    componentPath: 'src/components/BookingForm.tsx'
  },
  {
    id: 'transport-types',
    name: 'Tipos de Transporte',
    description: 'Carrossel com opções de tipos de transporte disponíveis',
    sort_order: 3,
    visible: true,
    componentPath: 'src/components/TransportTypes.tsx'
  },
  {
    id: 'solutions',
    name: 'Soluções',
    description: 'Descrição das soluções oferecidas',
    sort_order: 4,
    visible: true,
    componentPath: 'src/components/Solutions.tsx'
  },
  {
    id: 'process-steps',
    name: 'Etapas do Processo',
    description: 'Passos para solicitar e utilizar o serviço',
    sort_order: 5,
    visible: true,
    componentPath: 'src/components/ProcessSteps.tsx'
  },
  {
    id: 'testimonials',
    name: 'Depoimentos',
    description: 'Depoimentos de clientes satisfeitos',
    sort_order: 6,
    visible: true,
    componentPath: 'src/components/Testimonials.tsx'
  },
  {
    id: 'faq',
    name: 'Perguntas Frequentes',
    description: 'Respostas para dúvidas comuns',
    sort_order: 7,
    visible: true,
    componentPath: 'src/components/FAQ.tsx'
  },
  {
    id: 'cta',
    name: 'Chamada para Ação',
    description: 'Seção final com botão de ação principal',
    sort_order: 8,
    visible: true,
    componentPath: 'src/components/CTA.tsx'
  }
];

const SectionReorder: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [originalSections, setOriginalSections] = useState<Section[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  
  useEffect(() => {
    loadSectionOrder();
  }, []);
  
  const loadSectionOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('section_order')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setSections(data as Section[]);
        setOriginalSections([...data] as Section[]);
      } else {
        // If no data in DB, use default sections
        setSections([...defaultSections]);
        setOriginalSections([...defaultSections]);
      }
    } catch (error) {
      console.error('Error loading section order:', error);
      toast.error('Erro ao carregar ordem das seções');
      setSections([...defaultSections]);
      setOriginalSections([...defaultSections]);
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedItemId(id);
    // Change opacity of dragged element
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.4';
    }
  };
  
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedItemId(null);
    // Restore opacity
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain');
    
    if (sourceId !== targetId) {
      const updatedSections = [...sections];
      const sourceIndex = updatedSections.findIndex(section => section.id === sourceId);
      const targetIndex = updatedSections.findIndex(section => section.id === targetId);
      
      // Remove the source item
      const [movedItem] = updatedSections.splice(sourceIndex, 1);
      
      // Insert at the target position
      updatedSections.splice(targetIndex, 0, movedItem);
      
      // Update order numbers
      const reorderedSections = updatedSections.map((section, index) => ({
        ...section,
        sort_order: index + 1
      }));
      
      setSections(reorderedSections);
      toast.info('Ordem alterada. Clique em "Salvar" para aplicar as mudanças.');
    }
  };
  
  const moveSection = (id: string, direction: 'up' | 'down') => {
    const updatedSections = [...sections];
    const currentIndex = updatedSections.findIndex(section => section.id === id);
    
    if (
      (direction === 'up' && currentIndex > 0) || 
      (direction === 'down' && currentIndex < updatedSections.length - 1)
    ) {
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Swap the items
      [updatedSections[currentIndex], updatedSections[newIndex]] = 
      [updatedSections[newIndex], updatedSections[currentIndex]];
      
      // Update order numbers
      const reorderedSections = updatedSections.map((section, index) => ({
        ...section,
        sort_order: index + 1
      }));
      
      setSections(reorderedSections);
      toast.info('Ordem alterada. Clique em "Salvar" para aplicar as mudanças.');
    }
  };
  
  const toggleSectionVisibility = (id: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === id) {
        return {
          ...section,
          visible: !section.visible
        };
      }
      return section;
    });
    
    setSections(updatedSections);
    toast.info('Visibilidade alterada. Clique em "Salvar" para aplicar as mudanças.');
  };
  
  const saveSectionOrder = async () => {
    setIsSaving(true);
    try {
      // First, delete existing records
      const { error: deleteError } = await supabase
        .from('section_order')
        .delete()
        .gt('id', '0'); // This is just a trick to delete all records
      
      if (deleteError) throw deleteError;
      
      // Then insert new records
      const { error: insertError } = await supabase
        .from('section_order')
        .insert(sections);
      
      if (insertError) throw insertError;
      
      // Update the original state after successful save
      setOriginalSections([...sections]);
      
      // Generate or update the sections controller file
      await generateSectionsControllerFile();
      
      toast.success('Ordem das seções salva com sucesso!');
    } catch (error) {
      console.error('Error saving section order:', error);
      toast.error('Erro ao salvar ordem das seções');
    } finally {
      setIsSaving(false);
    }
  };
  
  const resetSectionOrder = () => {
    setSections([...originalSections]);
    toast.info('Alterações descartadas');
  };
  
  const generateSectionsControllerFile = async () => {
    try {
      const { data: sectionsConfig, error } = await supabase
        .from('section_order')
        .select('*')
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      // We would ideally create a file on the server here
      // But for this prototype, we'll just log it
      console.log('Section configuration for site rendering:', sectionsConfig);
      
      // In a real implementation, this would generate a file that the 
      // frontend would use to determine section order and visibility
      return true;
    } catch (error) {
      console.error('Error generating sections controller file:', error);
      return false;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LayoutGrid className="mr-2 h-5 w-5" />
          Reordenar Seções do Site
        </CardTitle>
        <CardDescription>
          Arraste e solte as seções para reorganizar a página inicial do site. Você também pode ocultar seções.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button 
            onClick={saveSectionOrder} 
            disabled={isSaving} 
            className="flex items-center"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          <Button 
            variant="outline" 
            onClick={resetSectionOrder} 
            className="flex items-center"
          >
            <Undo className="mr-2 h-4 w-4" />
            Descartar Alterações
          </Button>
        </div>
        
        <div className="space-y-2">
          {sections.map((section) => (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, section.id)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, section.id)}
              className={`flex items-center justify-between rounded-md border p-3 transition-all
                ${draggedItemId === section.id ? 'opacity-40' : 'opacity-100'}
                ${!section.visible ? 'bg-gray-100 text-gray-500' : 'bg-white'}
              `}
            >
              <div className="flex items-center">
                <div className="cursor-move p-2 text-gray-400 hover:text-gray-600">
                  <GripVertical className="h-5 w-5" />
                </div>
                <div className="ml-2">
                  <div className="font-medium">{section.name}</div>
                  <div className="text-xs text-gray-500">{section.description}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => moveSection(section.id, 'up')}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => moveSection(section.id, 'down')}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant={section.visible ? "default" : "outline"}
                  onClick={() => toggleSectionVisibility(section.id)}
                >
                  {section.visible ? 'Visível' : 'Oculto'}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-600">
          <p>
            <strong>Nota:</strong> Após salvar as alterações, você precisa atualizar a página inicial do site para ver as mudanças aplicadas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SectionReorder;
