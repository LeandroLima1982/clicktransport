
import React from 'react';
import MetricsDashboard from '../metrics/MetricsDashboard';

interface CompanyMetricsProps {
  companyId: string;
}

const CompanyMetrics: React.FC<CompanyMetricsProps> = ({ companyId }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Métricas de Desempenho</h2>
      <p className="text-muted-foreground mb-4">
        Acompanhe as principais métricas de desempenho da sua empresa.
      </p>
      
      <MetricsDashboard userRole="company" entityId={companyId} />
    </div>
  );
};

export default CompanyMetrics;
