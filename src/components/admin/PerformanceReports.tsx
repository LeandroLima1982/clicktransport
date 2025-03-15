
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart,
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { supabase } from '@/main';
import { toast } from 'sonner';
import { ChartBar, Download, PieChart, Printer } from 'lucide-react';

const PerformanceReports: React.FC = () => {
  const [period, setPeriod] = useState<string>("month");
  const [isLoading, setIsLoading] = useState(true);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [companiesData, setCompaniesData] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, these would be fetched from the database
      // Here we're simulating the data for demonstration purposes
      
      // Orders data by status
      const mockOrdersData = [
        { name: 'Pendentes', value: 12 },
        { name: 'Atribuídos', value: 18 },
        { name: 'Em progresso', value: 24 },
        { name: 'Concluídos', value: 40 },
        { name: 'Cancelados', value: 6 },
      ];
      
      // Companies data by month/week
      let mockCompaniesData;
      if (period === 'week') {
        mockCompaniesData = [
          { name: 'Seg', empresas: 2, ordens: 5 },
          { name: 'Ter', empresas: 1, ordens: 3 },
          { name: 'Qua', empresas: 3, ordens: 7 },
          { name: 'Qui', empresas: 0, ordens: 4 },
          { name: 'Sex', empresas: 2, ordens: 6 },
          { name: 'Sáb', empresas: 1, ordens: 2 },
          { name: 'Dom', empresas: 0, ordens: 1 },
        ];
      } else {
        mockCompaniesData = [
          { name: 'Jan', empresas: 4, ordens: 12 },
          { name: 'Fev', empresas: 6, ordens: 18 },
          { name: 'Mar', empresas: 8, ordens: 24 },
          { name: 'Abr', empresas: 10, ordens: 30 },
          { name: 'Mai', empresas: 12, ordens: 36 },
          { name: 'Jun', empresas: 15, ordens: 45 },
        ];
      }
      
      setOrdersData(mockOrdersData);
      setCompaniesData(mockCompaniesData);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Erro ao carregar dados dos relatórios');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl flex items-center">
                <ChartBar className="mr-2 h-5 w-5" />
                Relatórios de Desempenho
              </CardTitle>
              <CardDescription>
                Análise detalhada do desempenho da plataforma
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semanal</SelectItem>
                  <SelectItem value="month">Mensal</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <p>Carregando dados...</p>
            </div>
          ) : (
            <div className="space-y-10">
              <div>
                <h3 className="text-lg font-medium mb-4">Registro de Empresas e Ordens de Serviço</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={companiesData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="empresas" name="Novas Empresas" stroke="#8884d8" />
                      <Line type="monotone" dataKey="ordens" name="Ordens de Serviço" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Status das Ordens de Serviço</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ordersData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Quantidade" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">55</div>
                    <p className="text-xs text-muted-foreground">+12% em relação ao período anterior</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total de Motoristas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">128</div>
                    <p className="text-xs text-muted-foreground">+8% em relação ao período anterior</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ordens de Serviço</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">342</div>
                    <p className="text-xs text-muted-foreground">+24% em relação ao período anterior</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">86%</div>
                    <p className="text-xs text-muted-foreground">+4% em relação ao período anterior</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceReports;
