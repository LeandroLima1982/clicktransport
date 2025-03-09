
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

const StatsCards: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
      <Card className="hover-card transition-all duration-300 hover:translate-y-[-5px]">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Atribuições de Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">3</div>
          <p className="text-xs text-muted-foreground mt-1">1 concluída, 2 pendentes</p>
        </CardContent>
      </Card>
      
      <Card className="hover-card transition-all duration-300 hover:translate-y-[-5px]">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total de Viagens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">128</div>
          <p className="text-xs text-muted-foreground mt-1">12 nesta semana</p>
        </CardContent>
      </Card>
      
      <Card className="hover-card transition-all duration-300 hover:translate-y-[-5px] sm:col-span-2 md:col-span-1">
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">4.8/5</div>
          <p className="text-xs text-muted-foreground mt-1">Baseado em 56 avaliações</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsCards;
