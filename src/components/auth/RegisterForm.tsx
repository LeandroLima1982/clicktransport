
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsContent } from '@/components/ui/tabs';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface RegisterFormProps {
  handleRegister: (e: React.FormEvent) => Promise<void>;
  loading: boolean;
  isBusinessUser: boolean;
  toggleUserType: () => void;
  accountType: string;
  setAccountType: (type: string) => void;
  setActiveTab: (tab: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  handleRegister,
  loading,
  isBusinessUser,
  toggleUserType,
  accountType,
  setAccountType,
  setActiveTab
}) => {
  return (
    <TabsContent value="register">
      <form onSubmit={handleRegister}>
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-center mb-4">
            <Button 
              type="button" 
              variant={isBusinessUser ? "default" : "outline"}
              className="rounded-l-full"
              onClick={() => !isBusinessUser && toggleUserType()}
            >
              Business
            </Button>
            <Button 
              type="button" 
              variant={!isBusinessUser ? "default" : "outline"}
              className="rounded-r-full"
              onClick={() => isBusinessUser && toggleUserType()}
            >
              Client
            </Button>
          </div>
          
          {isBusinessUser && (
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
          )}
          
          {isBusinessUser && accountType === 'company' && (
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
              isBusinessUser ? 'Create Business Account' : 'Create Client Account'
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
  );
};

export default RegisterForm;
