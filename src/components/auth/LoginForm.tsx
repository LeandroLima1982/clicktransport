
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoginFormProps {
  handleLogin: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  setActiveTab: (tab: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  handleLogin, 
  loading, 
  setActiveTab 
}) => {
  return (
    <TabsContent value="login">
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4 pt-6">
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
  );
};

export default LoginForm;
