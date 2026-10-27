import React, { useEffect } from 'react';
import { useGuardStore } from '../store/useGuardStore';
import { EmergencyDispatchAlertModal } from '../features/dispatches/components/EmergencyDispatchAlertModal';

export const EmergencyDispatchGlobalListener: React.FC = () => {
  const {
    activeEmergencyDispatch,
    checkIncomingDispatches,
    dismissEmergencyDispatchAlert,
    isInitialized,
    guardId,
  } = useGuardStore();

  useEffect(() => {
    if (!isInitialized || !guardId) return;

    // Run immediately once initialized
    checkIncomingDispatches();

    // Poll periodically every 4 seconds for any incoming or updated emergency dispatches
    const interval = setInterval(() => {
      checkIncomingDispatches();
    }, 4000);

    return () => clearInterval(interval);
  }, [isInitialized, guardId, checkIncomingDispatches]);

  return (
    <EmergencyDispatchAlertModal
      dispatch={activeEmergencyDispatch}
      visible={Boolean(activeEmergencyDispatch)}
      onClose={() => dismissEmergencyDispatchAlert()}
    />
  );
};
