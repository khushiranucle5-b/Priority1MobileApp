import React, { useState, useEffect } from 'react';
import { alertService, AlertPayload } from '../services/alert.service';
import { CustomAlertModal } from './CustomAlertModal';

export const GlobalAlertListener: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<AlertPayload | null>(null);

  useEffect(() => {
    // Intercept native Alert.alert globally so all app alerts use the custom UI
    alertService.init();

    // Subscribe to alert state changes
    const unsubscribe = alertService.subscribe((alert) => {
      setActiveAlert(alert);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <CustomAlertModal
      alert={activeAlert}
      onDismiss={() => alertService.hide()}
    />
  );
};
