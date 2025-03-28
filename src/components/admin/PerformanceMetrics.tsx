
import React from 'react';
import MetricsDashboard from '../metrics/MetricsDashboard';

const PerformanceMetrics: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Métricas de Desempenho</h2>
      <p className="text-muted-foreground">
        Visualize métricas importantes do sistema e desempenho das empresas parceiras.
      </p>
      
      <MetricsDashboard userRole="admin" />
    </div>
  );
};

export default PerformanceMetrics;
