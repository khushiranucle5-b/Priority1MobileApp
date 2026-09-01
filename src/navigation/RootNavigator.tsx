import React, { useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ShieldCheck } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useGuardStore } from '../store/useGuardStore';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { AppText } from '../components/typography/Text';
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
    return (
      <View style={{ flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' }}>
        <ShieldCheck size={120} color="#5B46E5" />
        <AppText size="lg" weight="bold" style={{ color: '#FFFFFF', marginTop: 24 }}>
          Loading Guard Workspace...
        </AppText>
      </View>
    );
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
