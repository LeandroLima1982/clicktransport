
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DestinationManagement from '@/components/admin/destinations/DestinationManagement';
import TransitionEffect from '@/components/TransitionEffect';
import adminTabs from '@/components/admin/AdminTabItems';

const DestinationsPage: React.FC = () => {
  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Gerenciar Destinos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Navegação</CardTitle>
                <CardDescription>Opções de gerenciamento</CardDescription>
              </CardHeader>
              <CardContent>
                <nav className="flex flex-col space-y-1">
                  {adminTabs.map(tab => (
                    <a 
                      key={tab.id}
                      href={tab.href}
                      className={`px-3 py-2 rounded-md flex items-center text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                        tab.id === 'destinations' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground'
                      }`}
                    >
                      {tab.icon}
                      <span className="ml-3">{tab.label}</span>
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <DestinationManagement />
          </div>
        </div>
      </div>
    </TransitionEffect>
  );
};

export default DestinationsPage;
