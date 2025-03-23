
import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import AuthContainer from '@/components/auth/AuthContainer';

const LoginPage: React.FC = () => {
  return (
    <AuthContainer>
      <LoginForm />
    </AuthContainer>
  );
};

export default LoginPage;
