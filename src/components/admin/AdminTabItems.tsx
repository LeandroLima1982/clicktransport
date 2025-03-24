import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  FileText, 
  Map, 
  Building, 
  Car, 
  Palette,
  Bell,
  CalendarClock
} from 'lucide-react';

export interface AdminTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  roles?: string[];
}

export const adminTabs: AdminTab[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: '/admin',
    roles: ['admin', 'manager']
  },
  {
    id: 'bookings',
    label: 'Reservas',
    icon: <CalendarClock className="h-5 w-5" />,
    href: '/admin/bookings',
    roles: ['admin', 'manager', 'dispatcher']
  },
  {
    id: 'users',
    label: 'Usuários',
    icon: <Users className="h-5 w-5" />,
    href: '/admin/users',
    roles: ['admin']
  },
  {
    id: 'companies',
    label: 'Empresas',
    icon: <Building className="h-5 w-5" />,
    href: '/admin/companies',
    roles: ['admin', 'manager']
  },
  {
    id: 'vehicles',
    label: 'Veículos',
    icon: <Car className="h-5 w-5" />,
    href: '/admin/vehicles',
    roles: ['admin', 'manager', 'dispatcher']
  },
  {
    id: 'vehicle-categories',
    label: 'Categorias de Veículos',
    icon: <Car className="h-5 w-5" />,
    href: '/admin/vehicle-categories',
    roles: ['admin']
  },
  {
    id: 'destinations',
    label: 'Destinos',
    icon: <Map className="h-5 w-5" />,
    href: '/admin/destinations',
    roles: ['admin', 'manager']
  },
  {
    id: 'notifications',
    label: 'Notificações',
    icon: <Bell className="h-5 w-5" />,
    href: '/admin/notifications',
    roles: ['admin', 'manager']
  },
  {
    id: 'appearance',
    label: 'Aparência',
    icon: <Palette className="h-5 w-5" />,
    href: '/admin/appearance',
    roles: ['admin']
  },
  {
    id: 'content',
    label: 'Conteúdo',
    icon: <FileText className="h-5 w-5" />,
    href: '/admin/content',
    roles: ['admin']
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: <Settings className="h-5 w-5" />,
    href: '/admin/settings',
    roles: ['admin']
  }
];

export default adminTabs;
