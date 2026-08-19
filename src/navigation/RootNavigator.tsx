import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { useGuardStore } from '../store/useGuardStore';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { LoadingState } from '../components/feedback/LoadingState';
import { TermsPopup } from '../components/TermsPopup';

export const RootNavigator = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkSession = useAuthStore((state) => state.checkSession);
  const user = useAuthStore((state) => state.user);
  const loadGuardData = useGuardStore((state) => state.loadGuardData);
  const isInitialized = useGuardStore((state) => state.isInitialized);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadGuardData(user.id, user.email);
    }
  }, [isAuthenticated, user]);

  // Safety fallback: ensure initialization resolves within 2 seconds
  useEffect(() => {
    if (isAuthenticated && !isInitialized) {
      const timer = setTimeout(() => {
        useGuardStore.setState({ isInitialized: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isInitialized]);

  if (isLoading || (isAuthenticated && !isInitialized)) {
    return <LoadingState message="Loading Guard Workspace..." />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <>
          <TabNavigator />
          <TermsPopup />
        </>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};
