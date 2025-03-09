
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Car, CheckCircle, XCircle, MapPin } from 'lucide-react';

const CurrentAssignment: React.FC = () => {
  return (
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
  );
};

export default CurrentAssignment;
