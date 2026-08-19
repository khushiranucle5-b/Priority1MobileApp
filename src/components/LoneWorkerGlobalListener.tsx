import React, { useEffect } from 'react';
import { useGuardStore } from '../store/useGuardStore';
import { LoneWorkerModal } from '../features/home/components/LoneWorkerModal';

export const LoneWorkerGlobalListener: React.FC = () => {
  const { isClockedIn, loneWorker, triggerSafetyCheckDue, closeLoneWorkerModal } = useGuardStore();

  useEffect(() => {
    // Poll every 5 seconds to check if 30 minutes have elapsed since last check-in / clock-in
    const interval = setInterval(() => {
      if (isClockedIn && loneWorker.nextCheckTimestamp) {
        const now = Date.now();
        if (now >= loneWorker.nextCheckTimestamp && !loneWorker.isModalOpen) {
          triggerSafetyCheckDue();
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isClockedIn, loneWorker.nextCheckTimestamp, loneWorker.isModalOpen, triggerSafetyCheckDue]);

  return (
    <LoneWorkerModal
      visible={Boolean(loneWorker.isModalOpen)}
      onClose={closeLoneWorkerModal}
    />
  );
};
