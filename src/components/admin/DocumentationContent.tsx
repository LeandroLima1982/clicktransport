
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, FileText, Code, BookOpen, GitBranch } from 'lucide-react';

const DocumentationContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documentação do Sistema</CardTitle>
          <CardDescription>
            Guias, tutoriais e referências para uso do painel administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="guides">
            <TabsList className="mb-4">
              <TabsTrigger value="guides">Guias</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
              <TabsTrigger value="support">Suporte</TabsTrigger>
            </TabsList>
            
            <TabsContent value="guides" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Introdução ao Painel</CardTitle>
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Um guia completo para começar a utilizar o painel administrativo.
                    </p>
                    <Button variant="outline" className="w-full">
                      Ver Documentação
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Gerenciamento de Empresas</CardTitle>
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Como administrar empresas, adicionar e modificar dados.
                    </p>
                    <Button variant="outline" className="w-full">
                      Ver Documentação
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Configurações Avançadas</CardTitle>
                      <Code className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configurações do sistema e opções avançadas.
                    </p>
                    <Button variant="outline" className="w-full">
                      Ver Documentação
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Atualizações Recentes</CardTitle>
                      <GitBranch className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Histórico das atualizações e novos recursos adicionados.
                    </p>
                    <Button variant="outline" className="w-full">
                      Ver Histórico
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-4">
              <div className="flex flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentação da API</CardTitle>
                    <CardDescription>Referência completa para integração com sistemas externos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Endpoints de Empresas</h3>
                        <p className="text-sm text-muted-foreground">
                          Endpoints para gerenciamento de empresas cadastradas.
                        </p>
                        <Button variant="link" className="px-0 text-primary flex items-center mt-1">
                          Ver documentação <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-2">Endpoints de Ordens de Serviço</h3>
                        <p className="text-sm text-muted-foreground">
                          Endpoints para gerenciamento de ordens de serviço.
                        </p>
                        <Button variant="link" className="px-0 text-primary flex items-center mt-1">
                          Ver documentação <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="support" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Suporte Técnico</CardTitle>
                  <CardDescription>Obtenha ajuda com qualquer problema do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p>
                      Se você está enfrentando problemas com o sistema, nossa equipe de suporte está disponível para ajudar.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Email de Suporte</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-2">suporte@transporte.app</p>
                          <p className="text-xs text-muted-foreground">
                            Tempo de resposta: até 24 horas
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Telefone</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-2">(11) 3456-7890</p>
                          <p className="text-xs text-muted-foreground">
                            Horário: 9h às 18h (dias úteis)
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentationContent;
