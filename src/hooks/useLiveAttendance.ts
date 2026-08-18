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
  const { clockInTimestamp, clockOutTimestamp, attendanceStatus, isClockedIn, isClockedOut, attendanceHistory } = useGuardStore();
  const [workingHours, setWorkingHours] = useState('00:00:00');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate sum of completed session durations for TODAY only
    const completedMsToday = attendanceHistory
      .filter(a => a.date === todayStr && a.clockIn && a.clockOut)
      .reduce((sum, a) => {
        const inT = new Date(a.clockIn!).getTime();
        const outT = new Date(a.clockOut!).getTime();
        return sum + (outT > inT ? outT - inT : 0);
      }, 0);

    const updateDuration = () => {
      if (isClockedIn && clockInTimestamp) {
        // Currently clocked in: completed duration today + active session duration
        const currentSessionMs = Math.max(0, Date.now() - clockInTimestamp);
        setWorkingHours(formatDuration(completedMsToday + currentSessionMs));
      } else {
        // Clocked out or not checked in: show total completed duration today
        setWorkingHours(formatDuration(completedMsToday));
      }
    };

    updateDuration(); // Initial call

    if (isClockedIn) {
      interval = setInterval(updateDuration, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [clockInTimestamp, clockOutTimestamp, isClockedIn, isClockedOut, attendanceHistory]);

  return {
    workingHours,
    clockInTimeStr: formatTime(clockInTimestamp),
    clockOutTimeStr: formatTime(clockOutTimestamp),
    attendanceStatus,
  };
};
