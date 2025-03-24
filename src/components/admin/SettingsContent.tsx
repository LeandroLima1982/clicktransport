
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Bell, Globe, Shield, UserCog } from 'lucide-react';

const SettingsContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Sistema</CardTitle>
          <CardDescription>
            Gerencie preferências, segurança e comportamentos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="security">Segurança</TabsTrigger>
              <TabsTrigger value="notifications">Notificações</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="system-name">Nome do Sistema</Label>
                  <Input id="system-name" defaultValue="Transporte App" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select defaultValue="America/Sao_Paulo">
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Selecione o fuso horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/Cuiaba">Cuiabá (GMT-4)</SelectItem>
                      <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma Padrão</Label>
                  <Select defaultValue="pt-BR">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Selecione o idioma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
                    <p className="text-sm text-muted-foreground">
                      Ativar o modo de manutenção tornará o site inacessível para usuários não-administradores.
                    </p>
                  </div>
                  <Switch id="maintenance-mode" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Salvar Alterações</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="two-factor">Autenticação de Dois Fatores</Label>
                      <Badge variant="outline" className="text-xs">Recomendado</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Exigir autenticação de dois fatores para todos os administradores.
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="session-timeout">Tempo Limite da Sessão</Label>
                    <p className="text-sm text-muted-foreground">
                      Deslogar usuários após períodos de inatividade.
                    </p>
                  </div>
                  <Select defaultValue="60">
                    <SelectTrigger id="session-timeout" className="w-[180px]">
                      <SelectValue placeholder="Selecione o tempo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="240">4 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="password-policy">Política de Senhas</Label>
                    <p className="text-sm text-muted-foreground">
                      Define a complexidade exigida para senhas de usuários.
                    </p>
                  </div>
                  <Select defaultValue="strong">
                    <SelectTrigger id="password-policy" className="w-[180px]">
                      <SelectValue placeholder="Selecione a política" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básica</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="strong">Forte</SelectItem>
                      <SelectItem value="custom">Personalizada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Salvar Alterações</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações importantes por email.
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações push para dispositivos móveis.
                    </p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications">Notificações SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações por SMS para números cadastrados.
                    </p>
                  </div>
                  <Switch id="sms-notifications" />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Salvar Alterações</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api-url">URL da API</Label>
                  <Input id="api-url" defaultValue="https://api.transporte.app/v1" />
                  <p className="text-xs text-muted-foreground">
                    Modificar apenas se você estiver usando uma instância personalizada da API.
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="debug-mode">Modo de Depuração</Label>
                      <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20 text-xs">Avançado</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ativar o modo de depuração para informações de diagnóstico adicionais.
                    </p>
                  </div>
                  <Switch id="debug-mode" />
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <h3 className="font-medium text-destructive">Zona de Perigo</h3>
                  </div>
                  <Card className="border-destructive/50">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Estas ações são potencialmente perigosas e podem causar perda de dados.
                        </p>
                        
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" className="border-destructive/50 hover:bg-destructive/10">
                            Limpar Todos os Dados de Cache
                          </Button>
                          <Button variant="outline" className="border-destructive/50 hover:bg-destructive/10">
                            Reiniciar Configurações do Sistema
                          </Button>
                          <Button variant="destructive">
                            Resetar Banco de Dados
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsContent;
