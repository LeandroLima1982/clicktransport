
import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import AuthContainer from '@/components/auth/AuthContainer';
import { useAuthPage } from '@/hooks/auth/useAuthPage';

const LoginPage: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    handleLogin, 
    loading, 
    error,
    getTitle,
    getDescription
  } = useAuthPage();
  
  return (
    <AuthContainer
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      title={getTitle()}
      description={getDescription()}
      error={error}
    >
      <LoginForm 
        handleLogin={handleLogin} 
        loading={loading} 
        setActiveTab={setActiveTab} 
      />
    </AuthContainer>
  );
};

export default LoginPage;
