
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { initializeDatabase } from '@/utils/supabaseSchema';
import { toast } from 'sonner';
import TransitionEffect from '@/components/TransitionEffect';

const DatabaseSetup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleInitializeDatabase = async () => {
    setLoading(true);
    try {
      const result = await initializeDatabase();
      setSuccess(result.success);
      setMessage(result.message);
      if (result.success) {
        toast.success('Database initialized successfully!');
      } else {
        toast.error('Failed to initialize database');
      }
    } catch (error) {
      setSuccess(false);
      setMessage('An unexpected error occurred');
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransitionEffect>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Database Setup</h1>
        
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Initialize Database</CardTitle>
            <CardDescription>
              This will create all necessary tables in your Supabase project.
              Only run this once or when you need to update the schema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The following tables will be created:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Profiles (extends Supabase Auth users)</li>
              <li>Companies</li>
              <li>Drivers</li>
              <li>Vehicles</li>
              <li>Service Orders</li>
            </ul>
            
            {success !== null && (
              <div className={`mt-4 p-3 rounded-md ${success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleInitializeDatabase} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                'Initialize Database'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </TransitionEffect>
  );
};

export default DatabaseSetup;
