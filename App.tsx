import React, { useEffect } from 'react';
import { StatusBar, LogBox, AppState, AppStateStatus } from 'react-native';
import { AppProviders } from './src/providers/AppProviders';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useTheme } from './src/providers/ThemeProvider';
import { GlobalAlertListener } from './src/components/GlobalAlertListener';
import { nativeAlertService } from './src/services/nativeAlert.service';
import { useGuardStore } from './src/store/useGuardStore';

LogBox.ignoreAllLogs(true);

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    const handleAlertAction = async () => {
      try {
        const actionData = await nativeAlertService.getInitialAlertAction();
        if (!actionData) return;

        if (actionData.action === 'LONE_WORKER_CHECK') {
          nativeAlertService.stopAlertSounds();
          useGuardStore.getState().openLoneWorkerModal();
        } else if (actionData.action === 'EMERGENCY_DISPATCH') {
          nativeAlertService.stopAlertSounds();
          const { dispatches, setEmergencyDispatchAlert, checkIncomingDispatches } = useGuardStore.getState();
          if (actionData.dispatchId) {
            const found = dispatches.find(d => d.id === actionData.dispatchId);
            if (found) {
              setEmergencyDispatchAlert(found);
            } else {
              await checkIncomingDispatches();
            }
          } else {
            await checkIncomingDispatches();
          }
        }
      } catch (e) {
        // Ignore action resolution error
      }
    };

    // Check immediately on startup
    handleAlertAction();

    // Also check whenever app becomes active / comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        handleAlertAction();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
