import { AttendanceRecord, LeaveRequest } from '../../../store/useGuardStore';

export type AttendanceDayStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'LEAVE'
  | 'HOLIDAY'
  | 'WEEK_OFF'
  | 'FUTURE'
  | 'UNMARKED';

export interface MergedAttendanceRecord {
  dateStr: string;
  type: 'attendance' | 'leave' | 'holiday' | 'week_off' | 'none';
  status: string;
  normalizedStatus: AttendanceDayStatus;
  attendance?: AttendanceRecord;
  attendances?: AttendanceRecord[];
  leave?: LeaveRequest;
}

export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDatesInRange = (startDateStr: string, endDateStr: string): string[] => {
  const dates: string[] = [];
  const startParts = startDateStr.split('-').map(Number);
  const endParts = endDateStr.split('-').map(Number);

  if (startParts.length !== 3 || endParts.length !== 3) return dates;

  const start = new Date(startParts[0], startParts[1] - 1, startParts[2]);
  const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return dates;

  let current = new Date(start);
  while (current <= end) {
    dates.push(formatDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

/**
 * Single Source of Truth Normalization Function
 * Resolves one final daily status for any given date.
 */
export const getMergedStatusForDate = (
  dateStr: string,
  attendanceHistory: AttendanceRecord[] = [],
  leaves: LeaveRequest[] = []
): MergedAttendanceRecord => {
  const safeAtt = Array.isArray(attendanceHistory) ? attendanceHistory : [];
  const safeLeaves = Array.isArray(leaves) ? leaves : [];

  const now = new Date();
  const todayStr = formatDateKey(now);

  // Future Date (strictly after today)
  if (dateStr > todayStr) {
    // Check if an approved future leave exists
    const approvedLeaves = safeLeaves.filter(l => l?.status?.toLowerCase() === 'approved');
    for (const leave of approvedLeaves) {
      const dates = getDatesInRange(leave.fromDate, leave.toDate);
      if (dates.includes(dateStr)) {
        const isHalf = (leave.type || '').toLowerCase().includes('half');
        return {
          dateStr,
          type: 'leave',
          status: isHalf ? 'Half Day' : 'Leave',
          normalizedStatus: isHalf ? 'HALF_DAY' : 'LEAVE',
          leave,
        };
      }
    }

    return {
      dateStr,
      type: 'none',
      status: 'Future',
      normalizedStatus: 'FUTURE',
    };
  }

  // 1. Check Approved Leaves first for today/past dates
  const approvedLeaves = safeLeaves.filter(l => l?.status?.toLowerCase() === 'approved');
  for (const leave of approvedLeaves) {
    const dates = getDatesInRange(leave.fromDate, leave.toDate);
    if (dates.includes(dateStr)) {
      const isHalf = (leave.type || '').toLowerCase().includes('half');
      return {
        dateStr,
        type: 'leave',
        status: isHalf ? 'Half Day' : 'Leave',
        normalizedStatus: isHalf ? 'HALF_DAY' : 'LEAVE',
        leave,
      };
    }
  }

  // 2. Check Attendance History
  const dateAttendances = safeAtt.filter(a => a.date === dateStr);
  if (dateAttendances.length > 0) {
    const hasHalfDay = dateAttendances.some(a => (a.status || '').toLowerCase().includes('half'));
    const hasPresent = dateAttendances.some(a => (a.status || '').toLowerCase() === 'present');
    const hasAbsent = dateAttendances.some(a => (a.status || '').toLowerCase() === 'absent');

    let normalizedStatus: AttendanceDayStatus = 'PRESENT';
    let statusText = 'Present';

    if (hasHalfDay) {
      normalizedStatus = 'HALF_DAY';
      statusText = 'Half Day';
    } else if (hasPresent) {
      normalizedStatus = 'PRESENT';
      statusText = 'Present';
    } else if (hasAbsent) {
      normalizedStatus = 'ABSENT';
      statusText = 'Absent';
    }

    return {
      dateStr,
      type: 'attendance',
      status: statusText,
      normalizedStatus,
      attendance: dateAttendances[0],
      attendances: dateAttendances,
    };
  }

  // 4. Past working days with no attendance & no leave are marked Absent
  if (dateStr < todayStr) {
    return {
      dateStr,
      type: 'attendance',
      status: 'Absent',
      normalizedStatus: 'ABSENT',
    };
  }

  // 5. Today unmarked
  return {
    dateStr,
    type: 'none',
    status: 'No record',
    normalizedStatus: 'UNMARKED',
  };
};

export const getMonthRecords = (
  year: number,
  month: number,
  attendanceHistory: AttendanceRecord[] = [],
  leaves: LeaveRequest[] = []
): MergedAttendanceRecord[] => {
  const records: MergedAttendanceRecord[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = formatDateKey(d);
    const merged = getMergedStatusForDate(dateStr, attendanceHistory, leaves);
    records.push(merged);
  }

  // Sort descending by date
  records.sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());

  return records;
};
