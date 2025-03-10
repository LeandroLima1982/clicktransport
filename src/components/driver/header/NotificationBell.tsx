
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationBellProps {
  count: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ count }) => {
  return (
    <Button variant="ghost" size="icon" className="relative btn-hover-slide">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full pulse"></span>
      )}
    </Button>
  );
};

export default NotificationBell;
