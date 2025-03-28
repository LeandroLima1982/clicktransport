
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useCompanyQueue } from '@/hooks/useCompanyQueue';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';

const QueueDiagnostics: React.FC = () => {
  const { 
    companies, 
    isLoading, 
    error,
    fetchCompanies, 
    fixQueuePositions, 
    resetQueue, 
    moveCompanyToEnd,
    runDiagnostics
  } = useCompanyQueue();
  
  const [isFixing, setIsFixing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isMoving, setIsMoving] = useState<string | null>(null);
  
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);
  
  const handleFixQueue = async () => {
    try {
      setIsFixing(true);
      await fixQueuePositions();
    } finally {
      setIsFixing(false);
    }
  };
  
  const handleResetQueue = async () => {
    try {
      setIsResetting(true);
      await resetQueue();
    } finally {
      setIsResetting(false);
    }
  };
  
  const handleMoveToEnd = async (companyId: string) => {
    try {
      setIsMoving(companyId);
      await moveCompanyToEnd(companyId);
    } finally {
      setIsMoving(null);
    }
  };
  
  return (
    <div className="border border-yellow-300 rounded-md bg-white mb-6">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Diagnóstico de Filas de Empresas</h2>
        <p className="text-muted-foreground text-sm">
          Visualize e gerencie a fila de empresas para atribuição de ordens de serviço
        </p>
      </div>
      <div className="p-4">
        {error && (
          <Alert variant="error" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end space-x-2 mb-4">
          <Button variant="outline" size="sm" onClick={fetchCompanies} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleFixQueue} disabled={isFixing || isLoading}>
            {isFixing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Corrigindo...
              </>
            ) : (
              "Corrigir Fila"
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetQueue} disabled={isResetting || isLoading}>
            {isResetting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetando...
              </>
            ) : (
              "Resetar Fila"
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runDiagnostics} 
            disabled={isLoading}
          >
            Executar Diagnóstico
          </Button>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Posição</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-48">Última Atribuição</TableHead>
                <TableHead className="w-32">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2">Carregando empresas...</p>
                  </TableCell>
                </TableRow>
              ) : companies && companies.length > 0 ? (
                companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.queue_position || '-'}</TableCell>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          company.status === 'active' ? 'default' : 
                          company.status === 'inactive' ? 'secondary' : 
                          'outline'
                        }
                        className={
                          company.status === 'active' ? 'bg-blue-600' : 
                          company.status === 'pending' ? 'bg-yellow-500 text-black' : 
                          undefined
                        }
                      >
                        {company.status === 'active' ? 'Ativa' : 
                         company.status === 'inactive' ? 'Inativa' : 
                         company.status === 'pending' ? 'Pendente' : 
                         company.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {company.last_order_assigned ? (
                        new Date(company.last_order_assigned).toLocaleString()
                      ) : (
                        <span className="text-muted-foreground">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleMoveToEnd(company.id)}
                        disabled={isMoving === company.id || isLoading}
                      >
                        {isMoving === company.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Mover para o fim"
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    <p className="text-muted-foreground">{error ? 'Erro ao carregar dados' : 'Nenhuma empresa encontrada'}</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default QueueDiagnostics;
