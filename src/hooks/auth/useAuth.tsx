
import { createContext, useContext } from 'react';
import { AuthContextType } from './types';

// Create a default context value
export const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticating: false,
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  userRole: null,
  companyContext: null
});

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Create custom function to check if user exists
  const isAuthenticated = !!context.user;
  
  return {
    ...context,
    isAuthenticated
  };
}
