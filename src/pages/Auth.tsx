
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import TransitionEffect from '@/components/TransitionEffect';
import { Car, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('login');
  const [accountType, setAccountType] = useState('company');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    if (user) {
      redirectToDashboard();
    }
    
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('register') === 'true') {
      setActiveTab('register');
    }
    
    const type = searchParams.get('type');
    if (type && ['company', 'driver', 'admin'].includes(type)) {
      setAccountType(type);
    }
  }, [location, user]);

  const redirectToDashboard = () => {
    if (accountType === 'company') {
      navigate('/company/dashboard');
    } else if (accountType === 'driver') {
      navigate('/driver/dashboard');
    } else if (accountType === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) throw error;
      
      // Redirect will happen via the useEffect hook when user state updates
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(err.message || 'Error signing in. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('reg-email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('reg-password') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirm-password') as HTMLInputElement).value;
    const firstName = (form.elements.namedItem('first-name') as HTMLInputElement).value;
    const lastName = (form.elements.namedItem('last-name') as HTMLInputElement).value;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
    const companyName = accountType === 'company' 
      ? (form.elements.namedItem('company-name') as HTMLInputElement).value 
      : '';
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const userData = {
        accountType,
        firstName,
        lastName,
        phone,
        companyName
      };
      
      const { error } = await signUp(email, password, userData);
      
      if (error) throw error;
      
      setActiveTab('login');
    } catch (err: any) {
      console.error('Error registering:', err);
      setError(err.message || 'Error creating account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransitionEffect>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex justify-center items-center p-6">
          <Link to="/" className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              Click<span className="text-primary">Transfer</span>
            </span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <Card className="w-full max-w-md shadow-lg animate-fade-in">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">
                {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'login' 
                  ? 'Enter your credentials to access your account' 
                  : 'Fill out the form below to create your account'}
              </CardDescription>
            </CardHeader>
            
            {error && (
              <div className="mx-6 mb-4 px-4 py-3 rounded-md bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <label htmlFor="account-type" className="text-sm font-medium">
                        Account Type
                      </label>
                      <Select
                        value={accountType}
                        onValueChange={setAccountType}
                      >
                        <SelectTrigger id="account-type">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">Transport Company</SelectItem>
                          <SelectItem value="driver">Driver</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="name@example.com" required />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="password" className="text-sm font-medium">
                          Password
                        </label>
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input id="password" type="password" required />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full rounded-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                    
                    <div className="text-sm text-center text-foreground/70">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className="text-primary hover:underline"
                      >
                        Register
                      </button>
                    </div>
                  </CardFooter>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                      <label htmlFor="reg-account-type" className="text-sm font-medium">
                        Account Type
                      </label>
                      <Select
                        value={accountType}
                        onValueChange={setAccountType}
                      >
                        <SelectTrigger id="reg-account-type">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">Transport Company</SelectItem>
                          <SelectItem value="driver">Driver</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {accountType === 'company' && (
                      <div className="space-y-2">
                        <label htmlFor="company-name" className="text-sm font-medium">
                          Company Name
                        </label>
                        <Input id="company-name" placeholder="Your company name" required />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="first-name" className="text-sm font-medium">
                          First Name
                        </label>
                        <Input id="first-name" placeholder="Your first name" required />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="last-name" className="text-sm font-medium">
                          Last Name
                        </label>
                        <Input id="last-name" placeholder="Your last name" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="reg-email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input id="reg-email" type="email" placeholder="name@example.com" required />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Phone
                      </label>
                      <Input id="phone" placeholder="Your phone number" required />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="reg-password" className="text-sm font-medium">
                        Password
                      </label>
                      <Input id="reg-password" type="password" required />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="confirm-password" className="text-sm font-medium">
                        Confirm Password
                      </label>
                      <Input id="confirm-password" type="password" required />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full rounded-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                    
                    <div className="text-sm text-center text-foreground/70">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-primary hover:underline"
                      >
                        Sign In
                      </button>
                    </div>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </TransitionEffect>
  );
};

export default Auth;
