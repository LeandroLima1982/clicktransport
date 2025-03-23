
import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import AuthContainer from '@/components/auth/AuthContainer';
import { useAuthPage } from '@/hooks/auth/useAuthPage';

const RegisterPage: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    handleRegister, 
    loading, 
    error, 
    isBusinessUser,
    toggleUserType,
    accountType,
    setAccountType,
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
      <RegisterForm 
        handleRegister={handleRegister}
        loading={loading}
        isBusinessUser={isBusinessUser}
        toggleUserType={toggleUserType}
        accountType={accountType}
        setAccountType={setAccountType}
        setActiveTab={setActiveTab}
      />
    </AuthContainer>
  );
};

export default RegisterPage;
