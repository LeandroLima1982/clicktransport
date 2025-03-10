
import React from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import CompanySelector from './CompanySelector';

interface LoginFormInputsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  accountType: string;
}

const LoginFormInputs: React.FC<LoginFormInputsProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  selectedCompanyId,
  setSelectedCompanyId,
  accountType
}) => {
  return (
    <div className="space-y-4">
      {/* Show company selection for driver and company logins */}
      {(accountType === 'driver' || accountType === 'company') && (
        <CompanySelector 
          selectedCompanyId={selectedCompanyId}
          setSelectedCompanyId={setSelectedCompanyId}
        />
      )}
      
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input 
          id="email" 
          type="email" 
          placeholder="nome@exemplo.com" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">
            Senha
          </label>
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Esqueceu a senha?
          </Link>
        </div>
        <Input 
          id="password" 
          type="password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
    </div>
  );
};

export default LoginFormInputs;
