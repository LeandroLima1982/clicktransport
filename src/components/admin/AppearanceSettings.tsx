import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, ImageIcon, Loader2, RefreshCw, Check, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSiteLogo } from '@/hooks/useSiteLogo';

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

interface LogoUpload {
  light_mode: string;
  dark_mode: string;
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
  const [activeTab, setActiveTab] = useState("logo");
  const [logoUploads, setLogoUploads] = useState<LogoUpload>({
    light_mode: '',
    dark_mode: ''
  });
  const [isUploadingLogo, setIsUploadingLogo] = useState<Record<string, boolean>>({
    light_mode: false,
    dark_mode: false
  });
  const [isDeletingLogo, setIsDeletingLogo] = useState<Record<string, boolean>>({
    light_mode: false,
    dark_mode: false
  });
  
  const { refreshLogos } = useSiteLogo();

  useEffect(() => {
    loadCurrentImages();
    loadCurrentLogos();
  }, []);

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

  const loadCurrentLogos = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('site_logos')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const logos: LogoUpload = {
          light_mode: '',
          dark_mode: ''
        };
        
        data.forEach(logo => {
          if (logo.mode === 'light') {
            logos.light_mode = logo.logo_url;
          } else if (logo.mode === 'dark') {
            logos.dark_mode = logo.logo_url;
          }
        });
        
        setLogoUploads(logos);
        toast.success('Logos carregadas com sucesso');
      }
    } catch (error) {
      console.error('Error loading logos:', error);
      toast.error('Erro ao carregar logos');
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

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, mode: 'light_mode' | 'dark_mode') => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setIsUploadingLogo(prev => ({ ...prev, [mode]: true }));
    
    try {
      if (!file.type.startsWith('image/')) {
        toast.error('Arquivo inválido', { description: 'Por favor, selecione uma imagem.' });
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Arquivo muito grande', { description: 'Tamanho máximo permitido: 2MB' });
        return;
      }
      
      const supabaseMode = mode === 'light_mode' ? 'light' : 'dark';
      
      const { error: deleteError } = await supabase
        .from('site_logos')
        .delete()
        .eq('mode', supabaseMode);
      
      if (deleteError) {
        console.error('Error deleting existing logo record:', deleteError);
      }
      
      if (logoUploads[mode]) {
        try {
          const oldFileUrl = new URL(logoUploads[mode]);
          const oldFileName = oldFileUrl.pathname.split('/').pop()?.split('?')[0];
          
          if (oldFileName) {
            await supabase.storage
              .from('site-images')
              .remove([oldFileName]);
              
            console.log(`Arquivo antigo removido: ${oldFileName}`);
          }
        } catch (e) {
          console.warn('Erro ao remover arquivo antigo, prosseguindo mesmo assim:', e);
        }
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${mode}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('site-images')
        .upload(fileName, file, {
          cacheControl: '0',
          upsert: true
        });
      
      if (error) throw error;
      
      const timestamp = new Date().getTime();
      const { data: publicUrlData } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);
        
      const logoUrl = `${publicUrlData.publicUrl}?t=${timestamp}`;
      
      const { error: insertError } = await supabase
        .from('site_logos')
        .insert({
          mode: supabaseMode,
          logo_url: logoUrl
        });
      
      if (insertError) throw insertError;
      
      setLogoUploads(prev => ({
        ...prev,
        [mode]: logoUrl
      }));
      
      refreshLogos();
      
      setTimeout(() => {
        refreshLogos();
        toast.success('Logo atualizada com sucesso', {
          description: `A logo para modo ${mode === 'light_mode' ? 'claro' : 'escuro'} foi atualizada.`
        });
      }, 500);
      
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error('Erro ao enviar logo', {
        description: error.message || 'Tente novamente mais tarde.'
      });
    } finally {
      setIsUploadingLogo(prev => ({ ...prev, [mode]: false }));
    }
  };

  const handleDeleteLogo = async (mode: 'light_mode' | 'dark_mode') => {
    if (!logoUploads[mode]) return;
    
    setIsDeletingLogo(prev => ({ ...prev, [mode]: true }));
    
    try {
      const supabaseMode = mode === 'light_mode' ? 'light' : 'dark';
      
      const { error: deleteDbError } = await supabase
        .from('site_logos')
        .delete()
        .eq('mode', supabaseMode);
      
      if (deleteDbError) throw deleteDbError;
      
      try {
        const logoUrl = new URL(logoUploads[mode]);
        const fileName = logoUrl.pathname.split('/').pop()?.split('?')[0];
        
        if (fileName) {
          await supabase.storage
            .from('site-images')
            .remove([fileName]);
        }
      } catch (removeError) {
        console.warn('Erro ao remover arquivo:', removeError);
      }
      
      setLogoUploads(prev => ({
        ...prev,
        [mode]: ''
      }));
      
      refreshLogos();
      
      setTimeout(() => {
        refreshLogos();
      }, 500);
      
      toast.success('Logo removida com sucesso', {
        description: `A logo para modo ${mode === 'light_mode' ? 'claro' : 'escuro'} foi removida.`
      });
    } catch (error: any) {
      console.error('Error deleting logo:', error);
      toast.error('Erro ao remover logo', {
        description: error.message || 'Tente novamente mais tarde.'
      });
    } finally {
      setIsDeletingLogo(prev => ({ ...prev, [mode]: false }));
    }
  };

  const getImageUrl = (section: ImageSection) => {
    return updatedImages[section.id] || section.currentImage;
  };

  const groupedSections = () => {
    const vehicleImages = imageSections.filter(section => section.category === 'vehicle');
    const otherImages = imageSections.filter(section => section.category !== 'vehicle');
    
    return {
      vehicleImages,
      otherImages
    };
  };

  const { vehicleImages, otherImages } = groupedSections();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Configurações de Aparência</h2>
          <p className="text-muted-foreground">
            Atualize as imagens e logos exibidas nas diferentes seções do site
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            loadCurrentImages();
            loadCurrentLogos();
            refreshLogos();
          }} 
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="logo">Logo da Plataforma</TabsTrigger>
          <TabsTrigger value="images">Imagens do Site</TabsTrigger>
        </TabsList>

        <TabsContent value="logo" className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo para Fundo Claro</CardTitle>
                <CardDescription>
                  Esta versão da logo será usada em áreas com fundo claro (navbar, painel, etc).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-8 rounded-md flex items-center justify-center">
                  {logoUploads.light_mode ? (
                    <img 
                      src={logoUploads.light_mode} 
                      alt="Logo (Fundo Claro)" 
                      className="max-h-16"
                      key={`light-${logoUploads.light_mode}`}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mb-2" />
                      <span>Nenhuma logo carregada</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-light" className="text-sm font-medium">
                    Carregar Logo (Fundo Claro)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="logo-light"
                      type="file"
                      accept="image/*"
                      disabled={isUploadingLogo.light_mode || isDeletingLogo.light_mode}
                      onChange={(e) => handleLogoUpload(e, 'light_mode')}
                      className="flex-1"
                    />
                    {isUploadingLogo.light_mode ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : logoUploads.light_mode ? (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => handleDeleteLogo('light_mode')}
                        disabled={isDeletingLogo.light_mode}
                      >
                        {isDeletingLogo.light_mode ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formato: PNG ou SVG com transparência. Tamanho máximo: 2MB.<br />
                    Dimensões recomendadas: 240x60px
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Logo para Fundo Escuro</CardTitle>
                <CardDescription>
                  Esta versão da logo será usada em áreas com fundo escuro (footer, cards escuros, etc).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-secondary p-8 rounded-md flex items-center justify-center">
                  {logoUploads.dark_mode ? (
                    <img 
                      src={logoUploads.dark_mode} 
                      alt="Logo (Fundo Escuro)" 
                      className="max-h-16"
                      key={`dark-${logoUploads.dark_mode}`}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white/60">
                      <ImageIcon className="h-12 w-12 mb-2" />
                      <span>Nenhuma logo carregada</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo-dark">Carregar Logo (Fundo Escuro)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="logo-dark"
                      type="file"
                      accept="image/*"
                      disabled={isUploadingLogo.dark_mode || isDeletingLogo.dark_mode}
                      onChange={(e) => handleLogoUpload(e, 'dark_mode')}
                      className="flex-1"
                    />
                    {isUploadingLogo.dark_mode ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : logoUploads.dark_mode ? (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => handleDeleteLogo('dark_mode')}
                        disabled={isDeletingLogo.dark_mode}
                      >
                        {isDeletingLogo.dark_mode ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formato: PNG ou SVG com transparência. Tamanho máximo: 2MB.<br />
                    Dimensões recomendadas: 240x60px
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              Informações sobre a implementação da logo
            </h3>
            <p className="text-sm text-muted-foreground">
              A logo será implementada automaticamente em:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-6 list-disc">
              <li>NavbarLogo (barra de navegação principal)</li>
              <li>DriverSidebar (sidebar do motorista)</li>
              <li>Footer (rodapé do site)</li>
              <li>AuthContainer (páginas de login e registro)</li>
              <li>ForgotPassword (página de recuperação de senha)</li>
              <li>DriverHeader (cabeçalho do painel do motorista)</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="images" className="pt-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppearanceSettings;
