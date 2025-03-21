
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, ExternalLink, Info, Key, MapPin, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getGoogleMapsApiKey, isValidApiKey } from '@/utils/googlemaps';
import { updateGoogleMapsApiKey } from '@/utils/updateApiKey';

const ApiConfiguration: React.FC = () => {
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [keyStatus, setKeyStatus] = useState<'invalid' | 'valid' | 'unknown'>('unknown');
  const [apiTab, setApiTab] = useState<string>('google-maps');

  // Load existing API key on mount
  useEffect(() => {
    const currentKey = getGoogleMapsApiKey();
    if (currentKey && currentKey !== 'YOUR_GOOGLE_MAPS_API_KEY') {
      setGoogleMapsApiKey(currentKey);
      setKeyStatus('valid');
    } else {
      setGoogleMapsApiKey('');
      setKeyStatus('invalid');
    }
  }, []);

  const handleGoogleMapsApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!googleMapsApiKey || googleMapsApiKey.length < 20) {
        toast.error('Por favor, insira uma chave de API válida');
        setKeyStatus('invalid');
        return;
      }

      // Update the API key
      const success = updateGoogleMapsApiKey(googleMapsApiKey);
      
      if (success) {
        setKeyStatus('valid');
        // Toast will be shown by the updateGoogleMapsApiKey function
      }
    } catch (error) {
      console.error('Error saving Google Maps API key:', error);
      toast.error('Erro ao salvar a chave da API');
      setKeyStatus('unknown');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuração de APIs</h2>
        <p className="text-muted-foreground">
          Gerencie as chaves de API utilizadas pelo sistema para integrações externas.
        </p>
      </div>

      <Tabs value={apiTab} onValueChange={setApiTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="google-maps" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Google Maps
          </TabsTrigger>
          {/* Add other API tabs in the future as needed */}
        </TabsList>

        <TabsContent value="google-maps" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Google Maps API</CardTitle>
              <CardDescription>
                Configure a chave de API do Google Maps para habilitar sugestões de endereço, cálculos de rota e visualização de mapas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGoogleMapsApiKeySubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <Label htmlFor="google-maps-api-key">Chave de API do Google Maps</Label>
                    {keyStatus === 'valid' && (
                      <div className="flex items-center text-green-500 text-sm">
                        <Check className="h-4 w-4 mr-1" />
                        <span>Chave válida</span>
                      </div>
                    )}
                    {keyStatus === 'invalid' && (
                      <div className="flex items-center text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>Chave inválida ou não configurada</span>
                      </div>
                    )}
                  </div>
                  <Input
                    id="google-maps-api-key"
                    value={googleMapsApiKey}
                    onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                    placeholder="AIzaSyC..."
                    className="font-mono"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">APIs necessárias:</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Places API</li>
                        <li>Directions API</li>
                        <li>Maps JavaScript API</li>
                        <li>Geocoding API</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Passos para obter a chave:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Acesse o <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:underline inline-flex items-center">Console do Google Cloud <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                      <li>Crie um projeto ou selecione um existente</li>
                      <li>Habilite as APIs necessárias em "API e Serviços"</li>
                      <li>Crie credenciais e copie a chave API</li>
                    </ol>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Salvar Chave API
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="bg-gray-50 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <p>
                  A aplicação será recarregada após salvar a chave para aplicar as mudanças em todo o sistema. 
                  A chave é armazenada localmente no navegador e será utilizada para todas as requisições ao Google Maps.
                </p>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiConfiguration;
