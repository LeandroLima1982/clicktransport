
import React from 'react';
import { Link } from 'react-router-dom';

interface LoginLinksProps {
  accountType: string;
  setActiveTab: (tab: string) => void;
}

const LoginLinks: React.FC<LoginLinksProps> = ({ accountType, setActiveTab }) => {
  return (
    <>
      <div className="text-sm text-center text-foreground/70">
        Não tem uma conta?{' '}
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className="text-primary hover:underline"
        >
          Cadastre-se
        </button>
      </div>
      
      {accountType !== 'client' && (
        <div className="text-sm text-center">
          <Link to="/auth?type=client" className="text-primary hover:underline">
            Entrar como cliente
          </Link>
        </div>
      )}
      
      {accountType !== 'driver' && (
        <div className="text-sm text-center">
          <Link to="/auth?type=driver" className="text-primary hover:underline">
            Entrar como motorista
          </Link>
        </div>
      )}
      
      {accountType !== 'company' && (
        <div className="text-sm text-center">
          <Link to="/auth?type=company" className="text-primary hover:underline">
            Entrar como empresa
          </Link>
        </div>
      )}
      
      {accountType !== 'admin' && (
        <div className="text-sm text-center">
          <Link to="/auth?type=admin" className="text-primary hover:underline">
            Entrar como administrador
          </Link>
        </div>
      )}
    </>
  );
};

export default LoginLinks;
