
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AssignmentTabs: React.FC = () => {
  return (
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
  );
};

export default AssignmentTabs;
