
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Car, Users, Calendar, Clock, FileText, Settings, LogOut, Bell, User, Home } from 'lucide-react';
import TransitionEffect from '@/components/TransitionEffect';
import { Link } from 'react-router-dom';

const CompanyDashboard = () => {
  return (
    <TransitionEffect>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <CompanySidebar />
          
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
              <div className="flex items-center">
                <SidebarTrigger />
                <span className="text-xl font-semibold ml-4">Company Dashboard</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </Button>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </div>
            </header>
            
            <main className="flex-1 p-6 bg-gray-50 overflow-auto">
              <div className="mb-8 space-y-2">
                <h1 className="text-2xl font-bold">Welcome, Acme Transportation</h1>
                <p className="text-muted-foreground">Manage your transfer services and drivers</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$24,580.50</div>
                    <p className="text-xs text-muted-foreground mt-1">+12.5% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">18</div>
                    <p className="text-xs text-muted-foreground mt-1">3 pending, 15 in progress</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Drivers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground mt-1">8 active, 4 inactive</p>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="services" className="mb-8">
                <TabsList>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="drivers">Drivers</TabsTrigger>
                  <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                </TabsList>
                
                <TabsContent value="services" className="py-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Recent Services</h2>
                    <Button>New Service</Button>
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Service ID</p>
                            <p className="font-medium">#CT-{1000 + i}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Client</p>
                            <p className="font-medium">John Smith</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Date & Time</p>
                            <p className="font-medium">May 1{i}, 2023 • 09:30 AM</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Status</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              i % 3 === 0 ? 'bg-blue-100 text-blue-800' : 
                              i % 3 === 1 ? 'bg-green-100 text-green-800' : 
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {i % 3 === 0 ? 'In Progress' : i % 3 === 1 ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <Button variant="outline">Load More</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="drivers" className="py-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Your Drivers</h2>
                    <Button>Add Driver</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Driver Name {i}</h3>
                              <p className="text-sm text-muted-foreground">ID: DRV-{1000 + i}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Status</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                i % 2 === 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {i % 2 === 0 ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Completed Rides</span>
                              <span className="text-sm">{i * 12}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Rating</span>
                              <span className="text-sm">{4 + (i % 2) * 0.5}/5</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1">View</Button>
                            <Button variant="outline" size="sm" className="flex-1">Contact</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="vehicles" className="py-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Your Vehicles</h2>
                    <Button>Add Vehicle</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <Car className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {i % 3 === 0 ? 'Sedan' : i % 3 === 1 ? 'SUV' : 'Van'}
                              </h3>
                              <p className="text-sm text-muted-foreground">License: ABC-{1000 + i}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Status</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                i % 2 === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {i % 2 === 0 ? 'Available' : 'In Service'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Model</span>
                              <span className="text-sm">
                                {i % 3 === 0 ? 'Toyota Camry' : i % 3 === 1 ? 'Honda CR-V' : 'Mercedes Sprinter'}
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Year</span>
                              <span className="text-sm">{2018 + (i % 4)}</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1">Details</Button>
                            <Button variant="outline" size="sm" className="flex-1">Maintenance</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </TransitionEffect>
  );
};

const CompanySidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link to="/" className="flex items-center space-x-2">
          <Car className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">ClickTransfer</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/company/dashboard">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/company/services">
                    <FileText className="h-5 w-5" />
                    <span>Services</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/company/schedule">
                    <Calendar className="h-5 w-5" />
                    <span>Schedule</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/company/drivers">
                    <Users className="h-5 w-5" />
                    <span>Drivers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/company/vehicles">
                    <Car className="h-5 w-5" />
                    <span>Vehicles</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/company/profile">
                    <User className="h-5 w-5" />
                    <span>Company Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/company/settings">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Link to="/" className="w-full">
          <Button variant="outline" className="w-full justify-start">
            <LogOut className="h-5 w-5 mr-2" />
            <span>Logout</span>
          </Button>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CompanyDashboard;
