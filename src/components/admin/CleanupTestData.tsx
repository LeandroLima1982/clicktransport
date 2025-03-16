
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cleanupAllTestData } from '@/services/db/cleanupTestData';
import { supabase } from '@/integrations/supabase/client';

const CleanupTestData: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{
    companies: number;
    drivers: number;
    vehicles: number;
    bookings: number;
    serviceOrders: number;
    driverLocations: number;
    profiles: number;
  } | null>(null);
  
  const loadStats = async () => {
    try {
      const [
        { count: companiesCount, error: companiesError },
        { count: driversCount, error: driversError },
        { count: vehiclesCount, error: vehiclesError },
        { count: bookingsCount, error: bookingsError },
        { count: ordersCount, error: ordersError },
        { count: locationsCount, error: locationsError },
        { count: profilesCount, error: profilesError }
      ] = await Promise.all([
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('drivers').select('*', { count: 'exact', head: true }),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('service_orders').select('*', { count: 'exact', head: true }),
        supabase.from('driver_locations').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
      ]);
      
      if (companiesError || driversError || vehiclesError || bookingsError || 
          ordersError || locationsError || profilesError) {
        throw new Error('Erro ao carregar estatísticas');
      }
      
      setStats({
        companies: companiesCount || 0,
        drivers: driversCount || 0,
        vehicles: vehiclesCount || 0,
        bookings: bookingsCount || 0,
        serviceOrders: ordersCount || 0,
        driverLocations: locationsCount || 0,
        profiles: profilesCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Erro ao carregar estatísticas de dados');
    }
  };
  
  // Load stats on component mount
  React.useEffect(() => {
    loadStats();
  }, []);
  
  const handleCleanup = async () => {
    try {
      setIsLoading(true);
      
      const { success, error } = await cleanupAllTestData();
      
      if (!success) {
        throw error;
      }
      
      toast.success('Dados de teste limpos com sucesso!', {
        description: 'Todas as entidades de teste foram removidas do banco de dados.'
      });
      
      // Reload stats after cleanup
      await loadStats();
    } catch (error) {
      console.error('Error cleaning up test data:', error);
      toast.error('Erro ao limpar dados de teste', {
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
          <Trash2 className="mr-2 h-5 w-5" />
          Limpeza de Dados de Teste
        </CardTitle>
        <CardDescription>
          Remova todos os dados de teste do sistema de forma segura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 border-red-600/50 bg-red-600/10">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            <strong>Atenção:</strong> Esta ação irá remover permanentemente TODOS os dados de teste, incluindo:
            empresas, motoristas, veículos, reservas, ordens de serviço e perfis de usuário (exceto administradores).
            Esta ação não pode ser desfeita!
          </AlertDescription>
        </Alert>
        
        {stats && (
          <div className="mb-6 p-4 bg-secondary/20 rounded-md">
            <h3 className="text-sm font-medium mb-3">Dados Atuais no Sistema:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-secondary/40 p-3 rounded-md text-center">
                <p className="text-2xl font-bold">{stats.companies}</p>
                <p className="text-sm text-muted-foreground">Empresas</p>
              </div>
              <div className="bg-secondary/40 p-3 rounded-md text-center">
                <p className="text-2xl font-bold">{stats.drivers}</p>
                <p className="text-sm text-muted-foreground">Motoristas</p>
              </div>
              <div className="bg-secondary/40 p-3 rounded-md text-center">
                <p className="text-2xl font-bold">{stats.vehicles}</p>
                <p className="text-sm text-muted-foreground">Veículos</p>
              </div>
              <div className="bg-secondary/40 p-3 rounded-md text-center">
                <p className="text-2xl font-bold">{stats.bookings}</p>
                <p className="text-sm text-muted-foreground">Reservas</p>
              </div>
              <div className="bg-secondary/40 p-3 rounded-md text-center">
                <p className="text-2xl font-bold">{stats.serviceOrders}</p>
                <p className="text-sm text-muted-foreground">Ordens</p>
              </div>
              <div className="bg-secondary/40 p-3 rounded-md text-center">
                <p className="text-2xl font-bold">{stats.driverLocations}</p>
                <p className="text-sm text-muted-foreground">Localizações</p>
              </div>
              <div className="bg-secondary/40 p-3 rounded-md text-center">
                <p className="text-2xl font-bold">{stats.profiles}</p>
                <p className="text-sm text-muted-foreground">Perfis</p>
              </div>
              <div className="bg-secondary/40 p-3 rounded-md flex items-center justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadStats}
                  className="text-xs"
                >
                  Atualizar
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <p>O processo de limpeza irá:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Remover todas as ordens de serviço</li>
            <li>Remover todas as reservas</li>
            <li>Limpar dados de localização dos motoristas</li>
            <li>Remover todos os motoristas</li>
            <li>Remover todos os veículos</li>
            <li>Remover todas as empresas</li>
            <li>Remover perfis de usuário (exceto administradores)</li>
          </ul>
          
          <Button 
            onClick={handleCleanup} 
            disabled={isLoading}
            variant="destructive"
            className="w-full mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Limpando Dados de Teste...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Todos os Dados de Teste
              </>
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Após limpar os dados, você pode usar o gerador de dados para criar novos dados de teste.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanupTestData;
