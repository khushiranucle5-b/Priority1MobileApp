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
    activeClockInTimestamp,
    clockOutTimestamp,
    todayCompletedMs,
    attendanceStatus,
    isClockedIn,
    isClockedOut,
  } = useGuardStore();

  const [workingHours, setWorkingHours] = useState('00:00:00');

  const updateDuration = useCallback(() => {
    const baseMs = todayCompletedMs || 0;
    const sessionStartMs = activeClockInTimestamp || clockInTimestamp;

    if (isClockedIn && sessionStartMs) {
      // Currently checked in: total = today's completed session duration + current active session duration
      const activeSessionMs = Math.max(0, Date.now() - sessionStartMs);
      const totalMs = baseMs + activeSessionMs;
      setWorkingHours(formatDuration(totalMs));
    } else {
      // Checked out or not checked in: total = today's completed session duration
      setWorkingHours(formatDuration(baseMs));
    }
  }, [isClockedIn, activeClockInTimestamp, clockInTimestamp, todayCompletedMs]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    updateDuration();

    if (isClockedIn && (activeClockInTimestamp || clockInTimestamp)) {
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
  }, [isClockedIn, activeClockInTimestamp, clockInTimestamp, todayCompletedMs, updateDuration]);

  return {
    workingHours,
    clockInTimeStr: (isClockedIn || isClockedOut) && clockInTimestamp ? formatTime(clockInTimestamp) : '--:--',
    clockOutTimeStr: isClockedOut && clockOutTimestamp ? formatTime(clockOutTimestamp) : '--:--',
    attendanceStatus,
  };
};
