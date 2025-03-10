
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/main';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import TransitionEffect from '@/components/TransitionEffect';

const CreateAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // First create the user with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'admin'
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // Check if the user was created
      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Ensure the profile has the admin role (in case the trigger doesn't work)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: fullName,
          email: email,
          role: 'admin'
        });

      if (profileError) {
        throw profileError;
      }

      toast.success('Admin user created successfully', {
        description: 'You can now login with these credentials'
      });
      
      // Clear form
      setEmail('');
      setPassword('');
      setFullName('');
      
      // Redirect to login
      setTimeout(() => {
        navigate('/auth?type=admin');
      }, 2000);
      
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error('Failed to create admin user', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransitionEffect>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md shadow-lg animate-fade-in">
            <CardHeader className="space-y-1">
              <div className="flex justify-center">
                <Shield className="h-12 w-12 text-primary mb-4" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Create Admin User</CardTitle>
              <CardDescription className="text-center">
                Create a new administrator account for the platform
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleCreateAdmin}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input 
                    id="fullName" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input 
                    id="email" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input 
                    id="password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password" 
                    required 
                  />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full rounded-full" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Admin...
                    </>
                  ) : (
                    'Create Admin User'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </TransitionEffect>
  );
};

export default CreateAdmin;
