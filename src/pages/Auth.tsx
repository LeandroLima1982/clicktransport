
import React from 'react';
import { AuthContainer, LoginForm, RegisterForm } from '@/components/auth';
import { useAuthPage } from '../hooks/auth/useAuthPage';
import { Car, Briefcase, Shield, User, Mail } from 'lucide-react';

const Auth = () => {
  const {
    activeTab,
    setActiveTab,
    accountType,
    setAccountType,
    loading,
    error,
    isBusinessUser,
    handleLogin,
    handleRegister,
    toggleUserType,
    getTitle,
    getDescription,
    getRoleIcon,
    awaitingEmailConfirmation
  } = useAuthPage();

  // Map role icon name to component
  const getRoleIconComponent = () => {
    if (awaitingEmailConfirmation) return <Mail className="h-8 w-8 text-primary mb-2" />;
    
    const iconType = getRoleIcon();
    if (iconType === 'client') return <User className="h-8 w-8 text-primary mb-2" />;
    if (iconType === 'driver') return <Car className="h-8 w-8 text-primary mb-2" />;
    if (iconType === 'company') return <Briefcase className="h-8 w-8 text-primary mb-2" />;
    if (iconType === 'admin') return <Shield className="h-8 w-8 text-primary mb-2" />;
    return null;
  };

  return (
    <AuthContainer
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      title={getTitle()}
      description={getDescription()}
      error={error}
      icon={getRoleIconComponent()}
    >
      <LoginForm 
        handleLogin={handleLogin} 
        loading={loading} 
        setActiveTab={setActiveTab} 
      />
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

export default Auth;
