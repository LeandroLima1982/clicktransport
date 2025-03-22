import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CalendarRange, Truck, Hourglass, MapPin } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  status: string;
  queue_position: number | null;
  last_order_assigned: string | null;
}

const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyData();
  }, [user]);

  const fetchCompanyData = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        setError('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar dados da empresa:', error);
        setError('Erro ao carregar dados da empresa');
        return;
      }

      if (!data) {
        setError('Empresa não encontrada');
        return;
      }

      setCompany(data);
      setError(null);
    } catch (error: any) {
      console.error('Erro ao processar dados da empresa:', error);
      setError(error.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Carregando dados da empresa...</p>;
  }

  if (error) {
    return <p>Erro: {error}</p>;
  }

  if (!company) {
    return <p>Nenhuma empresa encontrada.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-4 w-4" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{company.status}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarRange className="mr-2 h-4 w-4" />
                  Posição na Fila
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{company.queue_position || 'N/A'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hourglass className="mr-2 h-4 w-4" />
                  Última Atribuição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{company.last_order_assigned ? new Date(company.last_order_assigned).toLocaleDateString() : 'N/A'}</p>
              </CardContent>
            </Card>
          </div>

          <div>
            <Button>
              <MapPin className="mr-2 h-4 w-4" />
              Ver Mapa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyDashboard;
