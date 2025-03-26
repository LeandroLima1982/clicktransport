
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
  category?: string;
}

const imageSections: ImageSection[] = [
  {
    id: 'logo',
    title: 'Logo do Site',
    description: 'Logo principal do LaTransfer usado em todo o site',
    currentImage: '/lovable-uploads/8a9d78f7-0536-4e85-9c4b-0debc4c61fcf.png',
    componentPath: 'src/components/navbar/NavbarLogo.tsx',
    category: 'logo'
  },
  {
    id: 'footer_logo',
    title: 'Logo do Rodapé',
    description: 'Logo específica exibida no rodapé do site',
    currentImage: '/lovable-uploads/4426e89f-4ae5-492a-84b3-eb7935af6e46.png',
    componentPath: 'src/components/Footer.tsx',
    category: 'logo'
  },
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
    description: 'Imagem do veículo sedan executivo (recomendado: 300x200px)',
    currentImage: '/lovable-uploads/sedan-exec.jpg',
    componentPath: 'src/components/booking/steps/VehicleSelection.tsx',
    category: 'vehicle'
  },
  {
    id: 'suv',
    title: 'SUV Premium',
    description: 'Imagem do veículo SUV premium (recomendado: 300x200px)',
    currentImage: '/lovable-uploads/suv-premium.jpg',
    componentPath: 'src/components/booking/steps/VehicleSelection.tsx',
    category: 'vehicle'
  },
  {
    id: 'van',
    title: 'Van Executiva',
    description: 'Imagem da van executiva (recomendado: 300x200px)',
    currentImage: '/lovable-uploads/van-exec.jpg',
    componentPath: 'src/components/booking/steps/VehicleSelection.tsx',
    category: 'vehicle'
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
    loadCurrentImages();
    
    // Enable realtime for site_images
    enableRealtimeForSiteImages();
  }, []);

  const enableRealtimeForSiteImages = async () => {
    try {
      // Enable full replica identity for the site_images table (needed for realtime)
      await supabase.rpc('exec_sql', {
        query: 'ALTER TABLE public.site_images REPLICA IDENTITY FULL;'
      });
      
      // Add site_images to the realtime publication
      await supabase.rpc('exec_sql', {
        query: 'ALTER PUBLICATION supabase_realtime ADD TABLE public.site_images;'
      });
      
      console.log('Realtime enabled for site_images table');
    } catch (error) {
      console.error('Error enabling realtime:', error);
    }
  };

  const loadCurrentImages = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('site_images')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        const currentImages: Record<string, string> = {};
        
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
      if (!file.type.startsWith('image/')) {
        toast.error('Arquivo inválido', { description: 'Por favor, selecione uma imagem.' });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande', { description: 'Tamanho máximo permitido: 5MB' });
        return;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${sectionId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('site-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      if (data) {
        const { data: publicUrlData } = supabase.storage
          .from('site-images')
          .getPublicUrl(fileName);
        
        const imageUrl = publicUrlData.publicUrl;
        
        const { data: existingImage, error: checkError } = await supabase
          .from('site_images')
          .select('*')
          .eq('section_id', sectionId)
          .single();
        
        if (checkError && checkError.code !== 'PGRST116') throw checkError;
        
        if (existingImage) {
          const { error: updateError } = await supabase
            .from('site_images')
            .update({ 
              image_url: imageUrl,
              updated_at: new Date().toISOString() 
            })
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

  const groupedSections = () => {
    const logoImages = imageSections.filter(section => section.category === 'logo');
    const vehicleImages = imageSections.filter(section => section.category === 'vehicle');
    const otherImages = imageSections.filter(section => !section.category || (section.category !== 'vehicle' && section.category !== 'logo'));
    
    return {
      logoImages,
      vehicleImages,
      otherImages
    };
  };

  const { logoImages, vehicleImages, otherImages } = groupedSections();

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

      {logoImages.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-6">Logo do Site</h3>
          <p className="text-muted-foreground mb-4">
            Esta imagem será exibida como logo principal em todas as páginas do site
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {logoImages.map((section) => (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative bg-muted rounded-md overflow-hidden p-4 flex justify-center">
                    {getImageUrl(section) ? (
                      <img 
                        src={getImageUrl(section)} 
                        alt={section.title}
                        className="h-16 w-auto object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`image-${section.id}`} className="text-sm font-medium">
                      Carregar nova logo
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
                      Formato: PNG com fundo transparente recomendado
                    </p>
                    <p className="text-xs text-amber-500 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" /> 
                      Após atualizar, atualize a página para ver as mudanças
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {vehicleImages.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-6">Imagens de Veículos</h3>
          <p className="text-muted-foreground mb-4">
            Estas imagens serão exibidas na seção de seleção de veículos durante o processo de reserva
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {vehicleImages.map((section) => (
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
        </>
      )}

      <h3 className="text-xl font-semibold mt-6">Outras Imagens</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherImages.map((section) => (
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
