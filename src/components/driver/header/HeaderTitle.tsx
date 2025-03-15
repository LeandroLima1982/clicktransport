
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface HeaderTitleProps {
  title: string;
}

const HeaderTitle: React.FC<HeaderTitleProps> = ({ title }) => {
  return (
    <div className="flex items-center">
      <SidebarTrigger className="mr-2 md:mr-4" />
      <span className="text-lg md:text-xl font-semibold">{title}</span>
    </div>
  );
};

export default HeaderTitle;
