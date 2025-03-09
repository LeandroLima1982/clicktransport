
import React from 'react';
import TransitionEffect from '@/components/TransitionEffect';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Car, 
  CalendarRange, 
  BarChart3,
  Building2
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Admin</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Companies</p>
                <h3 className="text-2xl font-bold">24</h3>
              </div>
              <Building2 className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Drivers</p>
                <h3 className="text-2xl font-bold">142</h3>
              </div>
              <Users className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Transfers</p>
                <h3 className="text-2xl font-bold">18</h3>
              </div>
              <Car className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Upcoming Bookings</p>
                <h3 className="text-2xl font-bold">36</h3>
              </div>
              <CalendarRange className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="transfers">Transfers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>Registered Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Company management panel will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="drivers">
            <Card>
              <CardHeader>
                <CardTitle>Registered Drivers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Driver management panel will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transfers">
            <Card>
              <CardHeader>
                <CardTitle>All Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Transfer tracking and management panel will be displayed here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-md">
                  <BarChart3 className="h-16 w-16 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TransitionEffect>
  );
};

export default AdminDashboard;
