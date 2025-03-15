
import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/driver/useNotifications';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

const NotificationBell: React.FC = () => {
  const { notifications, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Add sound effect for new notifications
  useEffect(() => {
    if (notifications > 0 && !hasAnimated) {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Audio play failed', err));
      setHasAnimated(true);
      
      // Animate bell
      const bellElement = document.getElementById('notification-bell');
      if (bellElement) {
        bellElement.classList.add('animate-bounce');
        setTimeout(() => {
          bellElement.classList.remove('animate-bounce');
        }, 2000);
      }
    }
  }, [notifications, hasAnimated]);
  
  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    
    // Clear notifications when opening the popover
    if (open && notifications > 0) {
      clearNotifications();
      setHasAnimated(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button 
          id="notification-bell"
          className="relative p-2 rounded-full hover:bg-gray-100 transition-colors tap-highlight"
          aria-label={`${notifications} notificações não lidas`}
        >
          <Bell className="h-5 w-5 text-gray-600" />
          
          {notifications > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 p-0 text-[10px] animate-scale-in bg-primary text-white" 
              variant="default"
            >
              {notifications}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 mt-2 p-0 animate-slide-up rounded-xl">
        <div className="p-3 border-b">
          <h3 className="font-medium">Notificações</h3>
        </div>
        
        {notifications > 0 ? (
          <div className="p-3">
            <div className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Nova ordem de serviço</p>
                <p className="text-xs text-gray-500">Uma nova ordem de serviço foi atribuída a você</p>
                <p className="text-xs text-gray-400 mt-1">Agora</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-500">Nenhuma notificação</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
