import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';
import { useGuardStore } from '../store/useGuardStore';
import { AuthNavigator } from './AuthNavigator';
import { TabNavigator } from './TabNavigator';
import { AppText } from '../components/typography/Text';
import { TermsPopup } from '../components/TermsPopup';
import { useTheme } from '../providers/ThemeProvider';

import { navigationRef } from './navigationService';

export const RootNavigator = () => {
  const { colors } = useTheme();
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
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('../assets/images/app_logo.png')}
          style={{
            width: 88,
            height: 88,
            borderRadius: 20,
          }}
          resizeMode="contain"
        />
        <AppText size="lg" weight="bold" style={{ color: colors.text, marginTop: 20 }}>
          PriorityOne Security
        </AppText>
        <AppText size="sm" style={{ color: colors.textSecondary, marginTop: 6 }}>
          Loading Guard Workspace...
        </AppText>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
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
