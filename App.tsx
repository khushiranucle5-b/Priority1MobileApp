import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { AppProviders } from './src/providers/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useTheme } from './src/providers/ThemeProvider';
import { GlobalAlertListener } from './src/components/GlobalAlertListener';

LogBox.ignoreAllLogs(true);

const AppContent: React.FC = () => {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <RootNavigator />
      <GlobalAlertListener />
    </>
  );
};

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
