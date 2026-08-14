import { create } from 'zustand';

export type AttendanceStatus = 'Not Checked In' | 'Checked In' | 'Checked Out';

export interface LeaveAttachment {
  name: string;
  type: string;
  size: number;
  uri: string;
}

export interface LeaveRequest {
  id: string;
  type: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  attachment?: LeaveAttachment;
}

export interface IncidentReport {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Submitted' | 'Under Review' | 'Resolved';
  reportedDate: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  day: string;
  siteName: string;
  shiftName: string;
  clockIn: string | null;
  clockOut: string | null;
  workingHours: number;
  status: 'Present' | 'Absent' | 'Half Day' | 'Holiday' | 'Leave';
  notes: string;
}

export interface AppNotification {
  id: string;
  type: 'Attendance' | 'Leave' | 'Incident' | 'Company' | 'Holiday' | 'System';
  title: string;
  description: string;
  date: string;
  time: string;
  isRead: boolean;
  priority: 'High' | 'Medium' | 'Low';
  actionType?: string;
  referenceId?: string;
}

interface GuardState {
  attendanceStatus: AttendanceStatus;
  clockInTimestamp: number | null;
  clockOutTimestamp: number | null;
  isClockedIn: boolean;
  isClockedOut: boolean;
  leaves: LeaveRequest[];
  incidents: IncidentReport[];
  attendanceHistory: AttendanceRecord[];
  notifications: AppNotification[];
  clockIn: () => void;
  clockOut: () => void;
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => void;
  reportIncident: (incident: Omit<IncidentReport, 'id' | 'status' | 'reportedDate'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  deleteAllNotifications: () => void;
}

export const useGuardStore = create<GuardState>((set) => ({
  attendanceStatus: 'Not Checked In',
  clockInTimestamp: null,
  clockOutTimestamp: null,
  isClockedIn: false,
  isClockedOut: false,
  leaves: [
    {
      id: 'l1',
      type: 'Sick Leave',
      fromDate: '2026-07-20',
      toDate: '2026-07-21',
      days: 2,
      reason: 'Fever and cold',
      status: 'Approved',
      appliedDate: '2026-07-19',
    },
    {
      id: 'l2',
      type: 'Annual Leave',
      fromDate: '2026-08-15',
      toDate: '2026-08-18',
      days: 4,
      reason: 'Family trip',
      status: 'Pending',
      appliedDate: '2026-08-01',
    }
  ],
  incidents: [
    {
      id: 'i1',
      type: 'Security Breach',
      title: 'Unauthorized Entry Attempt',
      description: 'Person tried to enter without ID card.',
      location: 'Main Gate',
      severity: 'High',
      status: 'Under Review',
      reportedDate: '2026-08-04T10:30:00Z',
    }
  ],
  attendanceHistory: [
    {
      id: 'a1',
      date: '2026-08-04',
      day: 'Tuesday',
      siteName: 'ABC Industries',
      shiftName: 'Morning Shift',
      clockIn: '2026-08-04T09:00:00Z',
      clockOut: '2026-08-04T18:00:00Z',
      workingHours: 9,
      status: 'Present',
      notes: 'Routine checks completed.',
    },
    {
      id: 'a2',
      date: '2026-08-03',
      day: 'Monday',
      siteName: 'ABC Industries',
      shiftName: 'Morning Shift',
      clockIn: '2026-08-03T09:15:00Z',
      clockOut: '2026-08-03T18:00:00Z',
      workingHours: 8.75,
      status: 'Present',
      notes: 'Late arrival due to traffic.',
    },
    {
      id: 'a3',
      date: '2026-08-02',
      day: 'Sunday',
      siteName: 'Main Campus',
      shiftName: 'Off',
      clockIn: null,
      clockOut: null,
      workingHours: 0,
      status: 'Holiday',
      notes: 'Weekly off.',
    },
    {
      id: 'a4',
      date: '2026-08-01',
      day: 'Saturday',
      siteName: 'Main Campus',
      shiftName: 'Morning Shift',
      clockIn: null,
      clockOut: null,
      workingHours: 0,
      status: 'Absent',
      notes: 'No show.',
    }
  ],
  notifications: [
    {
      id: 'n1',
      type: 'Company',
      title: 'Monthly Townhall',
      description: 'The monthly townhall meeting is scheduled for tomorrow at 10 AM.',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toISOString(),
      isRead: false,
      priority: 'High',
    },
    {
      id: 'n2',
      type: 'Holiday',
      title: 'Upcoming Holiday',
      description: 'Independence Day on Aug 15th.',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      time: new Date(Date.now() - 86400000).toISOString(),
      isRead: true,
      priority: 'Low',
    }
  ],
  clockIn: () => {
    set((state) => {
      const now = Date.now();
      const today = new Date(now).toISOString().split('T')[0];
      const todayRecordIndex = state.attendanceHistory.findIndex(r => r.date === today);
      
      let updatedHistory = [...state.attendanceHistory];
      if (todayRecordIndex >= 0) {
        updatedHistory[todayRecordIndex] = {
          ...updatedHistory[todayRecordIndex],
          clockIn: new Date(now).toISOString(),
          status: 'Present',
        };
      } else {
        updatedHistory.unshift({
          id: `att_${now}`,
          date: today,
          day: new Date(now).toLocaleDateString('en-US', { weekday: 'long' }),
          siteName: 'ABC Industries',
          shiftName: 'Morning Shift',
          clockIn: new Date(now).toISOString(),
          clockOut: null,
          workingHours: 0,
          status: 'Present',
          notes: ''
        });
      }

      const notification: AppNotification = {
        id: `notif_${now}`,
        type: 'Attendance',
        title: 'Clock In Successful',
        description: `You have successfully clocked in at ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        date: today,
        time: new Date(now).toISOString(),
        isRead: false,
        priority: 'Medium',
      };

      return {
        attendanceStatus: 'Checked In', 
        clockInTimestamp: now,
        clockOutTimestamp: null,
        isClockedIn: true,
        isClockedOut: false,
        attendanceHistory: updatedHistory,
        notifications: [notification, ...state.notifications],
      };
    });
  },
  clockOut: () => {
    set((state) => {
      const now = Date.now();
      const today = new Date(now).toISOString().split('T')[0];
      const todayRecordIndex = state.attendanceHistory.findIndex(r => r.date === today);
      
      let updatedHistory = [...state.attendanceHistory];
      if (todayRecordIndex >= 0) {
        const record = updatedHistory[todayRecordIndex];
        const clockInTime = state.clockInTimestamp || new Date(record.clockIn || now).getTime();
        const diffMs = now - clockInTime;
        const workingHours = diffMs / (1000 * 60 * 60);

        updatedHistory[todayRecordIndex] = {
          ...record,
          clockOut: new Date(now).toISOString(),
          workingHours: workingHours,
        };
      }

      const notification: AppNotification = {
        id: `notif_${now}`,
        type: 'Attendance',
        title: 'Clock Out Successful',
        description: `You have successfully clocked out at ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        date: today,
        time: new Date(now).toISOString(),
        isRead: false,
        priority: 'Medium',
      };

      return { 
        attendanceStatus: 'Checked Out', 
        clockOutTimestamp: now,
        isClockedIn: false,
        isClockedOut: true,
        attendanceHistory: updatedHistory,
        notifications: [notification, ...state.notifications],
      };
    });
  },
  applyLeave: (leave) => {
    set((state) => {
      const now = Date.now();
      const notification: AppNotification = {
        id: `notif_${now}`,
        type: 'Leave',
        title: 'Leave Submitted',
        description: `Your leave application for ${leave.days} days has been submitted.`,
        date: new Date(now).toISOString().split('T')[0],
        time: new Date(now).toISOString(),
        isRead: false,
        priority: 'Medium',
      };

      return {
        leaves: [
          {
            ...leave,
            id: `l${now}`,
            status: 'Pending',
            appliedDate: new Date().toISOString().split('T')[0],
          },
          ...state.leaves,
        ],
        notifications: [notification, ...state.notifications],
      };
    });
  },
  reportIncident: (incident) => {
    set((state) => {
      const now = Date.now();
      const notification: AppNotification = {
        id: `notif_${now}`,
        type: 'Incident',
        title: 'Incident Submitted',
        description: `Your incident report "${incident.title}" has been submitted for review.`,
        date: new Date(now).toISOString().split('T')[0],
        time: new Date(now).toISOString(),
        isRead: false,
        priority: 'High',
      };

      return {
        incidents: [
          {
            ...incident,
            id: `i${now}`,
            status: 'Submitted',
            reportedDate: new Date().toISOString(),
          },
          ...state.incidents,
        ],
        notifications: [notification, ...state.notifications],
      };
    });
  },
  markNotificationRead: (id) => set(state => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
  })),
  markAllNotificationsRead: () => set(state => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
  })),
  deleteNotification: (id) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  deleteAllNotifications: () => set({ notifications: [] }),
}));
