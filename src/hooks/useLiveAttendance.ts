import { useState, useEffect } from 'react';
import { useGuardStore } from '../store/useGuardStore';

const formatTime = (timestamp: number | null): string => {
  if (!timestamp) return '--:--';
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const useLiveAttendance = () => {
  const { clockInTimestamp, clockOutTimestamp, attendanceStatus, isClockedIn, isClockedOut } = useGuardStore();
  const [workingHours, setWorkingHours] = useState('00:00:00');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const updateDuration = () => {
      if (clockInTimestamp && !clockOutTimestamp) {
        // Clocked in, calculating live
        setWorkingHours(formatDuration(Date.now() - clockInTimestamp));
      } else if (clockInTimestamp && clockOutTimestamp) {
        // Clocked out, final duration
        setWorkingHours(formatDuration(clockOutTimestamp - clockInTimestamp));
      } else {
        // Not checked in
        setWorkingHours('00:00:00');
      }
    };

    updateDuration(); // Initial call

    if (isClockedIn && !isClockedOut) {
      interval = setInterval(updateDuration, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [clockInTimestamp, clockOutTimestamp, isClockedIn, isClockedOut]);

  return {
    workingHours,
    clockInTimeStr: formatTime(clockInTimestamp),
    clockOutTimeStr: formatTime(clockOutTimestamp),
    attendanceStatus,
  };
};
