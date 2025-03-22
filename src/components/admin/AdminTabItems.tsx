
import React from 'react';
import { MdDashboard, MdAdminPanelSettings, MdBusiness, MdVerifiedUser, MdOutlineDirectionsCar, MdPeopleAlt } from 'react-icons/md';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useLocation } from 'react-router-dom';

const AdminTabItems = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleTabChange = (path: string) => {
    navigate(path);
  };

  return (
    <Tabs defaultValue={currentPath} className="w-full" onValueChange={handleTabChange}>
      <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
        <TabsTrigger value="/admin/dashboard" className="flex items-center">
          <MdDashboard className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Dashboard</span>
        </TabsTrigger>
        <TabsTrigger value="/admin/companies" className="flex items-center">
          <MdBusiness className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Empresas</span>
        </TabsTrigger>
        <TabsTrigger value="/admin/drivers" className="flex items-center">
          <MdPeopleAlt className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Motoristas</span>
        </TabsTrigger>
        <TabsTrigger value="/admin/vehicles" className="flex items-center">
          <MdOutlineDirectionsCar className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Veículos</span>
        </TabsTrigger>
        <TabsTrigger value="/admin/users" className="flex items-center">
          <MdVerifiedUser className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Usuários</span>
        </TabsTrigger>
        <TabsTrigger value="/admin/config" className="flex items-center">
          <MdAdminPanelSettings className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Config</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default AdminTabItems;
