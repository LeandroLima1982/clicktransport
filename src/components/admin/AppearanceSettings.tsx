
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ImageIcon, Loader2, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Define types for site images
interface SiteImage {
  id: string;
  section_id: string;
  image_url: string;
  component_path?: string;
  created_at?: string;
  updated_at?: string;
}

interface ImageSection {
  id: string;
  title: string;
  description: string;
  currentImage: string;
  componentPath: string;
}

const imageSections: ImageSection[] = [
  {
    id: 'hero',
    title: 'Banner Principal',
    description: 'Imagem de fundo da seção principal da página inicial',
    currentImage: '/lovable-uploads/hero-bg.jpg',
    componentPath: 'src/components/Hero.tsx'
  },
  {
    id: 'sedan',
    title: 'Sedan Executivo',
    description: 'Imagem do veículo sedan executivo',
    currentImage: '/lovable-uploads/sedan-exec.jpg',
    componentPath: 'src/components/booking/steps/VehicleSelection.tsx'
  },
  {
    id: 'suv',
    title: 'SUV Premium',
    description: 'Imagem do veículo SUV premium',
    currentImage: '/lovable-uploads/suv-premium.jpg',
    componentPath: 'src/components/booking/steps/VehicleSelection.tsx'
  },
  {
    id: 'van',
    title: 'Van Executiva',
    description: 'Imagem da van executiva',
    currentImage: '/lovable-uploads/van-exec.jpg',
    componentPath: 'src/components/booking/steps/VehicleSelection.tsx'
  },
  {
    id: 'offshore',
    title: 'Transfer para Offshore',
    description: 'Imagem para a seção de transfer offshore',
    currentImage: 'https://images.unsplash.com/photo-1581222436649-527d9a720281',
    componentPath: 'src/components/TransportTypes.tsx'
  },
  {
    id: 'airport',
    title: 'Transfer para Aeroporto',
    description: 'Imagem para a seção de transfer para aeroporto',
    currentImage: 'https://images.unsplash.com/photo-1596394465101-64a9b9c3dc92',
    componentPath: 'src/components/TransportTypes.tsx'
  },
  {
    id: 'vip',
    title: 'Transfer VIP & Executivo',
    description: 'Imagem para a seção de transfer VIP',
    currentImage: 'https://images.unsplash.com/photo-1571214587716-4def4cc5ffd9',
    componentPath: 'src/components/TransportTypes.tsx'
  },
  {
    id: 'events',
    title: 'Transfer para Eventos',
    description: 'Imagem para a seção de transfer para eventos',
    currentImage: 'https://images.unsplash.com/photo-1581222963832-ca932c2317ad',
    componentPath: 'src/components/TransportTypes.tsx'
  }
];

const AppearanceSettings: React.FC = () => {
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [updatedImages, setUpdatedImages] = useState<Record<string, string>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Load current images from site_images table
    loadCurrentImages();
  }, []);

  const loadCurrentImages = async () => {
    setIsRefreshing(true);
    try {
      // Get images from site_images table
      const { data, error } = await supabase
        .from('site_images')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const currentImages: Record<string, string> = {};
        
        // Map image URLs from the database to their section IDs
        (data as SiteImage[]).forEach(image => {
          if (image.section_id && image.image_url) {
            currentImages[image.section_id] = image.image_url;
          }
        });
        
        setUpdatedImages(currentImages);
        toast.success('Imagens carregadas com sucesso');
      }
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Erro ao carregar imagens');
      
      // Fallback: load from storage if table query fails
      try {
        const { data: imageFiles, error } = await supabase.storage
          .from('site-images')
          .list();
        
        if (error) {
          throw error;
        }
        
        if (imageFiles) {
          const currentImages: Record<string, string> = {};
          
          for (const section of imageSections) {
            const sectionImage = imageFiles.find(file => file.name.startsWith(`${section.id}-`));
            if (sectionImage) {
              const { data: publicUrl } = supabase.storage
                .from('site-images')
                .getPublicUrl(sectionImage.name);
              
              if (publicUrl) {
                currentImages[section.id] = publicUrl.publicUrl;
              }
            }
          }
          
          setUpdatedImages(currentImages);
        }
      } catch (storageError) {
        console.error('Error loading images from storage:', storageError);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, sectionId: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading({ ...uploading, [sectionId]: true });
    
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Arquivo inválido', { description: 'Por favor, selecione uma imagem.' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande', { description: 'Tamanho máximo permitido: 5MB' });
        return;
      }
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${sectionId}-${Date.now()}.${fileExt}`;
      
      // Upload file to Supabase storage
      const { data, error } = await supabase.storage
        .from('site-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      if (data) {
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('site-images')
          .getPublicUrl(fileName);
        
        const imageUrl = publicUrlData.publicUrl;
        
        // Update the site_images table with the new image URL
        const { data: existingImage, error: checkError } = await supabase
          .from('site_images')
          .select('*')
          .eq('section_id', sectionId)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        
        // Insert or update the image URL in the database
        if (existingImage) {
          const { error: updateError } = await supabase
            .from('site_images')
            .update({ image_url: imageUrl })
            .eq('section_id', sectionId);
          
          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from('site_images')
            .insert({
              section_id: sectionId,
              image_url: imageUrl,
              component_path: imageSections.find(s => s.id === sectionId)?.componentPath
            });
          
          if (insertError) throw insertError;
        }
        
        // Update state with new image URL
        setUpdatedImages({
          ...updatedImages,
          [sectionId]: imageUrl
        });
        
        toast.success('Imagem atualizada com sucesso', {
          description: `A imagem para "${imageSections.find(s => s.id === sectionId)?.title}" foi atualizada.`
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao enviar imagem', {
        description: error.message || 'Tente novamente mais tarde.'
      });
    } finally {
      setUploading({ ...uploading, [sectionId]: false });
    }
  };

  const getImageUrl = (section: ImageSection) => {
    return updatedImages[section.id] || section.currentImage;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Configurações de Aparência</h2>
          <p className="text-muted-foreground">
            Atualize as imagens exibidas nas diferentes seções do site
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadCurrentImages} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {imageSections.map((section) => (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                {getImageUrl(section) ? (
                  <img 
                    src={getImageUrl(section)} 
                    alt={section.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`image-${section.id}`} className="text-sm font-medium">
                  Carregar nova imagem
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id={`image-${section.id}`}
                    type="file"
                    accept="image/*"
                    disabled={uploading[section.id]}
                    onChange={(e) => handleFileChange(e, section.id)}
                    className="flex-1"
                  />
                  {uploading[section.id] && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {updatedImages[section.id] && !uploading[section.id] && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Formato: JPG, PNG ou WebP. Tamanho máximo: 5MB
                </p>
                <p className="text-xs text-amber-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" /> 
                  Componente: {section.componentPath}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AppearanceSettings;
