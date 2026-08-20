import { AttendanceRecord, LeaveRequest } from '../../../store/useGuardStore';

export interface MergedAttendanceRecord {
  dateStr: string;
  type: 'attendance' | 'leave' | 'none';
  status: string;
  attendance?: AttendanceRecord;
  attendances?: AttendanceRecord[];
  leave?: LeaveRequest;
}

// Helper to format Date into local YYYY-MM-DD string without UTC offset conversion issues
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Utility to generate array of dates between start and end (inclusive)
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

// Gets the merged status of a specific date
export const getMergedStatusForDate = (
  dateStr: string, 
  attendanceHistory: AttendanceRecord[] = [], 
  leaves: LeaveRequest[] = []
): MergedAttendanceRecord => {
  const safeAtt = Array.isArray(attendanceHistory) ? attendanceHistory : [];
  const safeLeaves = Array.isArray(leaves) ? leaves : [];
  const todayStr = formatDateKey(new Date());

  // Future dates have no attendance data
  if (dateStr > todayStr) {
    return {
      dateStr,
      type: 'none',
      status: 'No record',
    };
  }

  const dateAttendances = safeAtt.filter(a => a.date === dateStr);
  
  if (dateAttendances.length > 0) {
    // Determine combined status: Half Day takes precedence if explicitly set, else Present/Absent
    let status = dateAttendances[0].status;
    if (dateAttendances.some(a => a.status.toLowerCase() === 'half day')) {
      status = 'Half Day';
    } else if (dateAttendances.some(a => a.status.toLowerCase() === 'present')) {
      status = 'Present';
    }

    return {
      dateStr,
      type: 'attendance',
      status,
      attendance: dateAttendances[0],
      attendances: dateAttendances,
    };
  }

  // Check if date falls in an approved leave
  const approvedLeaves = safeLeaves.filter(l => l?.status?.toLowerCase() === 'approved');
  for (const leave of approvedLeaves) {
    const dates = getDatesInRange(leave.fromDate, leave.toDate);
    if (dates.includes(dateStr)) {
      return {
        dateStr,
        type: 'leave',
        status: 'Leave',
        leave
      };
    }
  }

  return {
    dateStr,
    type: 'none',
    status: 'No record',
  };
};

export const getMonthRecords = (
  year: number, 
  month: number, 
  attendanceHistory: AttendanceRecord[] = [], 
  leaves: LeaveRequest[] = []
): MergedAttendanceRecord[] => {
  const safeAtt = Array.isArray(attendanceHistory) ? attendanceHistory : [];
  const safeLeaves = Array.isArray(leaves) ? leaves : [];
  const todayStr = formatDateKey(new Date());

  const records: MergedAttendanceRecord[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const approvedLeaves = safeLeaves.filter(l => l?.status?.toLowerCase() === 'approved');
  
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = formatDateKey(d);

    // Future dates in the month get No record
    if (dateStr > todayStr) {
      records.push({
        dateStr,
        type: 'none',
        status: 'No record',
      });
      continue;
    }
    
    // Fast path: find all attendance logs for this day
    const dateAttendances = safeAtt.filter(a => a.date === dateStr);
    if (dateAttendances.length > 0) {
      let status = dateAttendances[0].status;
      if (dateAttendances.some(a => a.status.toLowerCase() === 'half day')) {
        status = 'Half Day';
      } else if (dateAttendances.some(a => a.status.toLowerCase() === 'present')) {
        status = 'Present';
      }

      records.push({
        dateStr,
        type: 'attendance',
        status,
        attendance: dateAttendances[0],
        attendances: dateAttendances,
      });
      continue;
    }
    
    // Fast path: find leave
    let foundLeave = false;
    for (const leave of approvedLeaves) {
      const dates = getDatesInRange(leave.fromDate, leave.toDate);
      if (dates.includes(dateStr)) {
        records.push({
          dateStr,
          type: 'leave',
          status: 'Leave',
          leave
        });
        foundLeave = true;
        break;
      }
    }
    
    if (!foundLeave) {
      records.push({
        dateStr,
        type: 'none',
        status: 'No record',
      });
    }
  }
  
  // Sort descending by date
  records.sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());
  
  return records;
};
