
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBookingAssignmentDiagnostics } from '@/hooks/useBookingAssignmentDiagnostics';
import { Loader2 } from 'lucide-react';

const BookingAssignmentDiagnostics: React.FC = () => {
  const { 
    logs, 
    isLoading, 
    fetchLogs,
    clearLogs
  } = useBookingAssignmentDiagnostics();
  
  const [isClearing, setIsClearing] = useState(false);
  
  const handleClearLogs = async () => {
    try {
      setIsClearing(true);
      await clearLogs();
    } finally {
      setIsClearing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Atribuição de Ordens</CardTitle>
          <CardDescription>
            Visualize os logs de sistema relacionados à atribuição de ordens de serviço às empresas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end space-x-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchLogs}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Atualizar Logs"
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearLogs}
              disabled={isClearing || isLoading}
            >
              {isClearing ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Limpando...
                </>
              ) : (
                "Limpar Logs"
              )}
            </Button>
          </div>
          
          <Card className="border border-border">
            <ScrollArea className="h-[400px] w-full rounded-md p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <p>Carregando logs...</p>
                </div>
              ) : logs && logs.length > 0 ? (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3 rounded-md border text-sm"
                    >
                      <div className="flex justify-between mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          log.severity === 'info' ? 'bg-blue-100 text-blue-800' :
                          log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          log.severity === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.severity}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="font-medium">{log.message}</p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 text-xs bg-muted p-2 rounded">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Nenhum log encontrado</p>
                </div>
              )}
            </ScrollArea>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingAssignmentDiagnostics;
