
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Car, Calendar, Clock, MapPin, Settings, LogOut, Bell, User, Home, CheckCircle, XCircle } from 'lucide-react';
import TransitionEffect from '@/components/TransitionEffect';
import { Link } from 'react-router-dom';

const DriverDashboard = () => {
  return (
    <TransitionEffect>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <DriverSidebar />
          
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
              <div className="flex items-center">
                <SidebarTrigger />
                <span className="text-xl font-semibold ml-4">Driver Dashboard</span>
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
                <h1 className="text-2xl font-bold">Welcome, John Driver</h1>
                <p className="text-muted-foreground">Manage your schedule and service assignments</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Today's Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground mt-1">1 completed, 2 pending</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Trips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">128</div>
                    <p className="text-xs text-muted-foreground mt-1">12 this week</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">4.8/5</div>
                    <p className="text-xs text-muted-foreground mt-1">Based on 56 reviews</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Current Assignment</h2>
                </div>
                
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Service ID</p>
                            <p className="font-medium">#CT-1042</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Client</p>
                            <p className="font-medium">Sarah Johnson</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Service Type</p>
                            <p className="font-medium">Corporate Transfer</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Date & Time</p>
                            <p className="font-medium">May 15, 2023 • 09:30 AM</p>
                          </div>
                        </div>
                        
                        <div className="mt-6 space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Pick-up Location</p>
                              <p className="font-medium">123 Main Street, New York, NY</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Destination</p>
                              <p className="font-medium">JFK International Airport, Terminal 4</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <h3 className="font-medium mb-2">Notes</h3>
                          <p className="text-sm">Client prefers minimal conversation and has two large suitcases. Please arrive 10 minutes early.</p>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-medium">Update Status</h3>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" className="space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>Arrived at Pickup</span>
                            </Button>
                            <Button variant="outline" className="space-x-2">
                              <Car className="h-4 w-4" />
                              <span>Started Trip</span>
                            </Button>
                            <Button className="space-x-2 bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4" />
                              <span>Complete Trip</span>
                            </Button>
                            <Button variant="destructive" className="space-x-2">
                              <XCircle className="h-4 w-4" />
                              <span>Issue/Cancel</span>
                            </Button>
                          </div>
                        </div>
                        
                        <div className="rounded-lg border p-4">
                          <h3 className="font-medium mb-2">Contact</h3>
                          <div className="flex space-x-3">
                            <Button variant="outline" size="sm">Call Client</Button>
                            <Button variant="outline" size="sm">Message</Button>
                            <Button variant="outline" size="sm">Support</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="upcoming" className="mb-8">
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming Assignments</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="py-4">
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Service ID</p>
                            <p className="font-medium">#CT-{1050 + i}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Client</p>
                            <p className="font-medium">Client Name {i}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Date & Time</p>
                            <p className="font-medium">May 1{5+i}, 2023 • {i === 1 ? '14:30' : '08:00'} {i === 1 ? 'PM' : 'AM'}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Service Type</p>
                            <p className="font-medium">{i === 1 ? 'Corporate' : 'Airport'} Transfer</p>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="completed" className="py-4">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Service ID</p>
                            <p className="font-medium">#CT-{1030 + i}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Client</p>
                            <p className="font-medium">Past Client {i}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Date & Time</p>
                            <p className="font-medium">May {10+i}, 2023 • 09:30 AM</p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Rating</p>
                            <p className="font-medium">⭐ {4 + (i % 2) * 0.5}</p>
                          </div>
                          
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                        </div>
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

const DriverSidebar = () => {
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
                  <Link to="/driver/dashboard">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/driver/assignments">
                    <Clock className="h-5 w-5" />
                    <span>Assignments</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/driver/schedule">
                    <Calendar className="h-5 w-5" />
                    <span>Schedule</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/driver/navigation">
                    <MapPin className="h-5 w-5" />
                    <span>Navigation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/driver/profile">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/driver/settings">
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

export default DriverDashboard;
