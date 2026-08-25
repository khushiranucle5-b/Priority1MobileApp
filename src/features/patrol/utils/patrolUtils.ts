import { useState, useEffect } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { DBPatrol } from '../../../store/useGuardStore';
import { formatDisplayDate } from '../../../utils/dateUtils';

export interface PatrolAvailability {
  canStart: boolean;
  buttonText: string;
  statusLabel: string;
  isPastDate: boolean;
  isFutureDate: boolean;
  isBeforeBuffer: boolean;
  isExpired: boolean;
  isIncomplete: boolean;
  isCompleted: boolean;
  isInProgress: boolean;
  startWindowStartStr: string;
  expireTimeStr: string;
  expiresInMinutes: number | null;
  expiresInText: string;
}

export const DEFAULT_START_BUFFER_MINUTES = 0;

/**
 * Parses time strings like "08:00 AM", "10:05 PM", "14:30" into a Date object for a given date
 */
export const parsePatrolDateTime = (dateStr: string, timeStr: string): Date | null => {
  if (!dateStr || !timeStr) return null;

  try {
    let year: number;
    let month: number;
    let day: number;

    const ymdMatch = String(dateStr).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      year = parseInt(ymdMatch[1], 10);
      month = parseInt(ymdMatch[2], 10) - 1;
      day = parseInt(ymdMatch[3], 10);
    } else {
      let baseDate = new Date(dateStr);
      if (isNaN(baseDate.getTime())) {
        baseDate = new Date();
      }
      year = baseDate.getFullYear();
      month = baseDate.getMonth();
      day = baseDate.getDate();
    }

    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return new Date(year, month, day, hours, minutes, 0, 0);
  } catch (e) {
    return null;
  }
};

/**
 * Evaluates patrol availability according to standard lifecycle:
 * - Scheduled Start -> normal action window -> Scheduled End -> 30-min grace period -> Final Cutoff -> expired/incomplete
 */
export const getPatrolAvailability = (
  patrol: DBPatrol,
  bufferMinutes: number = 0,
  now: Date = new Date()
): PatrolAvailability => {
  const statusStr = (patrol.status || '').toLowerCase();
  const scannedCount = patrol.scanned || 0;
  const totalCPs = patrol.checkpoints || 5;
  const isCompleted = statusStr === 'completed' || (totalCPs > 0 && scannedCount >= totalCPs);

  // Time calculations
  const startTimeStr = patrol.scheduledStartTime || patrol.startTime || '08:00 AM';
  const endTimeStr = patrol.scheduledEndTime || patrol.endTime || '09:00 AM';

  const scheduledStartObj = parsePatrolDateTime(patrol.date, startTimeStr);
  let scheduledEndObj = parsePatrolDateTime(patrol.date, endTimeStr);

  const scheduledStartMs = scheduledStartObj ? scheduledStartObj.getTime() : now.getTime();

  if (!scheduledEndObj) {
    scheduledEndObj = new Date(scheduledStartMs + 60 * 60 * 1000);
  } else if (scheduledEndObj.getTime() <= scheduledStartMs) {
    // Overnight shift edge case
    scheduledEndObj = new Date(scheduledEndObj.getTime() + 24 * 60 * 60 * 1000);
  }

  const scheduledEndMs = scheduledEndObj.getTime();
  // Final cutoff is 30 minutes after scheduled end time
  const graceEndMs = scheduledEndMs + 30 * 60 * 1000;
  const graceEndObj = new Date(graceEndMs);

  const expireTimeStr = graceEndObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const startWindowStartStr = scheduledStartObj
    ? scheduledStartObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : startTimeStr;

  const nowMs = now.getTime();
  const diffMs = graceEndMs - nowMs;
  const expiresInMinutes = diffMs > 0 ? Math.floor(diffMs / 60000) : 0;

  let expiresInText = '';
  if (!isCompleted) {
    if (nowMs >= graceEndMs) {
      expiresInText = scannedCount > 0 ? 'Incomplete Patrol' : `Expired at ${expireTimeStr}`;
    } else if (diffMs > 0) {
      if (expiresInMinutes < 60) {
        expiresInText = `Expires in ${expiresInMinutes} mins (${expireTimeStr})`;
      } else {
        const hrs = (expiresInMinutes / 60).toFixed(1);
        expiresInText = `Expires in ${hrs}h (${expireTimeStr})`;
      }
    } else {
      expiresInText = `Expires at ${expireTimeStr}`;
    }
  }

  if (isCompleted) {
    return {
      canStart: false,
      buttonText: 'PATROL COMPLETED',
      statusLabel: 'Completed',
      isPastDate: false,
      isFutureDate: false,
      isBeforeBuffer: false,
      isExpired: false,
      isIncomplete: false,
      isCompleted: true,
      isInProgress: false,
      startWindowStartStr,
      expireTimeStr,
      expiresInMinutes: null,
      expiresInText: 'Completed',
    };
  }

  // Parse target date vs today
  let targetDate: Date;
  const ymdMatch = String(patrol.date).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymdMatch) {
    targetDate = new Date(parseInt(ymdMatch[1], 10), parseInt(ymdMatch[2], 10) - 1, parseInt(ymdMatch[3], 10));
  } else {
    const pDate = new Date(patrol.date);
    targetDate = !isNaN(pDate.getTime())
      ? new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate())
      : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Past Date Check (strictly before today)
  if (targetDate.getTime() < todayDate.getTime()) {
    const hasProgress = scannedCount > 0;
    return {
      canStart: false,
      buttonText: hasProgress ? 'INCOMPLETE PATROL' : 'PATROL MISSED',
      statusLabel: hasProgress ? 'Incomplete' : 'Missed',
      isPastDate: true,
      isFutureDate: false,
      isBeforeBuffer: false,
      isExpired: !hasProgress,
      isIncomplete: hasProgress,
      isCompleted: false,
      isInProgress: false,
      startWindowStartStr,
      expireTimeStr,
      expiresInMinutes: 0,
      expiresInText: hasProgress ? 'Incomplete' : 'Missed',
    };
  }

  // Future Date Check (strictly after today)
  if (targetDate.getTime() > todayDate.getTime()) {
    return {
      canStart: false,
      buttonText: `Starts ${patrol.date} at ${startTimeStr}`,
      statusLabel: 'Scheduled',
      isPastDate: false,
      isFutureDate: true,
      isBeforeBuffer: false,
      isExpired: false,
      isIncomplete: false,
      isCompleted: false,
      isInProgress: false,
      startWindowStartStr,
      expireTimeStr,
      expiresInMinutes,
      expiresInText: '',
    };
  }

  // Same Day Check — active window (scheduled start until grace period end) vs cutoff after grace period:
  const patrolStarted = statusStr === 'in_progress' || statusStr === 'in progress' || scannedCount > 0;

  // Bracket 1: Before scheduled start time (e.g. before 7:00 PM)
  if (nowMs < scheduledStartMs) {
    return {
      canStart: false,
      buttonText: `Available at ${startTimeStr}`,
      statusLabel: 'Scheduled',
      isPastDate: false,
      isFutureDate: false,
      isBeforeBuffer: true,
      isExpired: false,
      isIncomplete: false,
      isCompleted: false,
      isInProgress: false,
      startWindowStartStr,
      expireTimeStr,
      expiresInMinutes,
      expiresInText: '',
    };
  }

  // Bracket 2: Action window including 30-min grace period (e.g. 7:00 PM - 8:30 PM for a 7:00 PM - 8:00 PM patrol)
  if (nowMs < graceEndMs) {
    if (patrolStarted) {
      return {
        canStart: true,
        buttonText: 'CONTINUE PATROLLING',
        statusLabel: 'In Progress',
        isPastDate: false,
        isFutureDate: false,
        isBeforeBuffer: false,
        isExpired: false,
        isIncomplete: false,
        isCompleted: false,
        isInProgress: true,
        startWindowStartStr,
        expireTimeStr,
        expiresInMinutes,
        expiresInText,
      };
    }
    return {
      canStart: true,
      buttonText: 'START PATROLLING',
      statusLabel: 'Available',
      isPastDate: false,
      isFutureDate: false,
      isBeforeBuffer: false,
      isExpired: false,
      isIncomplete: false,
      isCompleted: false,
      isInProgress: false,
      startWindowStartStr,
      expireTimeStr,
      expiresInMinutes,
      expiresInText,
    };
  }

  // Bracket 3: After 30-min grace period cutoff (e.g. after 8:30 PM for a 7:00 PM - 8:00 PM patrol)
  const isPartial = scannedCount > 0;
  return {
    canStart: false,
    buttonText: isPartial ? 'INCOMPLETE PATROL' : 'PATROL EXPIRED',
    statusLabel: isPartial ? 'Incomplete' : 'Expired',
    isPastDate: false,
    isFutureDate: false,
    isBeforeBuffer: false,
    isExpired: !isPartial,
    isIncomplete: isPartial,
    isCompleted: false,
    isInProgress: false,
    startWindowStartStr,
    expireTimeStr,
    expiresInMinutes: 0,
    expiresInText: isPartial ? 'Incomplete Patrol' : `Expired at ${expireTimeStr}`,
  };
};

/**
 * Dynamically identifies the currently active or actionable patrol for today.
 * Priority:
 * 1. IN_PROGRESS patrol that is still inside its final cutoff
 * 2. AVAILABLE patrol whose scheduled start has arrived
 * 3. Next UPCOMING patrol
 * 4. No active patrol if all today's patrols are finished/expired (returns null)
 */
export const findCurrentPatrol = (patrols: DBPatrol[], now: Date = new Date()): DBPatrol | null => {
  if (!patrols || patrols.length === 0) return null;

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayKey = `${yyyy}-${mm}-${dd}`;

  // Filter today's patrols first
  const todayPatrols = patrols.filter(p => {
    if (!p.date) return false;
    const ymdMatch = String(p.date).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      const py = ymdMatch[1];
      const pm = String(parseInt(ymdMatch[2], 10)).padStart(2, '0');
      const pd = String(parseInt(ymdMatch[3], 10)).padStart(2, '0');
      if (`${py}-${pm}-${pd}` === todayKey) return true;
    }
    const d = new Date(p.date);
    if (!isNaN(d.getTime())) {
      const py = d.getFullYear();
      const pm = String(d.getMonth() + 1).padStart(2, '0');
      const pd = String(d.getDate()).padStart(2, '0');
      return `${py}-${pm}-${pd}` === todayKey;
    }
    return false;
  });

  const listToSearch = todayPatrols.length > 0 ? todayPatrols : patrols;

  // 1. IN_PROGRESS patrol that is still inside its final cutoff
  const inProgressPatrol = listToSearch.find(p => {
    const avail = getPatrolAvailability(p, 0, now);
    return avail.isInProgress && avail.canStart;
  });
  if (inProgressPatrol) return inProgressPatrol;

  // 2. AVAILABLE patrol whose scheduled start has arrived
  const availablePatrol = listToSearch.find(p => {
    const avail = getPatrolAvailability(p, 0, now);
    return avail.canStart && !avail.isInProgress;
  });
  if (availablePatrol) return availablePatrol;

  // 3. Next UPCOMING patrol
  const upcomingPatrols = listToSearch.filter(p => {
    const avail = getPatrolAvailability(p, 0, now);
    return avail.isBeforeBuffer || avail.isFutureDate;
  });
  if (upcomingPatrols.length > 0) {
    upcomingPatrols.sort((a, b) => {
      const aStart = parsePatrolDateTime(a.date, a.scheduledStartTime || a.startTime || '08:00 AM')?.getTime() || 0;
      const bStart = parsePatrolDateTime(b.date, b.scheduledStartTime || b.startTime || '08:00 AM')?.getTime() || 0;
      return aStart - bStart;
    });
    return upcomingPatrols[0];
  }

  // 4. No active patrol if all today's patrols are finished/expired
  return null;
};

/**
 * Hook providing real-time current date/time updating on tick, screen focus, and app foreground resume.
 */
export const useLiveNow = (updateIntervalMs: number = 5000): Date => {
  const [now, setNow] = useState(() => new Date());
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      setNow(new Date());
    }
  }, [isFocused]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, updateIntervalMs);

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        setNow(new Date());
      }
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [updateIntervalMs]);

  return now;
};

