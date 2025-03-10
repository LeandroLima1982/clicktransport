
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/driver/useNotifications';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const NotificationBell: React.FC = () => {
  const { notifications, clearNotifications } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs animate-bounce">
              {notifications}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Notificações</h4>
            {notifications > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearNotifications}
              >
                Limpar
              </Button>
            )}
          </div>
          
          {notifications > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Você tem {notifications} {notifications === 1 ? 'nova notificação' : 'novas notificações'} de ordens de serviço.
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique suas atribuições na aba "Ordens de Serviço".
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Não há novas notificações.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
