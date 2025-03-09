
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import TransitionEffect from '@/components/TransitionEffect';

const AdminDashboard: React.FC = () => {
  const { user, userRole } = useAuth();

  if (!user || userRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
        <Button asChild className="mt-4">
          <Link to="/">Return to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button asChild variant="outline">
            <Link to="/admin/database-setup">Database Setup</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Companies</CardTitle>
              <CardDescription>Manage transportation companies</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total registered companies</p>
              <Button className="mt-4 w-full">View Companies</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Drivers</CardTitle>
              <CardDescription>Manage registered drivers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total registered drivers</p>
              <Button className="mt-4 w-full">View Drivers</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Service Orders</CardTitle>
              <CardDescription>Track transportation orders</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total service orders</p>
              <Button className="mt-4 w-full">View Orders</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </TransitionEffect>
  );
};

export default AdminDashboard;
