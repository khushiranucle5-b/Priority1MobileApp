import { AttendanceRecord, LeaveRequest } from '../../../store/useGuardStore';

export interface MergedAttendanceRecord {
  dateStr: string;
  type: 'attendance' | 'leave' | 'none';
  status: string;
  attendance?: AttendanceRecord;
  leave?: LeaveRequest;
}

// Utility to generate array of dates between start and end (inclusive)
export const getDatesInRange = (startDateStr: string, endDateStr: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return dates;

  let current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// Gets the merged status of a specific date
export const getMergedStatusForDate = (
  dateStr: string, 
  attendanceHistory: AttendanceRecord[], 
  leaves: LeaveRequest[]
): MergedAttendanceRecord => {
  const attendance = attendanceHistory.find(a => a.date === dateStr);
  
  if (attendance) {
    return {
      dateStr,
      type: 'attendance',
      status: attendance.status,
      attendance
    };
  }

  // Check if date falls in an approved leave
  const approvedLeaves = leaves.filter(l => l.status.toLowerCase() === 'approved');
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
  attendanceHistory: AttendanceRecord[], 
  leaves: LeaveRequest[]
): MergedAttendanceRecord[] => {
  const records: MergedAttendanceRecord[] = [];
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const approvedLeaves = leaves.filter(l => l.status.toLowerCase() === 'approved');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    
    // Fast path: find attendance
    const attendance = attendanceHistory.find(a => a.date === dateStr);
    if (attendance) {
      records.push({
        dateStr,
        type: 'attendance',
        status: attendance.status,
        attendance
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
