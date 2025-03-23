
import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import AuthContainer from '@/components/auth/AuthContainer';

const RegisterPage: React.FC = () => {
  return (
    <AuthContainer>
      <RegisterForm />
    </AuthContainer>
  );
};

export default RegisterPage;
