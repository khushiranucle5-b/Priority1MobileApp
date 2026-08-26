import { create } from 'zustand';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getTable,
  saveTable,
  insertRow,
  updateRow,
  DBShift,
  DBAttendance,
  DBPatrol,
  DBLeave,
  DBIncident,
  DBEmployee,
  DBLeaveBalances,
  getLeaveBalances,
  saveLeaveBalances,
  DBMessage,
  DBEmployeeDocument,
} from '../services/db';

export type { DBPatrol, DBEmployeeDocument };
import { LoggerService } from '../services/logger.service';
import { soundAlertService } from '../services/soundAlert.service';
import { formatDisplayDate } from '../utils/dateUtils';

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
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  appliedDate: string;
  attachment?: LeaveAttachment;
}

export interface IncidentReport {
  id: string;
  type: string;
  title: string;
  description: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  status: 'Submitted' | 'Under Review' | 'Resolved' | string;
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
  status: 'Present' | 'Absent' | 'Half Day' | 'Holiday' | 'Leave' | string;
  notes: string;
}

export interface AppNotification {
  id: string;
  type: 'Attendance' | 'Leave' | 'Incident' | 'Company' | 'Holiday' | 'System' | string;
  title: string;
  description: string;
  date: string;
  time: string;
  isRead: boolean;
  priority: 'High' | 'Medium' | 'Low' | string;
  actionType?: string;
  referenceId?: string;
}

export interface ActivityItem {
  id: string;
  type: 'Attendance' | 'Leave' | 'Patrol' | 'Incident' | 'Safety' | 'System' | string;
  title: string;
  description: string;
  date: string;
  time: string;
  timestamp: number;
}

const defaultInitialActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'Attendance',
    title: 'Clocked In Successfully',
    description: 'You clocked in at 06:58 PM at Ahmedabad Plant.',
    date: '25 Aug 2026',
    time: '06:58 PM',
    timestamp: Date.now() - 1000 * 60 * 10,
  },
  {
    id: 'act-2',
    type: 'Attendance',
    title: 'Clocked Out Successfully',
    description: 'You clocked out at 06:55 PM. Total: 0.09 hrs.',
    date: '25 Aug 2026',
    time: '06:55 PM',
    timestamp: Date.now() - 1000 * 60 * 13,
  },
  {
    id: 'act-3',
    type: 'Attendance',
    title: 'Clocked In Successfully',
    description: 'You clocked in at 06:50 PM at Ahmedabad Plant.',
    date: '25 Aug 2026',
    time: '06:50 PM',
    timestamp: Date.now() - 1000 * 60 * 18,
  },
  {
    id: 'act-4',
    type: 'Leave',
    title: 'Leave Request Submitted',
    description: 'Your Sick Leave request for 0.5 day(s) is pending approval.',
    date: '25 Aug 2026',
    time: '06:27 PM',
    timestamp: Date.now() - 1000 * 60 * 41,
  },
  {
    id: 'act-5',
    type: 'Patrol',
    title: 'Morning Patrol Started',
    description: 'Morning Perimeter Patrol started at 09:15 AM.',
    date: '25 Aug 2026',
    time: '09:15 AM',
    timestamp: Date.now() - 1000 * 60 * 60 * 10,
  },
  {
    id: 'act-6',
    type: 'Safety',
    title: 'Lone Worker Safety Check-In',
    description: 'Routine safety check-in verified at 11:00 AM.',
    date: '25 Aug 2026',
    time: '11:00 AM',
    timestamp: Date.now() - 1000 * 60 * 60 * 8,
  },
];

const defaultSupervisorApprovals: AppNotification[] = [
  {
    id: 'notif-appr-1',
    type: 'Leave Approval',
    title: 'Sick Leave Approved',
    description: 'Your Sick Leave request for 0.5 day(s) was approved by Supervisor Jane Smith.',
    date: '25 Aug 2026',
    time: '04:15 PM',
    isRead: false,
    priority: 'High',
  },
  {
    id: 'notif-appr-2',
    type: 'Attendance Approval',
    title: 'Attendance Regularization Approved',
    description: 'Your missed clock-out request for 24 Aug 2026 was approved by Supervisor.',
    date: '25 Aug 2026',
    time: '02:30 PM',
    isRead: true,
    priority: 'Medium',
  },
  {
    id: 'notif-appr-3',
    type: 'Shift Approval',
    title: 'Shift Change Request Approved',
    description: 'Your request to swap shift with Officer Bob was approved by Level 1 Approver.',
    date: '24 Aug 2026',
    time: '06:00 PM',
    isRead: true,
    priority: 'Medium',
  },
  {
    id: 'notif-appr-4',
    type: 'Overtime Approval',
    title: 'Overtime Claim Approved',
    description: 'Overtime claim of 2.0 hrs for Night Shift approved by Supervisor Jane Smith.',
    date: '23 Aug 2026',
    time: '11:20 AM',
    isRead: true,
    priority: 'Low',
  },
  {
    id: 'notif-appr-5',
    type: 'Document Approval',
    title: 'Document Verification Approved',
    description: 'Your Guard License document (#LIC-2026) was verified and approved by Supervisor.',
    date: '22 Aug 2026',
    time: '09:45 AM',
    isRead: true,
    priority: 'Medium',
  },
];

export interface LoneWorkerHistoryItem {
  id: string;
  guardId: string;
  guardName: string;
  dateStr: string;
  exactTime: string;
  siteName: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  radiusMeters: number;
  gpsStatus: 'GPS Verified' | 'Location Not Verified' | string;
  onTimeStatus: 'On Time' | 'Late Check-In' | string;
  status: 'Safe' | 'Checked In' | 'SOS / Issue Reported' | string;
  shiftInfo: string;
  timestamp: number;
}

export interface LoneWorkerState {
  status: 'SAFE' | 'Checked In' | 'Pending Check-In' | 'Missed Check-In' | 'CHECK REQUIRED' | 'OVERDUE' | 'SOS / Issue Reported' | 'NOT ACTIVE' | string;
  lastCheckIn: string | null;
  lastCheckInTimestamp: number | null;
  nextCheckRequired: string | null;
  nextCheckTimestamp?: number | null;
  isModalOpen?: boolean;
}

export interface CheckpointData {
  id: string;
  name: string;
  number: string;
  location: string;
  scheduledTime: string;
  status: 'Pending' | 'Completed' | 'Missed' | 'Skipped';
  scanTime?: string;
  qrCode: string;
}

interface GuardState {
  guardId: string | null;
  guardEmail: string | null;
  guardName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  address: string;
  profilePic: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  companyName: string;
  assignedSite: string;
  assignedSiteId: string;
  supervisor: string;
  supervisorPhone: string;
  attendanceStatus: AttendanceStatus;
  clockInTimestamp: number | null;
  activeClockInTimestamp: number | null;
  clockOutTimestamp: number | null;
  todayCompletedMs: number;
  isClockedIn: boolean;
  isClockedOut: boolean;
  isInitialized: boolean;

  // Dynamic datasets for currently logged-in guard
  leaves: LeaveRequest[];
  leaveBalances: DBLeaveBalances;
  incidents: IncidentReport[];
  attendanceHistory: AttendanceRecord[];
  documents: DBEmployeeDocument[];
  notifications: AppNotification[];
  activities: ActivityItem[];
  loneWorker: LoneWorkerState;
  loneWorkerHistory: LoneWorkerHistoryItem[];
  shifts: DBShift[];
  todayShift: DBShift | null;
  patrols: DBPatrol[];
  activePatrol: DBPatrol | null;
  patrolCheckpoints: CheckpointData[];
  patrolCheckpointsMap: Record<string, CheckpointData[]>;
  messages: DBMessage[];

  // Actions
  loadGuardData: (guardId: string, email: string) => Promise<void>;
  addActivity: (activity: { type?: string; title: string; description: string; date?: string; time?: string }) => Promise<void>;
  clearActivities: () => Promise<void>;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => Promise<void>;
  updateLeave: (leaveId: string, leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => Promise<void>;
  cancelLeave: (leaveId: string) => Promise<void>;
  reportIncident: (incident: Omit<IncidentReport, 'id' | 'status' | 'reportedDate'>) => Promise<void>;
  uploadDocument: (docInfo: { name: string, type: string, uri: string, fileName: string, mimeType: string }) => Promise<void>;
  startPatrol: (patrolId?: string) => Promise<any>;
  ensurePatrolsForDate: (targetDate?: string | Date) => Promise<void>;
  loadPatrolCheckpoints: (patrolId: string) => Promise<void>;
  scanCheckpointCode: (code: string, targetPatrolId?: string) => Promise<{ success: boolean; message: string }>;
  checkInLoneWorker: (customParams?: {
    latitude?: number;
    longitude?: number;
    distanceMeters?: number;
    gpsStatus?: string;
    status?: string;
  }) => void;
  openLoneWorkerModal: () => void;
  closeLoneWorkerModal: () => void;
  triggerSafetyCheckDue: () => void;
  sendMessage: (type: 'site' | 'direct', conversationId: string, receiverId: string | null, messageText: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

export const useGuardStore = create<GuardState>((set, get) => ({
  guardId: null,
  guardEmail: null,
  guardName: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  address: '',
  profilePic: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  companyName: 'Priority One Security',
  assignedSite: 'Unassigned Site',
  assignedSiteId: '',
  supervisor: 'No Supervisor',
  supervisorPhone: '',
  attendanceStatus: 'Not Checked In',
  clockInTimestamp: null,
  activeClockInTimestamp: null,
  clockOutTimestamp: null,
  todayCompletedMs: 0,
  isClockedIn: false,
  isClockedOut: false,
  isInitialized: false,

  leaves: [],
  leaveBalances: { annual: 12, sick: 5, casual: 3 },
  incidents: [],
  attendanceHistory: [],
  documents: [
    {
      id: 'doc-temp-1',
      employeeId: 'emp-1',
      name: 'PSARA Security Guard License',
      type: 'Licensing & Registration',
      status: 'Approved',
      uploadedAt: '2026-08-10',
      uri: '',
      fileName: 'psara_guard_license_2026.pdf',
      mimeType: 'application/pdf',
    },
    {
      id: 'doc-temp-2',
      employeeId: 'emp-1',
      name: 'Government ID',
      type: 'Government ID',
      status: 'Approved',
      uploadedAt: '2026-08-12',
      uri: '',
      fileName: 'gov_id.pdf',
      mimeType: 'application/pdf',
    },
    {
      id: 'doc-temp-3',
      employeeId: 'emp-1',
      name: 'Police Clearance Certificate',
      type: 'Background Check',
      status: 'Pending HR Approval',
      uploadedAt: '2026-08-20',
      uri: '',
      fileName: 'police_clearance_record.pdf',
      mimeType: 'application/pdf',
    },
  ],
  notifications: defaultSupervisorApprovals,
  activities: defaultInitialActivities,
  shifts: [],
  todayShift: null,
  patrols: [],
  activePatrol: null,
  patrolCheckpoints: [],
  patrolCheckpointsMap: {},
  messages: [],

  loneWorker: {
    status: 'NOT ACTIVE',
    lastCheckIn: null,
    lastCheckInTimestamp: null,
    nextCheckRequired: null,
    nextCheckTimestamp: null,
    isModalOpen: false,
  },
  loneWorkerHistory: [],

  loadGuardData: async (guardId, email) => {
    try {
      // Resolve employee details
      const employees = await getTable<DBEmployee>('employees');
      const emp = employees.find(e => e.id === guardId || e.email === email);

      // Resolve shifts
      const allShifts = await getTable<DBShift>('shifts');
      const guardShifts = allShifts.filter(s => s.guardId === guardId || s.guard === emp?.name);

      // Resolve attendance history
      const allAtt = await getTable<DBAttendance>('attendance');
      const guardAtt = allAtt.filter(a => a.employeeId === guardId || a.employeeEmail === email);

      // Resolve patrols
      let allPatrols = await getTable<DBPatrol>('patrols');

      const nowDate = new Date();
      const nYyyy = nowDate.getFullYear();
      const nMm = String(nowDate.getMonth() + 1).padStart(2, '0');
      const nDd = String(nowDate.getDate()).padStart(2, '0');
      const todayKey = `${nYyyy}-${nMm}-${nDd}`;
      const todayDisplay = formatDisplayDate(todayKey);
      const todayStartMs = new Date().setHours(0, 0, 0, 0);

      // Clean up past date patrol statuses (mark uncompleted past date patrols as Missed)
      let needsPatrolSave = false;
      allPatrols = allPatrols.map(p => {
        const pDisp = formatDisplayDate(p.date);
        const isToday = pDisp.toLowerCase() === todayDisplay.toLowerCase() || p.date === todayKey;
        let pTs = 0;
        try {
          pTs = new Date(p.date).getTime();
        } catch {
          pTs = 0;
        }

        if (!isToday && pTs < todayStartMs && p.status !== 'Completed' && p.status !== 'completed' && p.status !== 'Missed' && p.status !== 'missed') {
          needsPatrolSave = true;
          return { ...p, status: (p.scanned || 0) > 0 ? 'Completed' : 'Missed' };
        }
        return p;
      });

      // Auto-ensure patrol entries for current date if missing
      const hasTodayPatrols = allPatrols.some(p => {
        const pDisp = formatDisplayDate(p.date);
        return pDisp.toLowerCase() === todayDisplay.toLowerCase() || p.date === todayKey;
      });

      if (!hasTodayPatrols || (allPatrols.filter((p: DBPatrol) => formatDisplayDate(p.date) === formatDisplayDate(todayKey)).length < 5)) {
        const dateCode = `${nYyyy}${nMm}${nDd}`;
        const empName = emp?.name || 'John Smith';
        const siteName = emp?.site || 'Ahmedabad Plant';

        const todayDefaultPatrols: DBPatrol[] = [
          {
            id: `patrol-${todayKey}-1400`,
            patrolCode: `PT-${dateCode}-01`,
            title: 'Early Afternoon Facility Patrol',
            companyId: 'c-1',
            site: siteName,
            siteId: emp?.siteId || 's-01',
            route: 'Main Entrance & Lobby Route',
            guard: empName,
            guardId: guardId || 'G-1001',
            date: todayKey,
            startTime: '02:00 PM',
            scheduledStartTime: '02:00 PM',
            scheduledEndTime: '03:00 PM',
            startBufferMinutes: 15,
            status: 'Scheduled',
            checkpoints: 5,
            scanned: 0,
            missed: 0,
            incidents: 0,
            lastCheckpoint: 'Pending Start',
          },
          {
            id: `patrol-${todayKey}-1600`,
            patrolCode: `PT-${dateCode}-02`,
            title: 'Late Afternoon Dock Patrol',
            companyId: 'c-1',
            site: siteName,
            siteId: emp?.siteId || 's-01',
            route: 'Loading Dock & Bay Route',
            guard: empName,
            guardId: guardId || 'G-1001',
            date: todayKey,
            startTime: '04:00 PM',
            scheduledStartTime: '04:00 PM',
            scheduledEndTime: '05:00 PM',
            startBufferMinutes: 15,
            status: 'Scheduled',
            checkpoints: 5,
            scanned: 0,
            missed: 0,
            incidents: 0,
            lastCheckpoint: 'Pending Start',
          },
          {
            id: `patrol-${todayKey}-1800`,
            patrolCode: `PT-${dateCode}-03`,
            title: 'Early Evening Shift Change Patrol',
            companyId: 'c-1',
            site: siteName,
            siteId: emp?.siteId || 's-01',
            route: 'Perimeter Gate A & Fence Route',
            guard: empName,
            guardId: guardId || 'G-1001',
            date: todayKey,
            startTime: '06:00 PM',
            scheduledStartTime: '06:00 PM',
            scheduledEndTime: '07:00 PM',
            startBufferMinutes: 15,
            status: 'Scheduled',
            checkpoints: 5,
            scanned: 0,
            missed: 0,
            incidents: 0,
            lastCheckpoint: 'Pending Start',
          },
          {
            id: `patrol-${todayKey}-2000`,
            patrolCode: `PT-${dateCode}-04`,
            title: 'Night Main Perimeter Patrol',
            companyId: 'c-1',
            site: siteName,
            siteId: emp?.siteId || 's-01',
            route: 'Night Perimeter & Gate B Route',
            guard: empName,
            guardId: guardId || 'G-1001',
            date: todayKey,
            startTime: '08:00 PM',
            scheduledStartTime: '08:00 PM',
            scheduledEndTime: '09:00 PM',
            startBufferMinutes: 15,
            status: 'Scheduled',
            checkpoints: 5,
            scanned: 0,
            missed: 0,
            incidents: 0,
            lastCheckpoint: 'Pending Start',
          },
          {
            id: `patrol-${todayKey}-2200`,
            patrolCode: `PT-${dateCode}-05`,
            title: 'Late Night Security Patrol',
            companyId: 'c-1',
            site: siteName,
            siteId: emp?.siteId || 's-01',
            route: 'Critical Assets & Server Room Route',
            guard: empName,
            guardId: guardId || 'G-1001',
            date: todayKey,
            startTime: '10:00 PM',
            scheduledStartTime: '10:00 PM',
            scheduledEndTime: '11:00 PM',
            startBufferMinutes: 15,
            status: 'Scheduled',
            checkpoints: 5,
            scanned: 0,
            missed: 0,
            incidents: 0,
            lastCheckpoint: 'Pending Start',
          },
        ];
        for (const tp of todayDefaultPatrols) {
          if (!allPatrols.some(p => p.id === tp.id)) {
            allPatrols.push(tp);
          }
        }
        needsPatrolSave = true;
      }

      if (needsPatrolSave) {
        await saveTable('patrols', allPatrols);
      }

      const guardPatrols = allPatrols.filter(p => p.guardId === guardId || p.guard === emp?.name || p.guardId === 'G-1001' || p.guardId === 'guard-1');

      // Resolve leaves
      let allLeaves = await getTable<DBLeave>('leaves');

      const defaultMockDBLeaves: DBLeave[] = [
        {
          id: 'mock-leave-pending-1',
          employeeId: guardId,
          employeeName: emp?.name || 'Khushi Rani',
          employeeEmail: email || '',
          role: 'guard',
          type: 'Sick Leave',
          startDate: '2026-08-09',
          endDate: '2026-08-10',
          days: 2,
          reason: 'busy',
          status: 'pending',
          appliedOn: '2026-08-04',
          companyId: 'c-1',
        },
        {
          id: 'mock-leave-12',
          employeeId: guardId,
          employeeName: emp?.name || 'Khushi Rani',
          employeeEmail: email || '',
          role: 'guard',
          type: 'Annual Leave',
          startDate: '2026-08-12',
          endDate: '2026-08-12',
          days: 1,
          reason: 'Personal',
          status: 'approved',
          appliedOn: '2026-08-01',
          companyId: 'c-1',
        },
        {
          id: 'mock-leave-18-half',
          employeeId: guardId,
          employeeName: emp?.name || 'Khushi Rani',
          employeeEmail: email || '',
          role: 'guard',
          type: 'Casual Leave (Half Day)',
          startDate: '2026-08-18',
          endDate: '2026-08-18',
          days: 0.5,
          reason: 'Personal (Half Day)',
          status: 'approved',
          appliedOn: '2026-08-15',
          companyId: 'c-1',
        },
        {
          id: 'mock-leave-20',
          employeeId: guardId,
          employeeName: emp?.name || 'Khushi Rani',
          employeeEmail: email || '',
          role: 'guard',
          type: 'Sick Leave',
          startDate: '2026-08-20',
          endDate: '2026-08-20',
          days: 1,
          reason: 'Medical',
          status: 'approved',
          appliedOn: '2026-08-15',
          companyId: 'c-1',
        },
      ];

      let seededAny = false;
      for (const mockL of defaultMockDBLeaves) {
        if (!allLeaves.some(l => l.id === mockL.id)) {
          allLeaves.push(mockL);
          seededAny = true;
        }
      }
      if (seededAny) {
        await saveTable('leaves', allLeaves);
      }

      const guardLeaves = allLeaves.filter(l => l.employeeId === guardId || l.employeeEmail === email);

      // Resolve incidents
      const allIncidents = await getTable<DBIncident>('incidents');
      const guardIncidents = allIncidents.filter(i => i.reportedById === guardId || i.reportedBy === emp?.name);

      // Resolve documents
      const allDocs = await getTable<DBEmployeeDocument>('employeeDocuments');
      const guardDocs = allDocs.filter(d => d.employeeId === guardId);

      // Resolve messages
      const allMessages = await getTable<DBMessage>('messages');
      const guardMessages = allMessages.filter(msg => {
        if (msg.type === 'site') {
          return msg.siteId === emp?.siteId;
        } else {
          return msg.senderId === guardId || msg.receiverId === guardId;
        }
      });

      // Resolve notifications from AsyncStorage/DB
      const allNotifs = await getTable<any>('notifications');
      const guardNotifs = allNotifs.filter((n: any) => n.userId === guardId);

      const safeFormatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '';
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return dateStr;
          const day = String(d.getDate()).padStart(2, '0');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
        } catch {
          return dateStr;
        }
      };

      const safeFormatTime = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '';
        try {
          const d = new Date(dateStr);
          if (isNaN(d.getTime())) return dateStr;
          let hours = d.getHours();
          const minutes = String(d.getMinutes()).padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
        } catch {
          return dateStr;
        }
      };

      const mappedNotifs: AppNotification[] = guardNotifs.map((n: any) => ({
        id: n.id,
        type: n.type || 'System',
        title: n.title,
        description: n.message || n.description,
        date: safeFormatDate(n.createdAt),
        time: safeFormatTime(n.createdAt),
        isRead: n.read || false,
        priority: n.priority || 'Medium',
      }));

      // Check current attendance state
      const now = new Date();
      const todayYear = now.getFullYear();
      const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
      const todayDay = String(now.getDate()).padStart(2, '0');
      const todayLocalStr = `${todayYear}-${todayMonth}-${todayDay}`;
      const todayIsoStr = now.toISOString().split('T')[0];

      const isSameDate = (d1Str: string | null | undefined, d2Str: string): boolean => {
        if (!d1Str) return false;
        if (d1Str === d2Str) return true;
        try {
          const d1 = new Date(d1Str);
          if (isNaN(d1.getTime())) return false;
          const y = d1.getFullYear();
          const m = String(d1.getMonth() + 1).padStart(2, '0');
          const d = String(d1.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}` === d2Str;
        } catch {
          return false;
        }
      };

      const isCompletedClockOut = (clockOut: string | null | undefined): boolean => {
        if (!clockOut) return false;
        const s = String(clockOut).trim().toLowerCase();
        return s !== '' && s !== '—' && s !== 'null' && s !== 'undefined' && s !== 'ongoing';
      };

      const safeParseMs = (str: string | null | undefined, dateContextStr?: string): number | null => {
        if (!str) return null;
        
        // Check if full date-time string with valid year (> 2000)
        const d = new Date(str);
        if (!isNaN(d.getTime()) && d.getFullYear() > 2000) {
          return d.getTime();
        }

        // If time-only string like "06:55 AM" or "2:24 PM", combine with dateContextStr
        if (dateContextStr) {
          const combined = new Date(`${dateContextStr} ${str}`);
          if (!isNaN(combined.getTime()) && combined.getFullYear() > 2000) {
            return combined.getTime();
          }
        }

        const n = Number(str);
        if (!isNaN(n) && n > 1500000000000) return n;

        return null;
      };

      // 1. Filter guard's attendance records STRICTLY FOR TODAY ONLY
      const todayGuardRecords = guardAtt.filter(a =>
        isSameDate(a.date, todayLocalStr) || isSameDate(a.clockIn, todayLocalStr)
      );

      todayGuardRecords.sort((a, b) => {
        const aTime = safeParseMs(a.clockIn, a.date) || 0;
        const bTime = safeParseMs(b.clockIn, a.date) || 0;
        return aTime - bTime;
      });

      // 2. Find open clock-in record STRICTLY FOR TODAY ONLY
      const openRecord = todayGuardRecords.slice().reverse().find(a =>
        a.clockIn && !isCompletedClockOut(a.clockOut)
      );

      // 3. Calculate sum of completed session durations STRICTLY FOR TODAY ONLY
      const todayCompletedMs = todayGuardRecords
        .filter(a => a.clockIn && isCompletedClockOut(a.clockOut))
        .reduce((sum, a) => {
          const inMs = safeParseMs(a.clockIn, a.date) || 0;
          const outMs = safeParseMs(a.clockOut, a.date) || 0;
          const dur = Math.max(0, outMs - inMs);
          return sum + dur;
        }, 0);

      const firstRecordToday = todayGuardRecords[0] || null;
      const firstClockInTime = firstRecordToday ? safeParseMs(firstRecordToday.clockIn, firstRecordToday.date) : null;

      const completedTodayRecords = todayGuardRecords.filter(a =>
        a.clockIn && isCompletedClockOut(a.clockOut)
      );
      const latestCompletedRecord = completedTodayRecords.length > 0
        ? completedTodayRecords[completedTodayRecords.length - 1]
        : null;

      let attStatus: AttendanceStatus = 'Not Checked In';
      let clockInTime: number | null = null;
      let activeClockInTime: number | null = null;
      let clockOutTime: number | null = null;

      const formatTime12h = (timestamp: number | null): string => {
        if (!timestamp) return '--:--';
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return '--:--';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };

      if (openRecord && openRecord.clockIn) {
        attStatus = 'Checked In';
        clockInTime = firstClockInTime || safeParseMs(openRecord.clockIn, openRecord.date);
        activeClockInTime = safeParseMs(openRecord.clockIn, openRecord.date) || firstClockInTime;
        clockOutTime = null;
      } else if (latestCompletedRecord && latestCompletedRecord.clockIn && latestCompletedRecord.clockOut) {
        attStatus = 'Checked Out';
        clockInTime = firstClockInTime || safeParseMs(latestCompletedRecord.clockIn, latestCompletedRecord.date);
        activeClockInTime = null;
        clockOutTime = safeParseMs(latestCompletedRecord.clockOut, latestCompletedRecord.date);
      } else {
        attStatus = 'Not Checked In';
        clockInTime = null;
        activeClockInTime = null;
        clockOutTime = null;
      }

      // Restore Lone Worker State from AsyncStorage
      const rawLw = await AsyncStorage.getItem(`@lone_worker_state_${guardId}`);
      let currentLoneWorker: LoneWorkerState = {
        status: attStatus === 'Checked In' ? 'SAFE' : 'NOT ACTIVE',
        lastCheckIn: clockInTime ? formatTime12h(clockInTime) : null,
        lastCheckInTimestamp: clockInTime,
        nextCheckRequired: clockInTime ? formatTime12h(clockInTime + 30 * 60 * 1000) : null,
        nextCheckTimestamp: clockInTime ? clockInTime + 30 * 60 * 1000 : null,
        isModalOpen: false,
      };

      if (rawLw && attStatus === 'Checked In') {
        try {
          const parsed = JSON.parse(rawLw);
          currentLoneWorker = {
            ...currentLoneWorker,
            ...parsed,
            isModalOpen: false, // reset modal open state on fresh hydration
          };
          if (!currentLoneWorker.nextCheckTimestamp && currentLoneWorker.lastCheckInTimestamp) {
            currentLoneWorker.nextCheckTimestamp = currentLoneWorker.lastCheckInTimestamp + 30 * 60 * 1000;
            currentLoneWorker.nextCheckRequired = formatTime12h(currentLoneWorker.nextCheckTimestamp);
          }
        } catch (e) {
          // ignore
        }
      }

      // Supervisor info
      let supervisorName = emp?.supervisor || 'Jane Smith';
      let supervisorPhone = '+1 415 555 0187';
      if (emp?.supervisorId) {
        const supervisorMatch = employees.find(e => e.id === emp.supervisorId);
        if (supervisorMatch) {
          supervisorName = supervisorMatch.name;
          supervisorPhone = supervisorMatch.phone;
        }
      } const parsePatrolScheduleMs = (p: DBPatrol): number => {
        try {
          if (p.scheduledStartTimeIso) return new Date(p.scheduledStartTimeIso).getTime();
          const dStr = p.date || new Date().toISOString().split('T')[0];
          const timeStr = p.scheduledStartTime || p.startTime || '08:00 AM';
          const d = new Date(`${dStr} ${timeStr}`);
          if (!isNaN(d.getTime())) return d.getTime();
          return new Date(dStr).getTime();
        } catch {
          return 0;
        }
      };

      // Filter today's patrols first for active patrol resolution
      const todayPatrols = guardPatrols.filter(p => {
        const pDisp = formatDisplayDate(p.date);
        return pDisp.toLowerCase() === todayDisplay.toLowerCase() || p.date === todayKey;
      });

      const todayInProgress = todayPatrols.find(p => p.status === 'in_progress' || p.status === 'In Progress');
      const todayScheduled = todayPatrols.find(p => p.status !== 'Completed' && p.status !== 'completed' && p.status !== 'Missed' && p.status !== 'missed');
      const todayLatest = todayPatrols[0];

      const upcomingGuardPatrols = guardPatrols
        .filter(p => p.status !== 'Completed' && p.status !== 'completed' && p.status !== 'Missed' && p.status !== 'missed')
        .sort((a, b) => parsePatrolScheduleMs(a) - parsePatrolScheduleMs(b));

      let activePat = todayInProgress
        || todayScheduled
        || todayLatest
        || upcomingGuardPatrols[0]
        || guardPatrols[0]
        || null;

      // Load active checkpoints for this exact patrol
      let activeCPs: CheckpointData[] = [];
      if (activePat && activePat.id) {
        const cpsRaw = await AsyncStorage.getItem(`p1_db_patrol_checkpoints_${activePat.id}`);
        if (cpsRaw) {
          try {
            activeCPs = JSON.parse(cpsRaw);
          } catch (e) {
            activeCPs = [];
          }
        }

        if (!activeCPs || activeCPs.length === 0) {
          // Initialize default checkpoints for assigned site
          activeCPs = [
            { id: '1', name: 'Main Gate', number: 'CP-01', location: 'Entrance', scheduledTime: '09:15 AM', status: 'Pending', qrCode: 'CP-01' },
            { id: '2', name: 'Reception Lobby', number: 'CP-02', location: 'Tower A', scheduledTime: '09:30 AM', status: 'Pending', qrCode: 'CP-02' },
            { id: '3', name: 'Parking Level 1', number: 'CP-03', location: 'Basement', scheduledTime: '09:45 AM', status: 'Pending', qrCode: 'CP-03' },
            { id: '4', name: 'Server Room', number: 'CP-04', location: 'Tower B', scheduledTime: '10:00 AM', status: 'Pending', qrCode: 'CP-04' },
            { id: '5', name: 'Emergency Exit', number: 'CP-05', location: 'Rear Gate', scheduledTime: '10:15 AM', status: 'Pending', qrCode: 'CP-05' },
          ];
          await AsyncStorage.setItem(`p1_db_patrol_checkpoints_${activePat.id}`, JSON.stringify(activeCPs));
        }

        // Recalculate scanned count from activeCPs to guarantee mathematical 100% sync
        const actualCompleted = activeCPs.filter(c => c.status === 'Completed').length;
        const actualTotal = activeCPs.length;
        activePat = {
          ...activePat,
          scanned: actualCompleted,
          checkpoints: actualTotal,
          status: (actualCompleted >= actualTotal && actualTotal > 0) ? 'Completed' : (activePat.status || 'in_progress'),
        };
      }

      // Find today's shift
      const todayShift = guardShifts.find(s => s.date === todayLocalStr || s.date === todayIsoStr) || guardShifts[0] || null;

      // Map lists to internal UI interfaces
      const mappedLeaves: LeaveRequest[] = guardLeaves.map(l => ({
        id: l.id,
        type: l.type,
        fromDate: l.startDate,
        toDate: l.endDate,
        days: l.days,
        reason: l.reason,
        status: l.status.charAt(0).toUpperCase() + l.status.slice(1),
        appliedDate: l.appliedOn,
      }));

      const mappedIncidents: IncidentReport[] = guardIncidents.map(i => ({
        id: i.id,
        type: i.title,
        title: i.title,
        description: i.details,
        location: i.site,
        severity: i.severity.charAt(0).toUpperCase() + i.severity.slice(1),
        status: i.status === 'under_review' ? 'Under Review' : i.status.charAt(0).toUpperCase() + i.status.slice(1),
        reportedDate: i.createdAt || i.date,
      }));

      const mappedHistory: AttendanceRecord[] = guardAtt.map(a => {
        let workingHoursNum = 0;
        if (a.clockIn && a.clockOut) {
          const inT = a.clockIn.includes('Z') || a.clockIn.includes('T') ? new Date(a.clockIn).getTime() : 0;
          const outT = a.clockOut.includes('Z') || a.clockOut.includes('T') ? new Date(a.clockOut).getTime() : 0;
          workingHoursNum = inT && outT ? (outT - inT) / (1000 * 3600) : parseFloat(a.workingHours || '0');
        }
        return {
          id: a.id,
          date: a.date,
          day: new Date(a.date).toLocaleDateString('en-US', { weekday: 'long' }),
          siteName: a.siteName || emp?.site || 'Main Site',
          shiftName: a.shift || 'Day Shift',
          clockIn: a.clockIn,
          clockOut: a.clockOut,
          workingHours: workingHoursNum,
          status: a.status.charAt(0).toUpperCase() + a.status.slice(1),
          notes: a.exceptionReason || '',
        };
      });

      if (!mappedLeaves.some(l => l.fromDate === '2026-08-12')) {
        mappedLeaves.push({
          id: 'mock-leave-12',
          type: 'Annual Leave',
          fromDate: '2026-08-12',
          toDate: '2026-08-12',
          days: 1,
          reason: 'Personal',
          status: 'Approved',
          appliedDate: '2026-08-01',
        });
      }
      if (!mappedLeaves.some(l => l.fromDate === '2026-08-20')) {
        mappedLeaves.push({
          id: 'mock-leave-20',
          type: 'Sick Leave',
          fromDate: '2026-08-20',
          toDate: '2026-08-20',
          days: 1,
          reason: 'Medical',
          status: 'Approved',
          appliedDate: '2026-08-15',
        });
      }

      // Load leave balances
      const leaveBalances = await getLeaveBalances(guardId);

      let guardLoneWorkerHistory: LoneWorkerHistoryItem[] = [];
      if (guardId) {
        try {
          const rawLwHistory = await AsyncStorage.getItem(`@lone_worker_history_${guardId}`);
          if (rawLwHistory) {
            guardLoneWorkerHistory = JSON.parse(rawLwHistory);
          }
        } catch { }
      }

      let loadedActivities: ActivityItem[] = defaultInitialActivities;
      if (guardId) {
        try {
          const rawActivities = await AsyncStorage.getItem(`@guard_activities_${guardId}`);
          if (rawActivities) {
            const parsed = JSON.parse(rawActivities);
            if (Array.isArray(parsed) && parsed.length > 0) {
              loadedActivities = parsed;
            }
          }
        } catch {}
      }

      // Merge supervisor approvals into notifications
      const combinedNotifs = [...mappedNotifs];
      defaultSupervisorApprovals.forEach(supNotif => {
        if (!combinedNotifs.some(n => n.id === supNotif.id || n.title === supNotif.title)) {
          combinedNotifs.push(supNotif);
        }
      });

      set({
        guardId,
        guardEmail: email,
        guardName: emp?.name || 'Security Officer',
        phone: emp?.phone || '+1 415 555 0101',
        dateOfBirth: emp?.dateOfBirth || 'Oct 12, 1990',
        gender: emp?.gender || 'Male',
        bloodGroup: emp?.bloodGroup || 'O+',
        address: emp?.address || '123 Main St, Springfield, IL',
        profilePic: emp?.profilePic || 'https://i.pravatar.cc/150?img=11',
        emergencyContactName: emp?.emergencyContactName || 'Sarah Smith',
        emergencyContactPhone: emp?.emergencyContactPhone || '+1 555 0199',
        emergencyContactRelation: emp?.emergencyContactRelation || 'Spouse',
        companyName: 'Priority One Security',
        assignedSite: emp?.site || 'Assigned Site',
        assignedSiteId: emp?.siteId || '',
        supervisor: supervisorName,
        supervisorPhone,
        attendanceStatus: attStatus,
        clockInTimestamp: clockInTime,
        activeClockInTimestamp: activeClockInTime,
        clockOutTimestamp: clockOutTime,
        todayCompletedMs,
        isClockedIn: attStatus === 'Checked In',
        isClockedOut: attStatus === 'Checked Out',
        leaves: mappedLeaves,
        leaveBalances,
        incidents: mappedIncidents,
        attendanceHistory: mappedHistory,
        documents: guardDocs,
        shifts: guardShifts,
        todayShift,
        patrols: guardPatrols,
        activePatrol: activePat,
        patrolCheckpoints: activeCPs,
        patrolCheckpointsMap: activePat?.id ? {
          ...(get().patrolCheckpointsMap || {}),
          [activePat.id]: activeCPs,
        } : (get().patrolCheckpointsMap || {}),
        notifications: combinedNotifs,
        activities: loadedActivities,
        messages: guardMessages,
        loneWorker: currentLoneWorker,
        loneWorkerHistory: guardLoneWorkerHistory,
        isInitialized: true,
      });
      LoggerService.log(`[GuardStore] Hydration completed successfully for ${guardId}`);
    } catch (error: any) {
      LoggerService.log(`[GuardStore] Hydration failed: ${error?.message || error}`, 'error');
      console.error('Error loading guard data in store:', error);
      set({ isInitialized: true });
    }
  },

  addActivity: async (act) => {
    const { guardId, activities } = get();
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateStr = act.date || `${day} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const timeStr = act.time || now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: act.type || 'System',
      title: act.title,
      description: act.description,
      date: dateStr,
      time: timeStr,
      timestamp: Date.now(),
    };

    const updated = [newActivity, ...activities];
    set({ activities: updated });
    if (guardId) {
      try {
        await AsyncStorage.setItem(`@guard_activities_${guardId}`, JSON.stringify(updated));
      } catch (e) {}
    }
  },

  clearActivities: async () => {
    const { guardId } = get();
    set({ activities: [] });
    if (guardId) {
      try {
        await AsyncStorage.removeItem(`@guard_activities_${guardId}`);
      } catch (e) {}
    }
  },

  clockIn: async () => {
    try {
      const { guardId, guardEmail, guardName, assignedSite, assignedSiteId } = get();
      if (!guardId) {
        LoggerService.log('[useGuardStore] clockIn failed: guardId is null', 'warn');
        throw new Error('Cannot clock in: current guard identity has not been initialized.');
      }

      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();
      const todayYear = new Date(nowMs).getFullYear();
      const todayMonth = String(new Date(nowMs).getMonth() + 1).padStart(2, '0');
      const todayDay = String(new Date(nowMs).getDate()).padStart(2, '0');
      const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

      const currentAtt = await getTable<DBAttendance>('attendance');
      const openRecord = currentAtt.slice().reverse().find(a =>
        a.employeeId === guardId &&
        a.clockIn &&
        (!a.clockOut || a.clockOut === '' || a.clockOut === '—')
      );

      if (openRecord) {
        LoggerService.log(`[useGuardStore] Active clock-in session already exists (${openRecord.id}). Restoring session without duplicate creation.`);
        const parsedIn = (openRecord.clockIn ? new Date(openRecord.clockIn).getTime() : 0) || nowMs;
        set({
          attendanceStatus: 'Checked In',
          clockInTimestamp: parsedIn,
          clockOutTimestamp: null,
          isClockedIn: true,
          isClockedOut: false,
        });
        await get().loadGuardData(guardId, guardEmail || '');
        return;
      }

      const newRecord: DBAttendance = {
        id: `att-${nowMs}`,
        employeeId: guardId,
        employeeName: guardName,
        employeeEmail: guardEmail || '',
        badge: `GRD-${guardId.slice(-3).toUpperCase()}`,
        role: 'guard',
        date: todayStr,
        shift: 'Morning Shift 08:00 AM - 04:00 PM',
        clockIn: nowIso,
        clockOut: null,
        status: 'present',
        siteId: assignedSiteId,
        siteName: assignedSite,
        companyId: 'c-1',
      };

      await insertRow('attendance', newRecord);

      const clockInTimeStr = new Date(nowMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await get().addActivity({
        type: 'Attendance',
        title: 'Clocked In Successfully',
        description: `You clocked in at ${clockInTimeStr} at ${assignedSite}.`,
      });

      const formatTime12h = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const nextMs = nowMs + 30 * 60 * 1000;
      const lwState: LoneWorkerState = {
        status: 'SAFE',
        lastCheckIn: formatTime12h(nowMs),
        lastCheckInTimestamp: nowMs,
        nextCheckRequired: formatTime12h(nextMs),
        nextCheckTimestamp: nextMs,
        isModalOpen: false,
      };

      await AsyncStorage.setItem(`@lone_worker_state_${guardId}`, JSON.stringify(lwState));

      const firstIn = get().clockInTimestamp || nowMs;
      set({
        attendanceStatus: 'Checked In',
        clockInTimestamp: firstIn,
        activeClockInTimestamp: nowMs,
        clockOutTimestamp: null,
        isClockedIn: true,
        isClockedOut: false,
        loneWorker: lwState,
      });

      await get().loadGuardData(guardId, guardEmail || '');
      LoggerService.log(`[useGuardStore] clockIn completed successfully for ${guardId}`);
    } catch (error: any) {
      LoggerService.log(`[useGuardStore] clockIn error: ${error?.message || error}`, 'error');
      throw error;
    }
  },

  clockOut: async () => {
    try {
      const { guardId, guardEmail, assignedSite, clockInTimestamp } = get();
      if (!guardId) {
        LoggerService.log('[useGuardStore] clockOut failed: guardId is null', 'warn');
        throw new Error('Cannot clock out: current guard identity has not been initialized.');
      }

      const nowMs = Date.now();
      const nowStr = new Date(nowMs).toISOString();
      const currentAtt = await getTable<DBAttendance>('attendance');

      const openRecord = currentAtt.slice().reverse().find(a =>
        a.employeeId === guardId &&
        a.clockIn &&
        (!a.clockOut || a.clockOut === '' || a.clockOut === '—')
      );

      if (openRecord) {
        const inT = (openRecord.clockIn ? new Date(openRecord.clockIn).getTime() : 0) || clockInTimestamp || nowMs;
        const outT = nowMs;
        const diffMs = Math.max(0, outT - inT);
        const hrs = (diffMs / (3600 * 1000)).toFixed(2);
        const diffHrs = `${hrs} hrs`;

        await updateRow<DBAttendance>('attendance', openRecord.id, {
          clockOut: nowStr,
          workingHours: diffHrs,
        });

        const clockOutTimeStr = new Date(nowStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await get().addActivity({
          type: 'Attendance',
          title: 'Clocked Out Successfully',
          description: `You clocked out at ${clockOutTimeStr}. Total: ${diffHrs}.`,
        });
        LoggerService.log(`[useGuardStore] clockOut update complete for record ${openRecord.id}`);
      }

      soundAlertService.stopSafetyAlert();

      const lwState: LoneWorkerState = {
        status: 'NOT ACTIVE',
        lastCheckIn: null,
        lastCheckInTimestamp: null,
        nextCheckRequired: null,
        nextCheckTimestamp: null,
        isModalOpen: false,
      };

      await AsyncStorage.setItem(`@lone_worker_state_${guardId}`, JSON.stringify(lwState));

      set({
        attendanceStatus: 'Checked Out',
        clockOutTimestamp: nowMs,
        isClockedIn: false,
        isClockedOut: true,
        loneWorker: lwState,
      });

      await get().loadGuardData(guardId, guardEmail || '');
      LoggerService.log(`[useGuardStore] clockOut completed successfully for ${guardId}`);
    } catch (error: any) {
      LoggerService.log(`[useGuardStore] clockOut error: ${error?.message || error}`, 'error');
      throw error;
    }
  },

  applyLeave: async (leave) => {
    const { guardId, guardEmail, guardName, leaveBalances } = get();
    if (!guardId) return;

    const newLeave: DBLeave = {
      id: `lv-${Date.now()}`,
      employeeId: guardId,
      employeeName: guardName,
      employeeEmail: guardEmail || '',
      role: 'guard',
      type: leave.type,
      startDate: leave.fromDate,
      endDate: leave.toDate,
      days: leave.days,
      reason: leave.reason,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0],
      companyId: 'c-1',
    };

    await insertRow('leaves', newLeave);

    // Subtract from balances
    const leaveTypeKey = leave.type.toLowerCase().includes('annual') ? 'annual' :
      leave.type.toLowerCase().includes('sick') ? 'sick' : 'casual';

    const updatedBalances = { ...leaveBalances };
    updatedBalances[leaveTypeKey] = Math.max(0, updatedBalances[leaveTypeKey] - leave.days);
    await saveLeaveBalances(guardId, updatedBalances);

    // Create Notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: guardId,
      title: 'Leave Request Submitted',
      message: `Your ${leave.type} request for ${leave.days} day(s) is pending approval.`,
      read: false,
      createdAt: new Date().toISOString()
    };
    await insertRow('notifications', newNotif);

    await get().loadGuardData(guardId, guardEmail || '');
  },

  updateLeave: async (leaveId, leave) => {
    const { guardId, guardEmail, leaves, leaveBalances } = get();
    if (!guardId) return;

    const existingLeave = leaves.find(l => l.id === leaveId);
    if (!existingLeave) return;

    const oldDays = existingLeave.days || 0;
    const newDays = leave.days || 0;

    const oldTypeKey = (existingLeave.type.toLowerCase().includes('annual') ? 'annual' :
      existingLeave.type.toLowerCase().includes('sick') ? 'sick' : 'casual') as keyof DBLeaveBalances;
    const newTypeKey = (leave.type.toLowerCase().includes('annual') ? 'annual' :
      leave.type.toLowerCase().includes('sick') ? 'sick' : 'casual') as keyof DBLeaveBalances;

    const updatedBalances = { ...leaveBalances };

    // Restore old days first
    if (oldTypeKey in updatedBalances) {
      updatedBalances[oldTypeKey] = (updatedBalances[oldTypeKey] || 0) + oldDays;
    }
    // Deduct new days
    if (newTypeKey in updatedBalances) {
      updatedBalances[newTypeKey] = Math.max(0, (updatedBalances[newTypeKey] || 0) - newDays);
    }

    await saveLeaveBalances(guardId, updatedBalances);

    // Update leave DB record in AsyncStorage
    await updateRow<DBLeave>('leaves', leaveId, {
      type: leave.type,
      startDate: leave.fromDate,
      endDate: leave.toDate,
      days: leave.days,
      reason: leave.reason,
    });

    await get().loadGuardData(guardId, guardEmail || '');
  },

  cancelLeave: async (leaveId) => {
    const { guardId, guardEmail, leaves, leaveBalances } = get();
    if (!guardId) return;

    const existingLeave = leaves.find(l => l.id === leaveId);
    if (!existingLeave) return;

    const leaveDays = existingLeave.days || 0;
    const leaveTypeKey = (existingLeave.type.toLowerCase().includes('annual') ? 'annual' :
      existingLeave.type.toLowerCase().includes('sick') ? 'sick' : 'casual') as keyof DBLeaveBalances;

    const updatedBalances = { ...leaveBalances };
    if (leaveTypeKey in updatedBalances) {
      updatedBalances[leaveTypeKey] = (updatedBalances[leaveTypeKey] || 0) + leaveDays;
      await saveLeaveBalances(guardId, updatedBalances);
    }

    // Update status to 'cancelled' in DB
    await updateRow<DBLeave>('leaves', leaveId, {
      status: 'cancelled',
    });

    // Create notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: guardId,
      title: 'Leave Application Cancelled',
      message: `Your ${existingLeave.type} request for ${existingLeave.fromDate} has been cancelled.`,
      read: false,
      createdAt: new Date().toISOString()
    };
    await insertRow('notifications', newNotif);

    await get().loadGuardData(guardId, guardEmail || '');
  },

  reportIncident: async (incident) => {
    const { guardId, guardEmail, guardName, assignedSite, assignedSiteId } = get();
    if (!guardId) return;

    const newIncident: DBIncident = {
      id: `i-inc-${Date.now()}`,
      title: incident.title,
      site: assignedSite,
      siteId: assignedSiteId,
      reportedBy: guardName,
      reportedById: guardId,
      severity: incident.severity.toLowerCase(),
      status: 'open',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      details: incident.description,
      companyId: 'c-1',
    };

    await insertRow('incidents', newIncident);
    await get().loadGuardData(guardId, guardEmail || '');
  },

  uploadDocument: async (docInfo) => {
    const { guardId } = get();
    const newDoc: DBEmployeeDocument = {
      id: `doc-${Date.now()}`,
      employeeId: guardId || 'emp-1',
      name: docInfo.name || 'Uploaded Document',
      type: docInfo.type || 'General Verification',
      status: 'Pending HR Approval',
      uploadedAt: new Date().toISOString().split('T')[0],
      uri: docInfo.uri || '',
      fileName: docInfo.fileName || docInfo.name,
      mimeType: docInfo.mimeType || 'application/pdf',
    };

    try {
      await insertRow('employeeDocuments', newDoc);
    } catch (e) {
      // fallback
    }

    set((state) => ({
      documents: [newDoc, ...state.documents],
    }));
  },

  startPatrol: async (patrolId?: string) => {
    const { guardId, guardEmail, patrols, isClockedIn } = get();
    if (!guardId) return;

    if (!isClockedIn) {
      Alert.alert(
        'Clock In Required',
        'You must be clocked in before starting a patrol. Please clock in first.'
      );
      return;
    }

    // Find target patrol by ID or pending/in_progress
    const activePat = (patrolId ? patrols.find(p => p.id === patrolId) : null) ||
      patrols.find(p => p.status === 'pending' || p.status === 'in_progress' || p.status === 'Assigned');
    const nowTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (activePat) {
      await updateRow<DBPatrol>('patrols', activePat.id, {
        status: 'in_progress',
        startTime: nowTimeStr,
      });
    } else {
      // Create one on the fly
      const todayStr = new Date().toISOString().split('T')[0];
      const newPat: DBPatrol = {
        id: `patrol-${Date.now()}`,
        companyId: 'c-1',
        site: get().assignedSite,
        siteId: get().assignedSiteId,
        guard: get().guardName,
        guardId: guardId,
        date: todayStr,
        startTime: nowTimeStr,
        endTime: '',
        status: 'in_progress',
        checkpoints: 5,
        scanned: 0,
        missed: 0,
        incidents: 0,
      };
      await insertRow('patrols', newPat);
    }

    // Reset checkpoints to Pending
    const defaultCPs: CheckpointData[] = [
      { id: '1', name: 'Main Gate', number: 'CP-01', location: 'Entrance', scheduledTime: '09:15 AM', status: 'Pending', qrCode: 'CP-01' },
      { id: '2', name: 'Reception Lobby', number: 'CP-02', location: 'Tower A', scheduledTime: '09:30 AM', status: 'Pending', qrCode: 'CP-02' },
      { id: '3', name: 'Parking Level 1', number: 'CP-03', location: 'Basement', scheduledTime: '09:45 AM', status: 'Pending', qrCode: 'CP-03' },
      { id: '4', name: 'Server Room', number: 'CP-04', location: 'Tower B', scheduledTime: '10:00 AM', status: 'Pending', qrCode: 'CP-04' },
      { id: '5', name: 'Emergency Exit', number: 'CP-05', location: 'Rear Gate', scheduledTime: '10:15 AM', status: 'Pending', qrCode: 'CP-05' },
    ];

    // We need to resolve which patrol id is running
    const reloadedPatrols = await getTable<DBPatrol>('patrols');
    const runningPatrol = (patrolId ? reloadedPatrols.find(p => p.id === patrolId) : null) ||
      reloadedPatrols.find(p => p.guardId === guardId && (p.status === 'in_progress' || p.status === 'In Progress'));
    if (runningPatrol) {
      const existingCPsRaw = await AsyncStorage.getItem(`p1_db_patrol_checkpoints_${runningPatrol.id}`);
      if (!existingCPsRaw) {
        await AsyncStorage.setItem(`p1_db_patrol_checkpoints_${runningPatrol.id}`, JSON.stringify(defaultCPs));
      }
    }

    // Create Notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: guardId,
      title: 'Patrol Started',
      message: `Morning Perimeter Patrol has been started at ${nowTimeStr}.`,
      read: false,
      createdAt: new Date().toISOString()
    };
    await insertRow('notifications', newNotif);

    await get().loadGuardData(guardId, guardEmail || '');
  },

  ensurePatrolsForDate: async (targetDateInput?: string | Date) => {
    const d = targetDateInput
      ? (typeof targetDateInput === 'string' ? new Date(targetDateInput) : targetDateInput)
      : new Date();

    const validDate = isNaN(d.getTime()) ? new Date() : d;
    const yyyy = validDate.getFullYear();
    const mm = String(validDate.getMonth() + 1).padStart(2, '0');
    const dd = String(validDate.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const displayDateStr = formatDisplayDate(dateKey);

    const { patrols, guardId, guardName, assignedSite } = get();
    const currentPatrols = patrols || [];

    const existing = currentPatrols.filter(p => {
      const pDisplay = formatDisplayDate(p.date);
      return pDisplay.toLowerCase() === displayDateStr.toLowerCase() || p.date === dateKey;
    });

    if (existing.length >= 5) {
      return;
    }

    const dateCode = `${yyyy}${mm}${dd}`;
    const empName = guardName || 'John Smith';
    const siteName = assignedSite || 'Ahmedabad Plant';

    const newPatrols: DBPatrol[] = [
      {
        id: `patrol-${dateKey}-1400`,
        patrolCode: `PT-${dateCode}-01`,
        title: 'Early Afternoon Facility Patrol',
        companyId: 'c-1',
        site: siteName,
        siteId: 's-01',
        route: 'Main Entrance & Lobby Route',
        guard: empName,
        guardId: guardId || 'G-1001',
        date: dateKey,
        startTime: '02:00 PM',
        scheduledStartTime: '02:00 PM',
        scheduledEndTime: '03:00 PM',
        startBufferMinutes: 15,
        status: 'Scheduled',
        checkpoints: 5,
        scanned: 0,
        missed: 0,
        incidents: 0,
        lastCheckpoint: 'Pending Start',
      },
      {
        id: `patrol-${dateKey}-1600`,
        patrolCode: `PT-${dateCode}-02`,
        title: 'Late Afternoon Dock Patrol',
        companyId: 'c-1',
        site: siteName,
        siteId: 's-01',
        route: 'Loading Dock & Bay Route',
        guard: empName,
        guardId: guardId || 'G-1001',
        date: dateKey,
        startTime: '04:00 PM',
        scheduledStartTime: '04:00 PM',
        scheduledEndTime: '05:00 PM',
        startBufferMinutes: 15,
        status: 'Scheduled',
        checkpoints: 5,
        scanned: 0,
        missed: 0,
        incidents: 0,
        lastCheckpoint: 'Pending Start',
      },
      {
        id: `patrol-${dateKey}-1800`,
        patrolCode: `PT-${dateCode}-03`,
        title: 'Early Evening Shift Change Patrol',
        companyId: 'c-1',
        site: siteName,
        siteId: 's-01',
        route: 'Perimeter Gate A & Fence Route',
        guard: empName,
        guardId: guardId || 'G-1001',
        date: dateKey,
        startTime: '06:00 PM',
        scheduledStartTime: '06:00 PM',
        scheduledEndTime: '07:00 PM',
        startBufferMinutes: 15,
        status: 'Scheduled',
        checkpoints: 5,
        scanned: 0,
        missed: 0,
        incidents: 0,
        lastCheckpoint: 'Pending Start',
      },
      {
        id: `patrol-${dateKey}-2000`,
        patrolCode: `PT-${dateCode}-04`,
        title: 'Night Main Perimeter Patrol',
        companyId: 'c-1',
        site: siteName,
        siteId: 's-01',
        route: 'Night Perimeter & Gate B Route',
        guard: empName,
        guardId: guardId || 'G-1001',
        date: dateKey,
        startTime: '08:00 PM',
        scheduledStartTime: '08:00 PM',
        scheduledEndTime: '09:00 PM',
        startBufferMinutes: 15,
        status: 'Scheduled',
        checkpoints: 5,
        scanned: 0,
        missed: 0,
        incidents: 0,
        lastCheckpoint: 'Pending Start',
      },
      {
        id: `patrol-${dateKey}-2200`,
        patrolCode: `PT-${dateCode}-05`,
        title: 'Late Night Security Patrol',
        companyId: 'c-1',
        site: siteName,
        siteId: 's-01',
        route: 'Critical Assets & Server Room Route',
        guard: empName,
        guardId: guardId || 'G-1001',
        date: dateKey,
        startTime: '10:00 PM',
        scheduledStartTime: '10:00 PM',
        scheduledEndTime: '11:00 PM',
        startBufferMinutes: 15,
        status: 'Scheduled',
        checkpoints: 5,
        scanned: 0,
        missed: 0,
        incidents: 0,
        lastCheckpoint: 'Pending Start',
      },
    ];

    let allDbPatrols = await getTable<DBPatrol>('patrols');
    for (const np of newPatrols) {
      if (!allDbPatrols.some(p => p.id === np.id)) {
        allDbPatrols.unshift(np);
      }
    }
    await saveTable('patrols', allDbPatrols);

    const guardPatrols = allDbPatrols.filter(p =>
      p.guardId === guardId || p.guard === empName || p.guardId === 'G-1001' || p.guardId === 'guard-1'
    );

    set({ patrols: guardPatrols });
  },

  loadPatrolCheckpoints: async (patrolId: string) => {
    const { patrols } = get();
    if (!patrolId) return;

    let targetPat = (patrols || []).find(p => p.id === patrolId) || null;
    let activeCPs: CheckpointData[] = [];

    const cpsRaw = await AsyncStorage.getItem(`p1_db_patrol_checkpoints_${patrolId}`);
    if (cpsRaw) {
      try {
        activeCPs = JSON.parse(cpsRaw);
      } catch (e) {
        activeCPs = [];
      }
    }

    if (!activeCPs || activeCPs.length === 0) {
      const initialScannedCount = targetPat ? (targetPat.scanned || 0) : 0;
      activeCPs = [
        { id: '1', name: 'Main Gate', number: 'CP-01', location: 'Entrance', scheduledTime: '09:15 AM', status: 'Pending', qrCode: 'CP-01' },
        { id: '2', name: 'Reception Lobby', number: 'CP-02', location: 'Tower A', scheduledTime: '09:30 AM', status: 'Pending', qrCode: 'CP-02' },
        { id: '3', name: 'Parking Level 1', number: 'CP-03', location: 'Basement', scheduledTime: '09:45 AM', status: 'Pending', qrCode: 'CP-03' },
        { id: '4', name: 'Server Room', number: 'CP-04', location: 'Tower B', scheduledTime: '10:00 AM', status: 'Pending', qrCode: 'CP-04' },
        { id: '5', name: 'Emergency Exit', number: 'CP-05', location: 'Rear Gate', scheduledTime: '10:15 AM', status: 'Pending', qrCode: 'CP-05' },
      ];

      if (initialScannedCount > 0) {
        for (let i = 0; i < Math.min(initialScannedCount, activeCPs.length); i++) {
          activeCPs[i].status = 'Completed';
          activeCPs[i].scanTime = '08:30 AM';
        }
      }
      await AsyncStorage.setItem(`p1_db_patrol_checkpoints_${patrolId}`, JSON.stringify(activeCPs));
    } else if (targetPat && targetPat.scanned > 0) {
      const currentCompleted = activeCPs.filter(c => c.status === 'Completed').length;
      if (targetPat.scanned > currentCompleted) {
        const toMark = Math.min(targetPat.scanned, activeCPs.length);
        for (let i = 0; i < toMark; i++) {
          activeCPs[i].status = 'Completed';
          if (!activeCPs[i].scanTime) activeCPs[i].scanTime = '08:30 AM';
        }
        await AsyncStorage.setItem(`p1_db_patrol_checkpoints_${patrolId}`, JSON.stringify(activeCPs));
      }
    }

    const actualCompleted = activeCPs.filter(c => c.status === 'Completed').length;
    const actualTotal = activeCPs.length;

    const currentMap = get().patrolCheckpointsMap || {};
    const updatedMap = {
      ...currentMap,
      [patrolId]: activeCPs,
    };

    if (targetPat) {
      const updatedPat: DBPatrol = {
        ...targetPat,
        scanned: actualCompleted,
        checkpoints: actualTotal,
        status: (actualCompleted >= actualTotal && actualTotal > 0) ? 'Completed' : (actualCompleted > 0 ? 'Incomplete' : targetPat.status),
      };

      const updatedPatrols = (patrols || []).map(p => p.id === patrolId ? updatedPat : p);
      await updateRow<DBPatrol>('patrols', patrolId, {
        scanned: actualCompleted,
        checkpoints: actualTotal,
        status: updatedPat.status,
      });

      set({
        activePatrol: updatedPat,
        patrolCheckpoints: activeCPs,
        patrolCheckpointsMap: updatedMap,
        patrols: updatedPatrols,
      });
    } else {
      set({
        patrolCheckpoints: activeCPs,
        patrolCheckpointsMap: updatedMap,
      });
    }
  },

  scanCheckpointCode: async (code: string, targetPatrolId?: string) => {
    let { activePatrol, guardId, guardEmail, patrolCheckpointsMap, patrols, isClockedIn } = get();
    if (!guardId) return { success: false, message: 'User not logged in' };

    if (!isClockedIn) {
      Alert.alert(
        'Clock In Required',
        'You must be clocked in before starting a patrol or scanning checkpoints.'
      );
      return { success: false, message: 'Clock In Required. You must clock in before patrolling.' };
    }

    const effectivePatrolId = targetPatrolId || activePatrol?.id;
    if (!effectivePatrolId) {
      return { success: false, message: 'No active patrol specified' };
    }

    let targetPatrol = (patrols || []).find(p => p.id === effectivePatrolId) || null;
    let targetCPs = patrolCheckpointsMap[effectivePatrolId] || [];

    if (!targetCPs || targetCPs.length === 0) {
      await get().loadPatrolCheckpoints(effectivePatrolId);
      const state = get();
      targetCPs = state.patrolCheckpointsMap[effectivePatrolId] || [];
      targetPatrol = (state.patrols || []).find(p => p.id === effectivePatrolId) || null;
    }

    if (!targetPatrol) {
      return { success: false, message: 'Patrol not found' };
    }

    if (targetPatrol.status === 'Completed' || targetPatrol.status === 'completed') {
      return { success: false, message: 'Patrol Completed' };
    }

    const cleanCode = (code || '').trim().toUpperCase();
    const cpIndex = targetCPs.findIndex(
      c => (c.qrCode || '').trim().toUpperCase() === cleanCode ||
        (c.number || '').trim().toUpperCase() === cleanCode ||
        (c.id || '').trim().toUpperCase() === cleanCode ||
        cleanCode.includes((c.number || '').trim().toUpperCase())
    );

    if (cpIndex === -1) {
      return { success: false, message: 'Invalid Checkpoint QR Code' };
    }

    const cp = targetCPs[cpIndex];
    if (cp.status === 'Completed') {
      return { success: false, message: 'Checkpoint Already Completed' };
    }

    const updatedCPs = [...targetCPs];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updatedCPs[cpIndex] = {
      ...cp,
      status: 'Completed',
      scanTime: nowTime,
    };

    await AsyncStorage.setItem(`p1_db_patrol_checkpoints_${effectivePatrolId}`, JSON.stringify(updatedCPs));

    const totalScanned = updatedCPs.filter(c => c.status === 'Completed').length;
    const totalCount = updatedCPs.length;
    const isFinished = totalScanned >= totalCount;
    const nextStatus = isFinished ? 'Completed' : 'in_progress';

    await updateRow<DBPatrol>('patrols', effectivePatrolId, {
      scanned: totalScanned,
      checkpoints: totalCount,
      status: nextStatus,
      endTime: isFinished ? nowTime : targetPatrol.endTime || '',
    });

    const updatedPatrol: DBPatrol = {
      ...targetPatrol,
      scanned: totalScanned,
      checkpoints: totalCount,
      status: nextStatus,
      endTime: isFinished ? nowTime : targetPatrol.endTime,
    };

    const updatedPatrolsList = (patrols || []).map(p => p.id === effectivePatrolId ? updatedPatrol : p);

    const updatedMap = {
      ...get().patrolCheckpointsMap,
      [effectivePatrolId]: updatedCPs,
    };

    set({
      activePatrol: activePatrol?.id === effectivePatrolId ? updatedPatrol : activePatrol,
      patrolCheckpointsMap: updatedMap,
      patrolCheckpoints: updatedCPs,
      patrols: updatedPatrolsList,
    });

    // Create Notification for Scan
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: guardId,
      title: 'Checkpoint Verified',
      message: `${cp.name} (${cp.number}) recorded at ${nowTime}.`,
      read: false,
      createdAt: new Date().toISOString()
    };
    await insertRow('notifications', newNotif);

    if (isFinished) {
      const completionNotif = {
        id: `notif-comp-${Date.now()}`,
        userId: guardId,
        title: 'Patrol Completed',
        message: `All ${totalCount} checkpoints completed at ${nowTime}.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      await insertRow('notifications', completionNotif);
    }

    await get().loadGuardData(guardId, guardEmail || '');
    return { success: true, message: 'Checkpoint Verified' };
  },

  checkInLoneWorker: (customParams?: {
    latitude?: number;
    longitude?: number;
    distanceMeters?: number;
    gpsStatus?: string;
    status?: string;
  }) => {
    const nowMs = Date.now();
    const d = new Date(nowMs);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const nowTimeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const shortTimeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nextMs = nowMs + 30 * 60 * 1000;
    const nextStr = new Date(nextMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const site = get().assignedSite || 'Assigned Site';
    const guardId = get().guardId || '';
    const guardName = get().guardName || 'Security Officer';

    const lat = customParams?.latitude ?? 23.1145;
    const lng = customParams?.longitude ?? 72.5821;
    const dist = customParams?.distanceMeters ?? 42;
    const radius = 200;
    const isGpsValid = dist <= radius;
    const gpsStatus = customParams?.gpsStatus ?? (isGpsValid ? 'GPS Verified' : 'Location Not Verified');
    const checkStatus = customParams?.status ?? 'Safe';

    soundAlertService.stopSafetyAlert();

    const newHistoryItem: LoneWorkerHistoryItem = {
      id: `lw-${nowMs}`,
      guardId,
      guardName,
      dateStr,
      exactTime: nowTimeStr,
      siteName: site,
      latitude: lat,
      longitude: lng,
      distanceMeters: dist,
      radiusMeters: radius,
      gpsStatus,
      onTimeStatus: 'On Time',
      status: checkStatus,
      shiftInfo: 'Morning Shift (08:00 AM - 04:00 PM)',
      timestamp: nowMs,
    };

    const lwState: LoneWorkerState = {
      status: checkStatus === 'Safe' ? 'SAFE' : checkStatus === 'SOS / Issue Reported' ? 'SOS / Issue Reported' : checkStatus,
      lastCheckIn: shortTimeStr,
      lastCheckInTimestamp: nowMs,
      nextCheckRequired: nextStr,
      nextCheckTimestamp: nextMs,
      isModalOpen: false,
    };

    const updatedHistory = [newHistoryItem, ...(get().loneWorkerHistory || [])];

    if (guardId) {
      AsyncStorage.setItem(`@lone_worker_state_${guardId}`, JSON.stringify(lwState)).catch(() => { });
      AsyncStorage.setItem(`@lone_worker_history_${guardId}`, JSON.stringify(updatedHistory)).catch(() => { });
    }

    set({
      loneWorker: lwState,
      loneWorkerHistory: updatedHistory,
    });
  },

  openLoneWorkerModal: () => {
    set((state) => ({
      loneWorker: { ...state.loneWorker, isModalOpen: true }
    }));
  },

  closeLoneWorkerModal: () => {
    soundAlertService.stopSafetyAlert();
    set((state) => ({
      loneWorker: { ...state.loneWorker, isModalOpen: false }
    }));
  },

  triggerSafetyCheckDue: () => {
    const { loneWorker, isClockedIn } = get();
    if (!isClockedIn) return;
    if (loneWorker.isModalOpen) return;
    soundAlertService.startSafetyAlert();
    set((state) => ({
      loneWorker: {
        ...state.loneWorker,
        status: 'CHECK REQUIRED',
        isModalOpen: true,
      }
    }));
  },

  sendMessage: async (type, conversationId, receiverId, messageText) => {
    const { guardId, guardName, assignedSiteId, guardEmail } = get();
    if (!guardId) return;

    const newMsg: DBMessage = {
      id: `msg-${Date.now()}`,
      type,
      conversationId,
      siteId: type === 'site' ? assignedSiteId : undefined,
      senderId: guardId,
      senderName: guardName,
      receiverId: type === 'direct' ? (receiverId || undefined) : undefined,
      message: messageText,
      timestamp: new Date().toISOString(),
      read: true,
    };

    await insertRow('messages', newMsg);
    await get().loadGuardData(guardId, guardEmail || '');
  },

  markNotificationRead: async (id) => {
    const { guardId, guardEmail } = get();
    if (!guardId) return;
    const allNotifs = await getTable<any>('notifications');
    const index = allNotifs.findIndex((n: any) => n.id === id);
    if (index !== -1) {
      allNotifs[index].read = true;
      await saveTable('notifications', allNotifs);
      await get().loadGuardData(guardId, guardEmail || '');
    }
  },

  markAllNotificationsRead: async () => {
    const { guardId, guardEmail } = get();
    if (!guardId) return;
    const allNotifs = await getTable<any>('notifications');
    allNotifs.forEach((n: any) => {
      if (n.userId === guardId) n.read = true;
    });
    await saveTable('notifications', allNotifs);
    await get().loadGuardData(guardId, guardEmail || '');
  },

  deleteNotification: async (id) => {
    const { guardId, guardEmail } = get();
    if (!guardId) return;
    const allNotifs = await getTable<any>('notifications');
    const filtered = allNotifs.filter((n: any) => n.id !== id);
    await saveTable('notifications', filtered);
    await get().loadGuardData(guardId, guardEmail || '');
  },

  deleteAllNotifications: async () => {
    const { guardId, guardEmail } = get();
    if (!guardId) return;
    const allNotifs = await getTable<any>('notifications');
    const filtered = allNotifs.filter((n: any) => n.userId !== guardId);
    await saveTable('notifications', filtered);
    await get().loadGuardData(guardId, guardEmail || '');
  },
}));
