import React from 'react';
import { AuthLayout } from '../../../layouts/AuthLayout';
import { Heading } from '../../../components/typography/Heading';
import { AppText } from '../../../components/typography/Text';

export const ForgotPasswordScreen: React.FC = () => {
  return (
    <AuthLayout>
      <Heading level="h2">Forgot Password</Heading>
      <AppText size="base" style={{ marginTop: 8 }}>
        Enter your employee ID to reset your password
      </AppText>
    </AuthLayout>
  );
};
