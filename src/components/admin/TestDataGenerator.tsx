
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, AlertTriangle, Users, Building2, Car, 
  Calendar, BookOpen, RefreshCw, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TestDataGenerator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingUsers, setIsGeneratingUsers] = useState(false);
  const [isGeneratingBooking, setIsGeneratingBooking] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    clients?: any[];
    companies?: any[];
    drivers?: any[];
    vehicles?: any[];
    bookings?: any[];
    serviceOrders?: any[];
    companyUsers?: any[]; // Added the missing type definition
  } | null>(null);
  
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  const generateCompanyUsers = async () => {
    try {
      setIsGeneratingUsers(true);
      
      // Create company 1 user
      const company1Email = `company1.test.${Date.now()}@example.com`;
      const company1Password = "Company123!";
      
      const { data: company1User, error: company1Error } = await supabase.auth.signUp({
        email: company1Email,
        password: company1Password,
        options: {
          data: {
            role: 'company',
            full_name: 'Rio Transfer (Test)'
          }
        }
      });
      
      if (company1Error) throw company1Error;
      
      // Create company 2 user
      const company2Email = `company2.test.${Date.now()}@example.com`;
      const company2Password = "Company123!";
      
      const { data: company2User, error: company2Error } = await supabase.auth.signUp({
        email: company2Email,
        password: company2Password,
        options: {
          data: {
            role: 'company',
            full_name: 'Santos Express (Test)'
          }
        }
      });
      
      if (company2Error) throw company2Error;
      
      // Create client 1
      const client1Email = `client1.test.${Date.now()}@example.com`;
      const client1Password = "Client123!";
      
      const { data: client1User, error: client1Error } = await supabase.auth.signUp({
        email: client1Email,
        password: client1Password,
        options: {
          data: {
            role: 'client',
            full_name: 'Maria Silva (Test Client)'
          }
        }
      });
      
      if (client1Error) throw client1Error;
      
      // Create client 2
      const client2Email = `client2.test.${Date.now()}@example.com`;
      const client2Password = "Client123!";
      
      const { data: client2User, error: client2Error } = await supabase.auth.signUp({
        email: client2Email,
        password: client2Password,
        options: {
          data: {
            role: 'client',
            full_name: 'João Santos (Test Client)'
          }
        }
      });
      
      if (client2Error) throw client2Error;
      
      // Wait for company profiles to be created via trigger
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the companies table with proper data
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('user_id', [
          company1User.user?.id, 
          company2User.user?.id
        ]);
      
      if (companiesError) throw companiesError;
      
      // Update companies with proper data
      for (let i = 0; i < companies.length; i++) {
        const company = companies[i];
        const isCompany1 = company.user_id === company1User.user?.id;
        
        await supabase
          .from('companies')
          .update({
            name: isCompany1 ? 'Rio Transfer' : 'Santos Express',
            cnpj: isCompany1 ? '12345678901234' : '98765432109876',
            status: 'active',
            queue_position: isCompany1 ? 1 : 2
          })
          .eq('id', company.id);
      }
      
      // Get updated company data
      const { data: updatedCompanies, error: updatedCompaniesError } = await supabase
        .from('companies')
        .select('*')
        .in('user_id', [
          company1User.user?.id, 
          company2User.user?.id
        ]);
      
      if (updatedCompaniesError) throw updatedCompaniesError;
      
      // Create drivers for each company (2 per company)
      const drivers = [];
      for (const company of updatedCompanies) {
        // Driver 1
        const { data: driver1, error: error1 } = await supabase
          .from('drivers')
          .insert({
            name: `Motorista 1 - ${company.name}`,
            phone: '21999990000',
            license_number: `CNH-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'active',
            company_id: company.id,
            email: `driver1.${company.id.substring(0, 5)}@example.com`
          })
          .select()
          .single();
        
        if (error1) throw error1;
        drivers.push(driver1);
        
        // Driver 2
        const { data: driver2, error: error2 } = await supabase
          .from('drivers')
          .insert({
            name: `Motorista 2 - ${company.name}`,
            phone: '21888880000',
            license_number: `CNH-${Math.floor(1000 + Math.random() * 9000)}`,
            status: 'active',
            company_id: company.id,
            email: `driver2.${company.id.substring(0, 5)}@example.com`
          })
          .select()
          .single();
        
        if (error2) throw error2;
        drivers.push(driver2);
      }
      
      // Create vehicles for each company (2 per company)
      const vehicles = [];
      for (const company of updatedCompanies) {
        // Vehicle 1 - Sedan
        const { data: vehicle1, error: error1 } = await supabase
          .from('vehicles')
          .insert({
            model: 'Toyota Corolla',
            license_plate: `ABC${Math.floor(1000 + Math.random() * 9000)}`,
            year: 2023,
            status: 'active',
            company_id: company.id
          })
          .select()
          .single();
        
        if (error1) throw error1;
        vehicles.push(vehicle1);
        
        // Vehicle 2 - SUV
        const { data: vehicle2, error: error2 } = await supabase
          .from('vehicles')
          .insert({
            model: 'Honda CR-V',
            license_plate: `XYZ${Math.floor(1000 + Math.random() * 9000)}`,
            year: 2022,
            status: 'active',
            company_id: company.id
          })
          .select()
          .single();
        
        if (error2) throw error2;
        vehicles.push(vehicle2);
      }
      
      const clients = [
        {
          email: client1Email,
          password: client1Password,
          name: 'Maria Silva (Test Client)',
          user_id: client1User.user?.id
        },
        {
          email: client2Email,
          password: client2Password,
          name: 'João Santos (Test Client)',
          user_id: client2User.user?.id
        }
      ];
      
      const companyUsers = [
        {
          email: company1Email,
          password: company1Password,
          name: 'Rio Transfer (Test)',
          user_id: company1User.user?.id
        },
        {
          email: company2Email,
          password: company2Password,
          name: 'Santos Express (Test)',
          user_id: company2User.user?.id
        }
      ];
      
      // Store generated data
      setGeneratedData(prevData => ({
        ...prevData,
        clients,
        companies: updatedCompanies,
        drivers,
        vehicles,
        companyUsers
      }));
      
      toast.success('Dados de teste gerados com sucesso!', {
        description: '2 empresas, 4 motoristas e 4 veículos foram criados'
      });
      
      return {
        clients,
        companyUsers,
        companies: updatedCompanies,
        drivers,
        vehicles
      };
    } catch (error) {
      console.error('Error generating test data:', error);
      toast.error('Erro ao gerar dados de teste', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return null;
    } finally {
      setIsGeneratingUsers(false);
    }
  };
  
  const generateSampleBooking = async () => {
    try {
      setIsGeneratingBooking(true);
      
      if (!generatedData?.clients?.[0]?.user_id) {
        toast.error('Não há clientes disponíveis para gerar uma reserva');
        return null;
      }
      
      const clientId = generatedData.clients[0].user_id;
      
      // Create a test booking
      const bookingData = {
        reference_code: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'confirmed' as const,
        origin: 'Aeroporto Santos Dumont, Rio de Janeiro',
        destination: 'Ipanema Beach, Rio de Janeiro',
        travel_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        booking_date: new Date().toISOString(),
        total_price: 120.00,
        passengers: 2,
        user_id: clientId,
        additional_notes: 'Reserva de teste gerada automaticamente'
      };
      
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
      
      if (bookingError) throw bookingError;
      
      toast.success('Reserva de teste criada', { duration: 2000 });
      
      // Create service order from the booking
      // Simplified version of createServiceOrderFromBooking without the queue logic
      const firstCompany = generatedData.companies?.[0];
      
      if (!firstCompany) {
        throw new Error('Nenhuma empresa disponível para atribuir a ordem de serviço');
      }
      
      const orderData = {
        company_id: firstCompany.id,
        origin: booking.origin,
        destination: booking.destination,
        pickup_date: booking.travel_date,
        status: 'pending' as const,
        notes: `Ordem de serviço gerada a partir da reserva ${booking.reference_code}`
      };
      
      const { data: serviceOrder, error: orderError } = await supabase
        .from('service_orders')
        .insert(orderData)
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      toast.success('Ordem de serviço de teste criada', { 
        description: 'A ordem foi atribuída automaticamente à primeira empresa',
        duration: 3000 
      });
      
      // Update generated data
      setGeneratedData(prevData => ({
        ...prevData,
        bookings: [booking],
        serviceOrders: [serviceOrder]
      }));
      
      return { booking, serviceOrder };
    } catch (error) {
      console.error('Error generating test booking:', error);
      toast.error('Erro ao gerar reserva de teste', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return null;
    } finally {
      setIsGeneratingBooking(false);
    }
  };
  
  const handleGenerateAll = async () => {
    try {
      setIsLoading(true);
      
      // Generate all test data
      await generateCompanyUsers();
      await generateSampleBooking();
      
      toast.success('Ambiente de teste configurado com sucesso!', { 
        description: 'Todos os dados de teste foram gerados.',
        duration: 5000
      });
    } catch (error) {
      console.error('Error setting up test environment:', error);
      toast.error('Erro ao configurar ambiente de teste', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Gerador de Dados de Teste
        </CardTitle>
        <CardDescription>
          Crie usuários, empresas, motoristas e veículos para testes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Este gerador criará automaticamente empresas, motoristas, e veículos para testes.
            Ideal para uso após limpar o banco de dados.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <p>O gerador criará:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div className="flex items-center">
              <Building2 className="mr-2 h-4 w-4 text-primary" />
              <span>2 empresas de transporte</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-primary" />
              <span>2 clientes de teste</span>
            </div>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-primary" />
              <span>4 motoristas (2 por empresa)</span>
            </div>
            <div className="flex items-center">
              <Car className="mr-2 h-4 w-4 text-primary" />
              <span>4 veículos (2 por empresa)</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              <span>1 reserva de teste</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="mr-2 h-4 w-4 text-primary" />
              <span>1 ordem de serviço</span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Button
              onClick={generateCompanyUsers}
              disabled={isGeneratingUsers || isLoading}
              variant="outline"
            >
              {isGeneratingUsers ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Usuários...
                </>
              ) : (
                <>
                  <Building2 className="mr-2 h-4 w-4" />
                  Gerar Empresas e Motoristas
                </>
              )}
            </Button>
            
            <Button
              onClick={generateSampleBooking}
              disabled={isGeneratingBooking || isLoading || !generatedData?.clients?.length}
              variant="outline"
            >
              {isGeneratingBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Reserva...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Gerar Reserva de Teste
                </>
              )}
            </Button>
            
            <Button
              onClick={handleGenerateAll}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Configurando ambiente...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Gerar Todos os Dados
                </>
              )}
            </Button>
          </div>
          
          {generatedData && Object.keys(generatedData).length > 0 && (
            <div className="mt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="companies" className="flex items-center">
                    <Building2 className="mr-1 h-4 w-4" />
                    Empresas
                  </TabsTrigger>
                  <TabsTrigger value="clients" className="flex items-center">
                    <Users className="mr-1 h-4 w-4" />
                    Clientes
                  </TabsTrigger>
                  <TabsTrigger value="bookings" className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    Reservas
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-secondary/20 p-4 rounded-md flex flex-col items-center justify-center">
                      <Building2 className="h-8 w-8 mb-2 text-primary" />
                      <p className="text-lg font-bold">{generatedData.companies?.length || 0}</p>
                      <p className="text-muted-foreground">Empresas</p>
                    </div>
                    <div className="bg-secondary/20 p-4 rounded-md flex flex-col items-center justify-center">
                      <Users className="h-8 w-8 mb-2 text-primary" />
                      <p className="text-lg font-bold">{generatedData.drivers?.length || 0}</p>
                      <p className="text-muted-foreground">Motoristas</p>
                    </div>
                    <div className="bg-secondary/20 p-4 rounded-md flex flex-col items-center justify-center">
                      <Car className="h-8 w-8 mb-2 text-primary" />
                      <p className="text-lg font-bold">{generatedData.vehicles?.length || 0}</p>
                      <p className="text-muted-foreground">Veículos</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-secondary/20 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Clientes de Teste</h3>
                        <div className="text-sm">
                          {generatedData.clients?.map((client, index) => (
                            <div key={index} className="mb-2">
                              <p className="font-medium">{client.name}</p>
                              <p><span className="text-muted-foreground">Email:</span> {client.email}</p>
                              <p><span className="text-muted-foreground">Senha:</span> {client.password}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-2">Usuários Empresa</h3>
                        <div className="text-sm">
                          {generatedData.companyUsers?.map((user, index) => (
                            <div key={index} className="mb-2">
                              <p className="font-medium">{user.name}</p>
                              <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
                              <p><span className="text-muted-foreground">Senha:</span> {user.password}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="companies" className="mt-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium mb-2">Empresas</h3>
                    {generatedData.companies?.map((company) => (
                      <div key={company.id} className="bg-secondary/20 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{company.name}</p>
                            <p className="text-sm text-muted-foreground">CNPJ: {company.cnpj}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Posição na fila: <span className="font-medium">{company.queue_position}</span></p>
                            <p className="text-sm text-muted-foreground">Status: {company.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <h3 className="text-sm font-medium mt-4 mb-2">Motoristas</h3>
                    {generatedData.drivers?.map((driver) => (
                      <div key={driver.id} className="bg-secondary/20 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-muted-foreground">CNH: {driver.license_number}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Empresa: <span className="font-medium">{
                              generatedData.companies?.find(c => c.id === driver.company_id)?.name || 'N/A'
                            }</span></p>
                            <p className="text-sm text-muted-foreground">Status: {driver.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <h3 className="text-sm font-medium mt-4 mb-2">Veículos</h3>
                    {generatedData.vehicles?.map((vehicle) => (
                      <div key={vehicle.id} className="bg-secondary/20 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{vehicle.model}</p>
                            <p className="text-sm text-muted-foreground">Placa: {vehicle.license_plate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Empresa: <span className="font-medium">{
                              generatedData.companies?.find(c => c.id === vehicle.company_id)?.name || 'N/A'
                            }</span></p>
                            <p className="text-sm text-muted-foreground">Status: {vehicle.status}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="clients" className="mt-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium mb-2">Clientes de Teste</h3>
                    {generatedData.clients?.map((client, index) => (
                      <div key={index} className="bg-secondary/20 p-3 rounded-md">
                        <p className="font-medium">{client.name}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Email:</p>
                            <p className="text-sm">{client.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Senha:</p>
                            <p className="text-sm">{client.password}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="bookings" className="mt-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium mb-2">Reservas de Teste</h3>
                    {generatedData.bookings?.map((booking) => (
                      <div key={booking.id} className="bg-secondary/20 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{booking.reference_code}</p>
                            <p className="text-sm text-muted-foreground">De: {booking.origin}</p>
                            <p className="text-sm text-muted-foreground">Para: {booking.destination}</p>
                          </div>
                          <div className="text-right">
                            <Badge>{booking.status}</Badge>
                            <p className="text-sm mt-1">R$ {booking.total_price.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(booking.travel_date).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {generatedData.bookings?.length === 0 && (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhuma reserva de teste foi gerada ainda.
                      </div>
                    )}
                    
                    <h3 className="text-sm font-medium mt-4 mb-2">Ordens de Serviço</h3>
                    {generatedData.serviceOrders?.map((order) => (
                      <div key={order.id} className="bg-secondary/20 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Ordem #{order.id.substring(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">De: {order.origin}</p>
                            <p className="text-sm text-muted-foreground">Para: {order.destination}</p>
                          </div>
                          <div className="text-right">
                            <Badge>{order.status}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Empresa: {
                                generatedData.companies?.find(c => c.id === order.company_id)?.name || 'N/A'
                              }
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.pickup_date).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {generatedData.serviceOrders?.length === 0 && (
                      <div className="p-4 text-center text-muted-foreground">
                        Nenhuma ordem de serviço foi gerada ainda.
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestDataGenerator;
