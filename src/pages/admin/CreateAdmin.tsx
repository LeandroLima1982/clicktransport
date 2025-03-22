
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
      console.log('Starting admin user creation for:', email);
      
      // First, check if the user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();
      
      if (checkError) {
        console.log('Error checking for existing user:', checkError);
        // Continue with creation anyway since this might be due to RLS
      } else if (existingUser) {
        throw new Error('A user with this email already exists');
      }

      // 1. Create the user with Supabase auth with service role to bypass RLS
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: 'admin'
        }
      });

      if (authError) {
        if (authError.message.includes('row-level security policy')) {
          console.log('RLS policy error detected, trying alternative approach');
          // If you get RLS policy error, try the normal signup approach
          const { data: regularAuthData, error: regularAuthError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                role: 'admin'
              }
            }
          });

          if (regularAuthError) {
            throw regularAuthError;
          }

          if (!regularAuthData.user) {
            throw new Error('Failed to create user with regular signup');
          }

          // If we succeeded with regular signup, manually update the profile role
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

          // Try to update the profile directly since we're now authenticated as this user
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: regularAuthData.user.id,
              full_name: fullName,
              email: email,
              role: 'admin'
            });

          if (profileError) {
            console.warn('Failed to update profile, but user was created:', profileError);
          }

          // Sign out again immediately
          await supabase.auth.signOut();
        } else {
          // If it's not an RLS error, throw the original error
          throw authError;
        }
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

                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                  <p className="font-medium">Important Note:</p>
                  <p>If you encounter errors when creating an admin user, it may be because of database permissions. You might need to disable Row Level Security temporarily or set up proper RLS policies for the profiles table.</p>
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
