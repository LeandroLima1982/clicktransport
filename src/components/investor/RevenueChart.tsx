
import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, parseISO, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RevenueChartProps {
  metrics: any[];
  companies: any[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ metrics, companies }) => {
  const chartData = useMemo(() => {
    // Obtenha os últimos 30 dias
    const today = new Date();
    const last30Days: Record<string, any> = {};
    
    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      last30Days[dateStr] = {
        date: dateStr,
        totalRevenue: 0,
        totalProfit: 0
      };
    }

    // Calcule os valores para cada dia com base nas métricas
    metrics.forEach((metric) => {
      const date = metric.date.substring(0, 10); // Formato 'YYYY-MM-DD'
      if (last30Days[date]) {
        const company = companies.find(c => c.id === metric.company_id);
        const percentage = company ? company.percentage / 100 : 0;
        
        last30Days[date].totalRevenue += (metric.revenue * percentage);
        last30Days[date].totalProfit += (metric.profit * percentage);
      }
    });

    // Converta o objeto para um array e ordene por data
    return Object.values(last30Days)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(item => ({
        ...item,
        formattedDate: format(parseISO(item.date), 'dd/MM', { locale: ptBR })
      }));
  }, [metrics, companies]);

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="formattedDate" 
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={(value) => `R$ ${value}`} 
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={formatCurrency}
          labelFormatter={(label) => `Data: ${label}`}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="totalRevenue" 
          name="Faturamento" 
          stroke="#2563eb" 
          fill="#3b82f6" 
          fillOpacity={0.2} 
        />
        <Area 
          type="monotone" 
          dataKey="totalProfit" 
          name="Lucro" 
          stroke="#16a34a" 
          fill="#22c55e" 
          fillOpacity={0.2} 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;
