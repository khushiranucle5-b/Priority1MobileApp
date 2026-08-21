import { DBPatrol } from '../../../store/useGuardStore';

export interface PatrolAvailability {
  canStart: boolean;
  buttonText: string;
  statusLabel: string;
  isPastDate: boolean;
  isFutureDate: boolean;
  isBeforeBuffer: boolean;
  isExpired: boolean;
  isCompleted: boolean;
  isInProgress: boolean;
  startWindowStartStr: string;
}

export const DEFAULT_START_BUFFER_MINUTES = 15;

/**
 * Parses time strings like "08:00 AM", "10:05 PM", "14:30" into a Date object for a given date
 */
export const parsePatrolDateTime = (dateStr: string, timeStr: string): Date | null => {
  if (!dateStr || !timeStr) return null;

  try {
    let baseDate = new Date(dateStr);
    if (isNaN(baseDate.getTime())) {
      baseDate = new Date();
    }

    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const day = baseDate.getDate();

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
 * Evaluates patrol start window and availability status using current time, scheduled time, and buffer
 */
export const getPatrolAvailability = (
  patrol: DBPatrol,
  bufferMinutes: number = DEFAULT_START_BUFFER_MINUTES,
  now: Date = new Date()
): PatrolAvailability => {
  const statusStr = (patrol.status || '').toLowerCase();
  const isCompleted = statusStr === 'completed';
  const isInProgress = statusStr === 'in_progress' || statusStr === 'in progress';

  if (isCompleted) {
    return {
      canStart: false,
      buttonText: 'PATROL COMPLETED',
      statusLabel: 'Completed',
      isPastDate: false,
      isFutureDate: false,
      isBeforeBuffer: false,
      isExpired: false,
      isCompleted: true,
      isInProgress: false,
      startWindowStartStr: '',
    };
  }

  if (isInProgress) {
    return {
      canStart: true,
      buttonText: 'CONTINUE PATROLLING',
      statusLabel: 'In Progress',
      isPastDate: false,
      isFutureDate: false,
      isBeforeBuffer: false,
      isExpired: false,
      isCompleted: false,
      isInProgress: true,
      startWindowStartStr: '',
    };
  }

  // Parse dates
  const patrolDate = new Date(patrol.date);
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = isNaN(patrolDate.getTime())
    ? todayDate
    : new Date(patrolDate.getFullYear(), patrolDate.getMonth(), patrolDate.getDate());

  // Past Date Check (strictly before today)
  if (targetDate.getTime() < todayDate.getTime()) {
    return {
      canStart: false,
      buttonText: 'PAST DATE',
      statusLabel: patrol.status || 'Expired',
      isPastDate: true,
      isFutureDate: false,
      isBeforeBuffer: false,
      isExpired: true,
      isCompleted: false,
      isInProgress: false,
      startWindowStartStr: '',
    };
  }

  // Future Date Check (strictly after today)
  if (targetDate.getTime() > todayDate.getTime()) {
    const timeDisplay = patrol.scheduledStartTime || patrol.startTime || 'Scheduled';
    return {
      canStart: false,
      buttonText: `Starts ${patrol.date} at ${timeDisplay}`,
      statusLabel: 'Scheduled',
      isPastDate: false,
      isFutureDate: true,
      isBeforeBuffer: false,
      isExpired: false,
      isCompleted: false,
      isInProgress: false,
      startWindowStartStr: '',
    };
  }

  // Same Day Check — evaluate scheduled start time & buffer
  const startTimeStr = patrol.scheduledStartTime || patrol.startTime || '08:00 AM';
  const scheduledStartObj = parsePatrolDateTime(patrol.date, startTimeStr);

  if (!scheduledStartObj) {
    return {
      canStart: true,
      buttonText: 'START PATROLLING',
      statusLabel: 'Available',
      isPastDate: false,
      isFutureDate: false,
      isBeforeBuffer: false,
      isExpired: false,
      isCompleted: false,
      isInProgress: false,
      startWindowStartStr: startTimeStr,
    };
  }

  const scheduledStartMs = scheduledStartObj.getTime();
  const bufferMs = bufferMinutes * 60 * 1000;
  const allowedStartMs = scheduledStartMs - bufferMs;

  const allowedStartDate = new Date(allowedStartMs);
  const startWindowStartStr = allowedStartDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const endTimeStr = patrol.scheduledEndTime || patrol.endTime || '11:59 PM';
  const scheduledEndObj = parsePatrolDateTime(patrol.date, endTimeStr);
  const scheduledEndMs = scheduledEndObj ? scheduledEndObj.getTime() + 30 * 60 * 1000 : scheduledStartMs + 4 * 3600 * 1000;

  const nowMs = now.getTime();

  // Before buffer window
  if (nowMs < allowedStartMs) {
    return {
      canStart: false,
      buttonText: `Available from ${startWindowStartStr}`,
      statusLabel: 'Scheduled',
      isPastDate: false,
      isFutureDate: false,
      isBeforeBuffer: true,
      isExpired: false,
      isCompleted: false,
      isInProgress: false,
      startWindowStartStr,
    };
  }

  // Past allowed shift end window
  if (nowMs > scheduledEndMs && (patrol.scanned === 0 || !patrol.scanned)) {
    return {
      canStart: false,
      buttonText: 'PATROL EXPIRED',
      statusLabel: 'Expired',
      isPastDate: false,
      isFutureDate: false,
      isBeforeBuffer: false,
      isExpired: true,
      isCompleted: false,
      isInProgress: false,
      startWindowStartStr,
    };
  }

  // Within allowed start window
  return {
    canStart: true,
    buttonText: 'START PATROLLING',
    statusLabel: 'Available',
    isPastDate: false,
    isFutureDate: false,
    isBeforeBuffer: false,
    isExpired: false,
    isCompleted: false,
    isInProgress: false,
    startWindowStartStr,
  };
};
