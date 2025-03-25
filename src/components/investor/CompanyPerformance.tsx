
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Eye } from 'lucide-react';

interface CompanyPerformanceProps {
  companies: any[];
  metrics: any[];
}

const CompanyPerformance: React.FC<CompanyPerformanceProps> = ({ companies, metrics }) => {
  const getCompanyMetrics = (companyId: string) => {
    const companyMetrics = metrics.filter(m => m.company_id === companyId);
    
    const totalRevenue = companyMetrics.reduce((sum, m) => sum + m.revenue, 0);
    const totalProfit = companyMetrics.reduce((sum, m) => sum + m.profit, 0);
    const totalOrders = companyMetrics.reduce((sum, m) => sum + m.orders_count, 0);
    
    return {
      totalRevenue,
      totalProfit,
      totalOrders
    };
  };

  const getPerformanceStatus = (profit: number) => {
    if (profit > 5000) return 'excelente';
    if (profit > 2000) return 'bom';
    if (profit > 0) return 'regular';
    return 'ruim';
  };

  const getPerformanceBadge = (status: string) => {
    switch (status) {
      case 'excelente':
        return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
      case 'bom':
        return <Badge className="bg-blue-100 text-blue-800">Bom</Badge>;
      case 'regular':
        return <Badge className="bg-yellow-100 text-yellow-800">Regular</Badge>;
      case 'ruim':
        return <Badge className="bg-red-100 text-red-800">Ruim</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  if (companies.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma empresa encontrada no seu portfólio</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa</TableHead>
            <TableHead>Participação</TableHead>
            <TableHead>Faturamento</TableHead>
            <TableHead>Lucro</TableHead>
            <TableHead>Ordens</TableHead>
            <TableHead>Desempenho</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => {
            const metrics = getCompanyMetrics(company.id);
            const performanceStatus = getPerformanceStatus(metrics.totalProfit);
            
            return (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.percentage}%</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    R$ {metrics.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    R$ {metrics.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
                    {metrics.totalOrders}
                  </div>
                </TableCell>
                <TableCell>
                  {getPerformanceBadge(performanceStatus)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompanyPerformance;
