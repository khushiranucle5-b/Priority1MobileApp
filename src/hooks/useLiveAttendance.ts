import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useGuardStore } from '../store/useGuardStore';

const formatTime = (timestamp: number | null): string => {
  if (!timestamp) return '--:--';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (ms: number): string => {
  if (!ms || ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const useLiveAttendance = () => {
  const {
    clockInTimestamp,
    clockOutTimestamp,
    attendanceStatus,
    isClockedIn,
    isClockedOut,
  } = useGuardStore();

  const [workingHours, setWorkingHours] = useState('00:00:00');

  const updateDuration = useCallback(() => {
    if (isClockedIn && clockInTimestamp) {
      // Currently checked in: exact duration = current time - clockIn timestamp
      const currentMs = Math.max(0, Date.now() - clockInTimestamp);
      setWorkingHours(formatDuration(currentMs));
    } else if (isClockedOut && clockInTimestamp && clockOutTimestamp) {
      // Checked out: fixed final duration = clockOut timestamp - clockIn timestamp
      const sessionMs = Math.max(0, clockOutTimestamp - clockInTimestamp);
      setWorkingHours(formatDuration(sessionMs));
    } else {
      // Not checked in: 00:00:00
      setWorkingHours('00:00:00');
    }
  }, [isClockedIn, isClockedOut, clockInTimestamp, clockOutTimestamp]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    updateDuration();

    if (isClockedIn && clockInTimestamp) {
      interval = setInterval(updateDuration, 1000);
    }

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        updateDuration();
      }
    });

    return () => {
      if (interval) clearInterval(interval);
      subscription.remove();
    };
  }, [isClockedIn, clockInTimestamp, updateDuration]);

  return {
    workingHours,
    clockInTimeStr: isClockedIn || isClockedOut ? formatTime(clockInTimestamp) : '--:--',
    clockOutTimeStr: isClockedOut && clockOutTimestamp ? formatTime(clockOutTimestamp) : '--:--',
    attendanceStatus,
  };
};
