
import React from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/hooks/auth/types';

interface UserMenuButtonProps {
  email?: string;
  userRole?: UserRole;
}

const UserMenuButton: React.FC<UserMenuButtonProps> = ({ email, userRole }) => {
  return (
    <Button variant="outline" className="rounded-full px-4 btn-hover-slide flex items-center gap-2">
      <User className="h-4 w-4" />
      <span className="hidden md:inline">{email?.split('@')[0]}</span>
      {userRole && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {userRole === 'client' && 'Cliente'}
          {userRole === 'company' && 'Empresa'}
          {userRole === 'driver' && 'Motorista'}
          {userRole === 'admin' && 'Admin'}
        </span>
      )}
    </Button>
  );
};

export default UserMenuButton;
