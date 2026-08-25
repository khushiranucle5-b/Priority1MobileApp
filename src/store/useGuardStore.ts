import { create } from 'zustand';
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
import { useAuthStore } from './useAuthStore';
import { getCurrentRelevantPatrol } from '../features/patrol/utils/patrolUtils';

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
  loneWorker: LoneWorkerState;
  loneWorkerHistory: LoneWorkerHistoryItem[];
  shifts: DBShift[];
  todayShift: DBShift | null;
  patrols: DBPatrol[];
  activePatrol: DBPatrol | null;
  patrolCheckpoints: CheckpointData[];
  messages: DBMessage[];

  // Actions
  loadGuardData: (guardId: string, email: string) => Promise<void>;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => Promise<void>;
  updateLeave: (leaveId: string, leave: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => Promise<void>;
  cancelLeave: (leaveId: string) => Promise<void>;
  reportIncident: (incident: Omit<IncidentReport, 'id' | 'status' | 'reportedDate'>) => Promise<void>;
  uploadDocument: (docInfo: { name: string, type: string, uri: string, fileName: string, mimeType: string }) => Promise<void>;
  startPatrol: (patrolId?: string) => Promise<any>;
  ensurePatrolsForDate: (targetDate?: string | Date) => Promise<void>;
  loadPatrolCheckpoints: (patrolId: string) => Promise<CheckpointData[]>;
  scanCheckpointCode: (code: string, specificPatrolId?: string) => Promise<{ success: boolean; message: string }>;
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

export const isSameDate = (d1Str: string | null | undefined, d2Str: string | null | undefined): boolean => {
  if (!d1Str || !d2Str) return false;
  if (d1Str === d2Str) return true;
  try {
    const toYmd = (s: string) => {
      if (s.includes('T')) s = s.split('T')[0];
      const d = new Date(s);
      if (isNaN(d.getTime())) return s.trim().toLowerCase();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    return toYmd(d1Str) === toYmd(d2Str);
  } catch {
    return false;
  }
};


export const isCompletedClockOut = (clockOut: string | null | undefined): boolean => {
  if (!clockOut) return false;
  const s = String(clockOut).trim().toLowerCase();
  return s !== '' && s !== '—' && s !== 'null' && s !== 'undefined' && s !== 'ongoing';
};

export const safeParseMs = (str: string | null | undefined, referenceDateStr?: string): number | null => {
  if (!str) return null;
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.getTime();
  const n = Number(str);
  if (!isNaN(n) && n > 0) return n;

  if (typeof str === 'string') {
    const datePart = referenceDateStr || new Date().toISOString().split('T')[0];
    const combined = new Date(`${datePart} ${str}`);
    if (!isNaN(combined.getTime())) return combined.getTime();
  }
  return null;
};

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
      name: 'Aadhaar Card / Government ID',
      type: 'Government ID',
      status: 'Approved',
      uploadedAt: '2026-08-12',
      uri: '',
      fileName: 'aadhaar_verification_doc.pdf',
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
  notifications: [],
  shifts: [],
  todayShift: null,
  patrols: [
    {
      id: 'patrol-2026-08-25-slot-14',
      patrolCode: 'PT-20260825-01',
      title: 'Afternoon Perimeter Patrol',
      companyId: 'c-1',
      site: 'Ahmedabad Plant',
      route: 'Perimeter Route A',
      guard: 'John Smith',
      guardId: 'G-1001',
      date: '2026-08-25',
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
      id: 'patrol-2026-08-25-slot-15',
      patrolCode: 'PT-20260825-02',
      title: 'Mid-Afternoon Facility Patrol',
      companyId: 'c-1',
      site: 'Ahmedabad Plant',
      route: 'Facility Internal Route',
      guard: 'John Smith',
      guardId: 'G-1001',
      date: '2026-08-25',
      startTime: '03:00 PM',
      scheduledStartTime: '03:00 PM',
      scheduledEndTime: '04:00 PM',
      startBufferMinutes: 15,
      status: 'Scheduled',
      checkpoints: 5,
      scanned: 0,
      missed: 0,
      incidents: 0,
      lastCheckpoint: 'Pending Start',
    },
    {
      id: 'patrol-2026-08-25-slot-16',
      patrolCode: 'PT-20260825-03',
      title: 'Late Afternoon Security Patrol',
      companyId: 'c-1',
      site: 'Ahmedabad Plant',
      route: 'Security Sector B Route',
      guard: 'John Smith',
      guardId: 'G-1001',
      date: '2026-08-25',
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
      id: 'patrol-2026-08-25-slot-17',
      patrolCode: 'PT-20260825-04',
      title: 'Shift Change Patrol',
      companyId: 'c-1',
      site: 'Ahmedabad Plant',
      route: 'Perimeter Route B',
      guard: 'John Smith',
      guardId: 'G-1001',
      date: '2026-08-25',
      startTime: '05:00 PM',
      scheduledStartTime: '05:00 PM',
      scheduledEndTime: '06:00 PM',
      startBufferMinutes: 15,
      status: 'Scheduled',
      checkpoints: 5,
      scanned: 0,
      missed: 0,
      incidents: 0,
      lastCheckpoint: 'Pending Start',
    },
    {
      id: 'patrol-2026-08-25-slot-18',
      patrolCode: 'PT-20260825-05',
      title: 'Early Evening Perimeter Patrol',
      companyId: 'c-1',
      site: 'Ahmedabad Plant',
      route: 'Main Entrance & Gate Route',
      guard: 'John Smith',
      guardId: 'G-1001',
      date: '2026-08-25',
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
      id: 'patrol-2026-08-25-slot-19',
      patrolCode: 'PT-20260825-06',
      title: 'Evening Main Patrol',
      companyId: 'c-1',
      site: 'Ahmedabad Plant',
      route: 'Evening Perimeter Route',
      guard: 'John Smith',
      guardId: 'G-1001',
      date: '2026-08-25',
      startTime: '07:00 PM',
      scheduledStartTime: '07:00 PM',
      scheduledEndTime: '08:00 PM',
      startBufferMinutes: 15,
      status: 'Scheduled',
      checkpoints: 5,
      scanned: 0,
      missed: 0,
      incidents: 0,
      lastCheckpoint: 'Pending Start',
    },
  ],
  activePatrol: null,
  patrolCheckpoints: [
    { id: 'cp-101', number: 'CP-01', name: 'Main Entrance Gate A', location: 'Main Gate Security Office', scheduledTime: '02:05 PM', status: 'Completed', scanTime: '02:06 PM', qrCode: 'CP-01' },
    { id: 'cp-102', number: 'CP-02', name: 'Reception & Lobby Hall', location: 'Administration Block Ground Floor', scheduledTime: '02:15 PM', status: 'Completed', scanTime: '02:18 PM', qrCode: 'CP-02' },
    { id: 'cp-103', number: 'CP-03', name: 'Warehouse Entrance Door', location: 'Logistics Building West Entrance', scheduledTime: '02:25 PM', status: 'Pending', qrCode: 'CP-03' },
    { id: 'cp-104', number: 'CP-04', name: 'Chemical Storage Bay 2', location: 'HAZMAT Enclosure East Area', scheduledTime: '02:40 PM', status: 'Pending', qrCode: 'CP-04' },
    { id: 'cp-105', number: 'CP-05', name: 'Emergency Exit B', location: 'Rear Fence Perimeter Wall', scheduledTime: '02:50 PM', status: 'Pending', qrCode: 'CP-05' },
  ],
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

  loadGuardData: async (guardIdParam, emailParam) => {
    try {
      const authUser = useAuthStore.getState().user;
      const guardId = guardIdParam || authUser?.id || authUser?.employeeId || 'G-1001';
      const email = emailParam || authUser?.email || 'john@priority-one.io';

      // Resolve employee details
      const employees = await getTable<DBEmployee>('employees');
      const emp = employees.find(e => e.id === guardId || e.email === email) || employees[0];

      // Resolve shifts
      const allShifts = await getTable<DBShift>('shifts');
      const guardShifts = allShifts.filter(s => s.guardId === guardId || s.guard === emp?.name);

      // Resolve attendance history
      const allAtt = await getTable<DBAttendance>('attendance');
      const isGuardAttMatch = (a: DBAttendance) => {
        if (!a) return false;
        const eId = String(a.employeeId || '').toLowerCase();
        const eEmail = String(a.employeeEmail || '').toLowerCase();
        const eName = String(a.employeeName || '').toLowerCase();

        const searchId = String(guardId || '').toLowerCase();
        const searchEmail = String(email || '').toLowerCase();
        const searchName = String(emp?.name || '').toLowerCase();

        if (eId && (eId === searchId || eId === 'g-1001' || eId === 'guard-1' || eId === 'emp-101' || eId === 'grd-1024')) return true;
        if (eEmail && (eEmail === searchEmail || eEmail === 'john@priority-one.io' || eEmail === 'khushi.rani@priority1.com')) return true;
        if (eName && searchName && (eName.includes(searchName) || searchName.includes(eName))) return true;
        return false;
      };
      const guardAtt = allAtt.filter(isGuardAttMatch);

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

      // Auto-ensure 6 PM patrol entries for current date and purge any legacy 8 AM/8 PM patrols
      const todayPatrolsList = allPatrols.filter(p => isSameDate(p.date, todayKey));
      const hasLegacyToday = todayPatrolsList.some(p =>
        p.title === 'Morning Perimeter Patrol' ||
        p.title === 'Evening Perimeter Patrol' ||
        p.scheduledStartTime === '08:00 AM' ||
        (p.scheduledStartTime === '08:00 PM' && p.scheduledEndTime === '09:00 PM')
      );

      if (hasLegacyToday || todayPatrolsList.length < 6) {
        allPatrols = allPatrols.filter(p => {
          if (!isSameDate(p.date, todayKey)) return true;
          return !hasLegacyToday && (
            p.id.includes('slot-14') || p.id.includes('slot-15') || p.id.includes('slot-16') ||
            p.id.includes('slot-17') || p.id.includes('slot-18') || p.id.includes('slot-19')
          );
        });

        const dateCode = `${nYyyy}${nMm}${nDd}`;
        const empName = emp?.name || 'John Smith';
        const siteName = emp?.site || 'Ahmedabad Plant';

        const todayDefaultPatrols: DBPatrol[] = [
          {
            id: `patrol-${todayKey}-slot-14`,
            patrolCode: `PT-${dateCode}-01`,
            title: 'Afternoon Perimeter Patrol',
            companyId: 'c-1',
            site: siteName,
            siteId: emp?.siteId || 's-01',
            route: 'Perimeter Route A',
            guard: empName,
            guardId: guardId,
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
            id: `patrol-${todayKey}-slot-15`,
            patrolCode: `PT-${dateCode}-02`,
            title: 'Mid-Afternoon Facility Patrol',
            companyId: 'c-1',
            site: siteName,
            siteId: emp?.siteId || 's-01',
            route: 'Facility Internal Route',
            guard: empName,
            guardId: guardId,
            date: todayKey,
            startTime: '03:00 PM',
            scheduledStartTime: '03:00 PM',
            scheduledEndTime: '04:00 PM',
            startBufferMinutes: 15,
            status: 'Scheduled',
            checkpoints: 5,
            scanned: 0,
            missed: 0,
            incidents: 0,
            lastCheckpoint: 'Pending Start',
          },
          {
            id: `patrol-${todayKey}-slot-16`,
            patrolCode: `PT-${dateCode}-03`,
            title: 'Late Afternoon Security Patrol',
            companyId: 'c-1',
            site: siteName,
            siteId: emp?.siteId || 's-01',
            route: 'Security Sector B Route',
            guard: empName,
            guardId: guardId,
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
            id: `patrol-${todayKey}-slot-17`,
            patrolCode: `PT-${dateCode}-04`,
            title: 'Shift Change Patrol',
            companyId: 'c-1',
            site: siteName,
            siteId: emp?.siteId || 's-01',
            route: 'Perimeter Route B',
            guard: empName,
            guardId: guardId,
            date: todayKey,
            startTime: '05:00 PM',
            scheduledStartTime: '05:00 PM',
            scheduledEndTime: '06:00 PM',
            startBufferMinutes: 15,
            status: 'Scheduled',
            checkpoints: 5,
            scanned: 0,
            missed: 0,
            incidents: 0,
            lastCheckpoint: 'Pending Start',
          },
          {
            id: `patrol-${todayKey}-slot-18`,
            patrolCode: `PT-${dateCode}-05`,
            title: 'Early Evening Perimeter Patrol',
            companyId: 'c-1',
            site: siteName,
            siteId: emp?.siteId || 's-01',
            route: 'Main Entrance & Gate Route',
            guard: empName,
            guardId: guardId,
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
            id: `patrol-${todayKey}-slot-19`,
            patrolCode: `PT-${dateCode}-06`,
            title: 'Evening Main Patrol',
            companyId: 'c-1',
            site: siteName,
            siteId: emp?.siteId || 's-01',
            route: 'Evening Perimeter Route',
            guard: empName,
            guardId: guardId,
            date: todayKey,
            startTime: '07:00 PM',
            scheduledStartTime: '07:00 PM',
            scheduledEndTime: '08:00 PM',
            startBufferMinutes: 15,
            status: 'Scheduled',
            checkpoints: 5,
            scanned: 0,
            missed: 0,
            incidents: 0,
            lastCheckpoint: 'Pending Start',
          },
        ];

        for (const item of todayDefaultPatrols) {
          if (!allPatrols.some(p => p.id === item.id)) {
            allPatrols.push(item);
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
          employeeName: emp?.name || 'John Smith',
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
          employeeName: emp?.name || 'John Smith',
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
          id: 'mock-leave-20',
          employeeId: guardId,
          employeeName: emp?.name || 'John Smith',
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

      const isGuardLeaveMatch = (l: DBLeave) => {
        if (!l) return false;
        const eId = String(l.employeeId || '').toLowerCase();
        const eEmail = String(l.employeeEmail || '').toLowerCase();

        const searchId = String(guardId || '').toLowerCase();
        const searchEmail = String(email || '').toLowerCase();

        if (!eId || eId === searchId || eId === 'g-1001' || eId === 'guard-1' || eId === 'emp-101' || eId === 'grd-1024') return true;
        if (!eEmail || eEmail === searchEmail || eEmail === 'john@priority-one.io' || eEmail === 'khushi.rani@priority1.com') return true;
        return true;
      };

      const guardLeaves = allLeaves.filter(isGuardLeaveMatch);

      // Resolve incidents
      const allIncidents = await getTable<DBIncident>('incidents');
      const isGuardIncidentMatch = (i: DBIncident) => {
        if (!i) return false;
        const eId = String(i.reportedById || '').toLowerCase();
        const eName = String(i.reportedBy || '').toLowerCase();

        const searchId = String(guardId || '').toLowerCase();
        const searchName = String(emp?.name || '').toLowerCase();

        if (eId && (eId === searchId || eId === 'g-1001' || eId === 'guard-1' || eId === 'emp-101' || eId === 'grd-1024')) return true;
        if (eName && searchName && (eName.includes(searchName) || searchName.includes(eName))) return true;
        return false;
      };
      const guardIncidents = allIncidents.filter(isGuardIncidentMatch);

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

      const normalizeLocalDateStr = (dateVal: string | number | Date | null | undefined): string => {
        if (!dateVal) return '';

        if (dateVal instanceof Date) {
          if (isNaN(dateVal.getTime())) return '';
          const y = dateVal.getFullYear();
          const m = String(dateVal.getMonth() + 1).padStart(2, '0');
          const d = String(dateVal.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        }

        const str = String(dateVal).trim();
        const ymdMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        if (ymdMatch) {
          if (str.includes('T') || str.includes(':')) {
            const parsedDate = new Date(str);
            if (!isNaN(parsedDate.getTime())) {
              const y = parsedDate.getFullYear();
              const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
              const d = String(parsedDate.getDate()).padStart(2, '0');
              return `${y}-${m}-${d}`;
            }
          }
          const year = ymdMatch[1];
          const month = String(parseInt(ymdMatch[2], 10)).padStart(2, '0');
          const day = String(parseInt(ymdMatch[3], 10)).padStart(2, '0');
          return `${year}-${month}-${day}`;
        }

        const months: { [key: string]: string } = {
          jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
          jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
        };

        const parts = str.replace(/,/g, '').split(/\s+/);
        if (parts.length >= 3) {
          const m1 = months[parts[0].toLowerCase().slice(0, 3)];
          const m2 = months[parts[1].toLowerCase().slice(0, 3)];
          if (m1) {
            const day = String(parseInt(parts[1], 10)).padStart(2, '0');
            const year = parts[2];
            if (year.length === 4 && !isNaN(parseInt(day, 10))) return `${year}-${m1}-${day}`;
          } else if (m2) {
            const day = String(parseInt(parts[0], 10)).padStart(2, '0');
            const year = parts[2];
            if (year.length === 4 && !isNaN(parseInt(day, 10))) return `${year}-${m2}-${day}`;
          }
        }

        const d = new Date(str);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        }

        return str;
      };

      const isSameDate = (d1Str: string | null | undefined, d2Str: string | null | undefined): boolean => {
        if (!d1Str || !d2Str) return false;
        const norm1 = normalizeLocalDateStr(d1Str);
        const norm2 = normalizeLocalDateStr(d2Str);
        return norm1 !== '' && norm1 === norm2;
      };

      const isCompletedClockOut = (clockOut: string | null | undefined): boolean => {
        if (!clockOut) return false;
        const s = String(clockOut).trim().toLowerCase();
        return s !== '' && s !== '—' && s !== 'null' && s !== 'undefined' && s !== 'ongoing';
      };

      const safeParseMs = (str: string | null | undefined): number | null => {
        if (!str) return null;
        const d = new Date(str);
        if (!isNaN(d.getTime())) return d.getTime();
        const n = Number(str);
        if (!isNaN(n) && n > 0) return n;
        return null;
      };

      // 1. Filter guard's attendance records STRICTLY FOR TODAY ONLY
      const todayGuardRecords = guardAtt.filter(a =>
        isSameDate(a.date, todayLocalStr) || isSameDate(a.clockIn, todayLocalStr)
      );

      todayGuardRecords.sort((a, b) => {
        const aTime = safeParseMs(a.clockIn) || 0;
        const bTime = safeParseMs(b.clockIn) || 0;
        return aTime - bTime;
      });

      // 2. Find open clock-in record across guard attendance records
      const openRecord = guardAtt.slice().reverse().find(a =>
        a.clockIn && !isCompletedClockOut(a.clockOut)
      );

      // 3. Calculate sum of completed session durations STRICTLY FOR TODAY ONLY
      const todayCompletedMs = todayGuardRecords
        .filter(a => a.clockIn && isCompletedClockOut(a.clockOut))
        .reduce((sum, a) => {
          const inMs = safeParseMs(a.clockIn) || 0;
          const outMs = safeParseMs(a.clockOut) || 0;
          const dur = Math.max(0, outMs - inMs);
          return sum + dur;
        }, 0);

      const firstRecordToday = todayGuardRecords[0] || null;
      const firstClockInTime = firstRecordToday ? safeParseMs(firstRecordToday.clockIn) : null;

      const completedTodayRecords = todayGuardRecords.filter(a =>
        a.clockIn && isCompletedClockOut(a.clockOut)
      );
      const latestCompletedRecord = completedTodayRecords.length > 0
        ? completedTodayRecords[completedTodayRecords.length - 1]
        : null;

      let attStatus: AttendanceStatus = 'Not Checked In';
      let clockInTime: number | null = null;
      let clockOutTime: number | null = null;

      const formatTime12h = (timestamp: number | null): string => {
        if (!timestamp) return '--:--';
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return '--:--';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };

      // Check persisted active session in AsyncStorage
      const activeSessionRaw = await AsyncStorage.getItem('@p1_active_clock_in_session');
      let hasPersistedClockIn = false;
      let persistedClockInMs: number | null = null;
      if (activeSessionRaw) {
        try {
          const parsedSession = JSON.parse(activeSessionRaw);
          if (parsedSession && parsedSession.isClockedIn) {
            hasPersistedClockIn = true;
            persistedClockInMs = parsedSession.clockInTime || null;
          }
        } catch {
          // ignore
        }
      }

      if ((openRecord && openRecord.clockIn) || hasPersistedClockIn) {
        attStatus = 'Checked In';
        clockInTime = firstClockInTime || (openRecord ? safeParseMs(openRecord.clockIn) : null) || persistedClockInMs || Date.now();
        clockOutTime = null;
      } else if (latestCompletedRecord && latestCompletedRecord.clockIn && latestCompletedRecord.clockOut) {
        attStatus = 'Checked Out';
        clockInTime = firstClockInTime || safeParseMs(latestCompletedRecord.clockIn);
        clockOutTime = safeParseMs(latestCompletedRecord.clockOut);
      } else {
        attStatus = 'Not Checked In';
        clockInTime = null;
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
      } let activePat = getCurrentRelevantPatrol(guardPatrols, new Date());

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
        notifications: mappedNotifs,
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

  clockIn: async () => {
    try {
      let { guardId, guardEmail, guardName, assignedSite, assignedSiteId } = get();
      if (!guardId) {
        const authUser = useAuthStore.getState().user;
        const effectiveId = authUser?.id || authUser?.employeeId || 'G-1001';
        const effectiveEmail = authUser?.email || 'john@priority-one.io';
        LoggerService.log(`[useGuardStore] clockIn: guardId missing, auto-initializing identity as ${effectiveId}`);
        await get().loadGuardData(effectiveId, effectiveEmail);
        const refreshed = get();
        guardId = refreshed.guardId || effectiveId;
        guardEmail = refreshed.guardEmail || effectiveEmail;
        guardName = refreshed.guardName || authUser?.name || 'John Smith';
        assignedSite = refreshed.assignedSite || authUser?.assignedSite || 'Ahmedabad Plant';
        assignedSiteId = refreshed.assignedSiteId || 's-1';
      }

      const finalGuardId: string = guardId || 'G-1001';
      const finalGuardEmail: string = guardEmail || 'john@priority-one.io';

      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();
      const todayYear = new Date(nowMs).getFullYear();
      const todayMonth = String(new Date(nowMs).getMonth() + 1).padStart(2, '0');
      const todayDay = String(new Date(nowMs).getDate()).padStart(2, '0');
      const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

      const currentAtt = await getTable<DBAttendance>('attendance');

      // 1. Auto-close any unclosed past-date records for this guard so stale historical sessions don't block clock-in
      for (const rec of currentAtt) {
        const isGuardMatch = rec.employeeId === finalGuardId || rec.employeeEmail === finalGuardEmail;
        const isOpen = rec.clockIn && !isCompletedClockOut(rec.clockOut);
        const isToday = isSameDate(rec.date, todayStr) || isSameDate(rec.clockIn, todayStr);
        if (isGuardMatch && isOpen && !isToday) {
          LoggerService.log(`[useGuardStore] Auto-closing stale past session ${rec.id} from date ${rec.date}`);
          await updateRow<DBAttendance>('attendance', rec.id, {
            clockOut: rec.clockIn,
            workingHours: '0.00 hrs',
          });
        }
      }

      // Re-fetch attendance table after auto-closing stale records
      const refreshedAtt = await getTable<DBAttendance>('attendance');

      // 2. Check if an active open clock-in session ALREADY EXISTS FOR TODAY
      const openRecordToday = refreshedAtt.slice().reverse().find(a =>
        (a.employeeId === finalGuardId || a.employeeEmail === finalGuardEmail) &&
        a.clockIn &&
        !isCompletedClockOut(a.clockOut) &&
        (isSameDate(a.date, todayStr) || isSameDate(a.clockIn, todayStr))
      );

      if (openRecordToday) {
        LoggerService.log(`[useGuardStore] Active clock-in session already exists for today (${openRecordToday.id}). Restoring session.`);
        const parsedIn = safeParseMs(openRecordToday.clockIn, todayStr) || nowMs;
        set({
          attendanceStatus: 'Checked In',
          clockInTimestamp: parsedIn,
          clockOutTimestamp: null,
          isClockedIn: true,
          isClockedOut: false,
        });
        await get().loadGuardData(finalGuardId, finalGuardEmail);
        return;
      }

      // 3. Create new attendance record for today
      const newRecord: DBAttendance = {
        id: `att-${nowMs}`,
        employeeId: finalGuardId,
        employeeName: guardName,
        employeeEmail: finalGuardEmail,
        badge: `GRD-${finalGuardId.slice(-3).toUpperCase()}`,
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

      // Create Notification
      const newNotif = {
        id: `notif-${nowMs}`,
        userId: finalGuardId,
        title: 'Clocked In Successfully',
        message: `You clocked in at ${new Date(nowMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} at ${assignedSite}.`,
        read: false,
        createdAt: nowIso
      };
      await insertRow('notifications', newNotif);

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

      await AsyncStorage.setItem(`@lone_worker_state_${finalGuardId}`, JSON.stringify(lwState));
      await AsyncStorage.setItem('@p1_active_clock_in_session', JSON.stringify({ isClockedIn: true, clockInTime: nowMs, guardId: finalGuardId }));

      set({
        attendanceStatus: 'Checked In',
        clockInTimestamp: nowMs,
        clockOutTimestamp: null,
        isClockedIn: true,
        isClockedOut: false,
        loneWorker: lwState,
      });

      await get().loadGuardData(finalGuardId, finalGuardEmail);
      LoggerService.log(`[useGuardStore] clockIn completed successfully for ${finalGuardId}`);
    } catch (error: any) {
      LoggerService.log(`[useGuardStore] clockIn error: ${error?.message || error}`, 'error');
      throw error;
    }
  },

  clockOut: async () => {
    try {
      let { guardId, guardEmail, assignedSite, clockInTimestamp } = get();
      if (!guardId) {
        const authUser = useAuthStore.getState().user;
        const effectiveId = authUser?.id || authUser?.employeeId || 'G-1001';
        const effectiveEmail = authUser?.email || 'john@priority-one.io';
        LoggerService.log(`[useGuardStore] clockOut: guardId missing, auto-initializing identity as ${effectiveId}`);
        await get().loadGuardData(effectiveId, effectiveEmail);
        const refreshed = get();
        guardId = refreshed.guardId || effectiveId;
        guardEmail = refreshed.guardEmail || effectiveEmail;
      }

      const finalGuardId: string = guardId || 'G-1001';
      const finalGuardEmail: string = guardEmail || 'john@priority-one.io';

      const nowMs = Date.now();
      const nowStr = new Date(nowMs).toISOString();
      const currentAtt = await getTable<DBAttendance>('attendance');

      const openRecord = currentAtt.slice().reverse().find(a =>
        (a.employeeId === finalGuardId || a.employeeEmail === finalGuardEmail) &&
        a.clockIn &&
        !isCompletedClockOut(a.clockOut)
      );

      if (openRecord) {
        const inT = safeParseMs(openRecord.clockIn) || clockInTimestamp || nowMs;
        const outT = nowMs;
        const diffMs = Math.max(0, outT - inT);
        const hrs = (diffMs / (3600 * 1000)).toFixed(2);
        const diffHrs = `${hrs} hrs`;

        await updateRow<DBAttendance>('attendance', openRecord.id, {
          clockOut: nowStr,
          workingHours: diffHrs,
        });

        // Create Notification
        const newNotif = {
          id: `notif-${nowMs}`,
          userId: finalGuardId,
          title: 'Clocked Out Successfully',
          message: `You clocked out at ${new Date(nowStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Total: ${diffHrs}.`,
          read: false,
          createdAt: nowStr
        };
        await insertRow('notifications', newNotif);
        LoggerService.log(`[useGuardStore] clockOut update complete for record ${openRecord.id}`);
      }

      soundAlertService.stopSafetyAlert();

      // Reset any active in_progress patrol on clock-out to prevent inconsistent state
      let currentDbPatrols = await getTable<DBPatrol>('patrols');
      let patrolUpdated = false;
      currentDbPatrols = currentDbPatrols.map(p => {
        if ((p.guardId === finalGuardId || p.guardId === 'G-1001') && (p.status === 'in_progress' || p.status === 'In Progress')) {
          patrolUpdated = true;
          const isDone = (p.scanned || 0) >= (p.checkpoints || 5);
          return {
            ...p,
            status: isDone ? 'Completed' : 'Scheduled',
          };
        }
        return p;
      });

      if (patrolUpdated) {
        await saveTable('patrols', currentDbPatrols);
      }

      const lwState: LoneWorkerState = {
        status: 'NOT ACTIVE',
        lastCheckIn: null,
        lastCheckInTimestamp: null,
        nextCheckRequired: null,
        nextCheckTimestamp: null,
        isModalOpen: false,
      };

      await AsyncStorage.setItem(`@lone_worker_state_${finalGuardId}`, JSON.stringify(lwState));
      await AsyncStorage.removeItem('@p1_active_clock_in_session');

      set({
        attendanceStatus: 'Checked Out',
        clockOutTimestamp: nowMs,
        isClockedIn: false,
        isClockedOut: true,
        activePatrol: null,
        loneWorker: lwState,
      });

      await get().loadGuardData(finalGuardId, finalGuardEmail);
      LoggerService.log(`[useGuardStore] clockOut completed successfully for ${finalGuardId}`);
    } catch (error: any) {
      LoggerService.log(`[useGuardStore] clockOut error: ${error?.message || error}`, 'error');
      throw error;
    }
  },

  applyLeave: async (leave) => {
    let { guardId, guardEmail, guardName, leaveBalances } = get();
    const authUser = useAuthStore.getState().user;

    const finalGuardId = guardId || authUser?.id || authUser?.employeeId || 'G-1001';
    const finalGuardEmail = guardEmail || authUser?.email || 'john@priority-one.io';
    const finalGuardName = guardName || authUser?.name || 'John Smith';

    const newLeave: DBLeave = {
      id: `lv-${Date.now()}`,
      employeeId: finalGuardId,
      employeeName: finalGuardName,
      employeeEmail: finalGuardEmail,
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
    const leaveTypeKey = (leave.type.toLowerCase().includes('annual') ? 'annual' :
      leave.type.toLowerCase().includes('sick') ? 'sick' : 'casual') as keyof DBLeaveBalances;

    const updatedBalances = { ...(leaveBalances || { annual: 12, sick: 5, casual: 3 }) };
    if (leaveTypeKey in updatedBalances) {
      updatedBalances[leaveTypeKey] = Math.max(0, (updatedBalances[leaveTypeKey] || 0) - leave.days);
      await saveLeaveBalances(finalGuardId, updatedBalances);
    }

    // Create Notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: finalGuardId,
      title: 'Leave Request Submitted',
      message: `Your ${leave.type} request for ${leave.days} day(s) is pending approval.`,
      read: false,
      createdAt: new Date().toISOString()
    };
    const newMappedLeave: LeaveRequest = {
      id: newLeave.id,
      type: newLeave.type,
      fromDate: newLeave.startDate,
      toDate: newLeave.endDate,
      days: newLeave.days,
      reason: newLeave.reason,
      status: 'Pending',
      appliedDate: newLeave.appliedOn,
    };

    set(state => ({
      leaveBalances: updatedBalances,
      leaves: [newMappedLeave, ...(state.leaves || []).filter(l => l.id !== newLeave.id)]
    }));

    await get().loadGuardData(finalGuardId, finalGuardEmail);
    LoggerService.log(`[useGuardStore] applyLeave succeeded for ${finalGuardId} (${leave.type})`);
  },

  updateLeave: async (leaveId, leave) => {
    let { guardId, guardEmail, leaves, leaveBalances } = get();
    const authUser = useAuthStore.getState().user;
    const finalGuardId = guardId || authUser?.id || authUser?.employeeId || 'G-1001';
    const finalGuardEmail = guardEmail || authUser?.email || 'john@priority-one.io';

    const existingLeave = leaves.find(l => l.id === leaveId);
    if (!existingLeave) return;

    const oldDays = existingLeave.days || 0;
    const newDays = leave.days || 0;

    const oldTypeKey = (existingLeave.type.toLowerCase().includes('annual') ? 'annual' :
      existingLeave.type.toLowerCase().includes('sick') ? 'sick' : 'casual') as keyof DBLeaveBalances;
    const newTypeKey = (leave.type.toLowerCase().includes('annual') ? 'annual' :
      leave.type.toLowerCase().includes('sick') ? 'sick' : 'casual') as keyof DBLeaveBalances;

    const updatedBalances = { ...(leaveBalances || { annual: 12, sick: 5, casual: 3 }) };

    // Restore old days first
    if (oldTypeKey in updatedBalances) {
      updatedBalances[oldTypeKey] = (updatedBalances[oldTypeKey] || 0) + oldDays;
    }
    // Deduct new days
    if (newTypeKey in updatedBalances) {
      updatedBalances[newTypeKey] = Math.max(0, (updatedBalances[newTypeKey] || 0) - newDays);
    }

    await saveLeaveBalances(finalGuardId, updatedBalances);

    // Update leave DB record in AsyncStorage
    await updateRow<DBLeave>('leaves', leaveId, {
      type: leave.type,
      startDate: leave.fromDate,
      endDate: leave.toDate,
      days: leave.days,
      reason: leave.reason,
    });

    set({ leaveBalances: updatedBalances });
    await get().loadGuardData(finalGuardId, finalGuardEmail);
  },

  cancelLeave: async (leaveId) => {
    let { guardId, guardEmail, leaves, leaveBalances } = get();
    const authUser = useAuthStore.getState().user;
    const finalGuardId = guardId || authUser?.id || authUser?.employeeId || 'G-1001';
    const finalGuardEmail = guardEmail || authUser?.email || 'john@priority-one.io';

    const existingLeave = leaves.find(l => l.id === leaveId);
    if (!existingLeave) return;

    const leaveDays = existingLeave.days || 0;
    const leaveTypeKey = (existingLeave.type.toLowerCase().includes('annual') ? 'annual' :
      existingLeave.type.toLowerCase().includes('sick') ? 'sick' : 'casual') as keyof DBLeaveBalances;

    const updatedBalances = { ...(leaveBalances || { annual: 12, sick: 5, casual: 3 }) };
    if (leaveTypeKey in updatedBalances) {
      updatedBalances[leaveTypeKey] = (updatedBalances[leaveTypeKey] || 0) + leaveDays;
      await saveLeaveBalances(finalGuardId, updatedBalances);
    }

    // Update status to 'cancelled' in DB
    await updateRow<DBLeave>('leaves', leaveId, {
      status: 'cancelled',
    });

    // Create notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: finalGuardId,
      title: 'Leave Application Cancelled',
      message: `Your ${existingLeave.type} request for ${existingLeave.fromDate} has been cancelled.`,
      read: false,
      createdAt: new Date().toISOString()
    };
    await insertRow('notifications', newNotif);

    set(state => ({
      leaveBalances: updatedBalances,
      leaves: (state.leaves || []).map(l => l.id === leaveId ? { ...l, status: 'Cancelled' } : l)
    }));

    await get().loadGuardData(finalGuardId, finalGuardEmail);
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
      LoggerService.log('[useGuardStore] startPatrol blocked: Guard is not clocked in.', 'warn');
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
      { id: '1', name: 'Main Gate', number: 'CP-01', location: 'Entrance', scheduledTime: '02:15 PM', status: 'Pending', qrCode: 'CP-01' },
      { id: '2', name: 'Reception Lobby', number: 'CP-02', location: 'Tower A', scheduledTime: '02:30 PM', status: 'Pending', qrCode: 'CP-02' },
      { id: '3', name: 'Parking Level 1', number: 'CP-03', location: 'Basement', scheduledTime: '02:45 PM', status: 'Pending', qrCode: 'CP-03' },
      { id: '4', name: 'Server Room', number: 'CP-04', location: 'Tower B', scheduledTime: '03:00 PM', status: 'Pending', qrCode: 'CP-04' },
      { id: '5', name: 'Emergency Exit', number: 'CP-05', location: 'Rear Gate', scheduledTime: '03:15 PM', status: 'Pending', qrCode: 'CP-05' },
    ];

    // We need to resolve which patrol id is running
    const reloadedPatrols = await getTable<DBPatrol>('patrols');
    const runningPatrol = reloadedPatrols.find(p => p.guardId === guardId && p.status === 'in_progress');
    if (runningPatrol) {
      await AsyncStorage.setItem(`p1_db_patrol_checkpoints_${runningPatrol.id}`, JSON.stringify(defaultCPs));
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

    const { guardId, guardName, assignedSite } = get();
    const dateCode = `${yyyy}${mm}${dd}`;
    const empName = guardName || 'John Smith';
    const siteName = assignedSite || 'Ahmedabad Plant';

    const newPatrols: DBPatrol[] = [
      {
        id: `patrol-${dateKey}-slot-14`,
        patrolCode: `PT-${dateCode}-01`,
        title: 'Afternoon Perimeter Patrol',
        companyId: 'c-1',
        site: siteName,
        siteId: 's-01',
        route: 'Perimeter Route A',
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
        id: `patrol-${dateKey}-slot-15`,
        patrolCode: `PT-${dateCode}-02`,
        title: 'Mid-Afternoon Facility Patrol',
        companyId: 'c-1',
        site: siteName,
        siteId: 's-01',
        route: 'Facility Internal Route',
        guard: empName,
        guardId: guardId || 'G-1001',
        date: dateKey,
        startTime: '03:00 PM',
        scheduledStartTime: '03:00 PM',
        scheduledEndTime: '04:00 PM',
        startBufferMinutes: 15,
        status: 'Scheduled',
        checkpoints: 5,
        scanned: 0,
        missed: 0,
        incidents: 0,
        lastCheckpoint: 'Pending Start',
      },
      {
        id: `patrol-${dateKey}-slot-16`,
        patrolCode: `PT-${dateCode}-03`,
        title: 'Late Afternoon Security Patrol',
        companyId: 'c-1',
        site: siteName,
        siteId: 's-01',
        route: 'Security Sector B Route',
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
        id: `patrol-${dateKey}-slot-17`,
        patrolCode: `PT-${dateCode}-04`,
        title: 'Shift Change Patrol',
        companyId: 'c-1',
        site: siteName,
        siteId: 's-01',
        route: 'Perimeter Route B',
        guard: empName,
        guardId: guardId || 'G-1001',
        date: dateKey,
        startTime: '05:00 PM',
        scheduledStartTime: '05:00 PM',
        scheduledEndTime: '06:00 PM',
        startBufferMinutes: 15,
        status: 'Scheduled',
        checkpoints: 5,
        scanned: 0,
        missed: 0,
        incidents: 0,
        lastCheckpoint: 'Pending Start',
      },
      {
        id: `patrol-${dateKey}-slot-18`,
        patrolCode: `PT-${dateCode}-05`,
        title: 'Early Evening Perimeter Patrol',
        companyId: 'c-1',
        site: siteName,
        siteId: 's-01',
        route: 'Main Entrance & Gate Route',
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
        id: `patrol-${dateKey}-slot-19`,
        patrolCode: `PT-${dateCode}-06`,
        title: 'Evening Main Patrol',
        companyId: 'c-1',
        site: siteName,
        siteId: 's-01',
        route: 'Evening Perimeter Route',
        guard: empName,
        guardId: guardId || 'G-1001',
        date: dateKey,
        startTime: '07:00 PM',
        scheduledStartTime: '07:00 PM',
        scheduledEndTime: '08:00 PM',
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

    // Filter existing items for this date
    const existingForDate = allDbPatrols.filter(p => isSameDate(p.date, dateKey) || formatDisplayDate(p.date).toLowerCase() === displayDateStr.toLowerCase());

    const hasLegacy = existingForDate.some(p =>
      p.title === 'Morning Perimeter Patrol' ||
      p.title === 'Evening Perimeter Patrol' ||
      p.scheduledStartTime === '08:00 AM' ||
      (p.scheduledStartTime === '08:00 PM' && p.scheduledEndTime === '09:00 PM')
    );

    const missingSlots = newPatrols.filter(slot => !allDbPatrols.some(p => p.id === slot.id));

    if (hasLegacy || missingSlots.length > 0) {
      // Safely remove only specific legacy items without wiping user progress for current slots
      if (hasLegacy) {
        allDbPatrols = allDbPatrols.filter(p => {
          const isTarget = isSameDate(p.date, dateKey) || formatDisplayDate(p.date).toLowerCase() === displayDateStr.toLowerCase();
          if (!isTarget) return true;
          return !(
            p.title === 'Morning Perimeter Patrol' ||
            p.title === 'Evening Perimeter Patrol' ||
            p.scheduledStartTime === '08:00 AM' ||
            (p.scheduledStartTime === '08:00 PM' && p.scheduledEndTime === '09:00 PM')
          );
        });
      }

      // Add missing default slots while preserving existing user-modified slots intact
      for (const slot of newPatrols) {
        if (!allDbPatrols.some(p => p.id === slot.id)) {
          allDbPatrols.push(slot);
        }
      }

      await saveTable('patrols', allDbPatrols);
    }

    const guardPatrols = allDbPatrols.filter(p =>
      p.guardId === guardId || p.guard === empName || p.guardId === 'G-1001' || p.guardId === 'guard-1' || !p.guardId
    );

    set({ patrols: guardPatrols });
  },

  loadPatrolCheckpoints: async (patrolId: string): Promise<CheckpointData[]> => {
    if (!patrolId) return [];
    const { patrols } = get();
    const targetPat = (patrols || []).find(p => p.id === patrolId);

    const key = `p1_db_patrol_checkpoints_${patrolId}`;
    const raw = await AsyncStorage.getItem(key);
    let cps: CheckpointData[] = [];
    if (raw) {
      try {
        cps = JSON.parse(raw);
      } catch {
        cps = [];
      }
    }

    const defaultCPs: CheckpointData[] = [
      { id: '1', name: 'Main Gate', number: 'CP-01', location: 'Entrance', scheduledTime: '02:15 PM', status: 'Pending', qrCode: 'CP-01' },
      { id: '2', name: 'Reception Lobby', number: 'CP-02', location: 'Tower A', scheduledTime: '02:30 PM', status: 'Pending', qrCode: 'CP-02' },
      { id: '3', name: 'Parking Level 1', number: 'CP-03', location: 'Basement', scheduledTime: '02:45 PM', status: 'Pending', qrCode: 'CP-03' },
      { id: '4', name: 'Server Room', number: 'CP-04', location: 'Tower B', scheduledTime: '03:00 PM', status: 'Pending', qrCode: 'CP-04' },
      { id: '5', name: 'Emergency Exit', number: 'CP-05', location: 'Rear Gate', scheduledTime: '03:15 PM', status: 'Pending', qrCode: 'CP-05' },
    ];

    if (!cps || cps.length === 0) {
      cps = [...defaultCPs];
    }

    // Synchronize checkpoint statuses with targetPat status and scanned count
    if (targetPat) {
      const isCompleted = targetPat.status === 'Completed' || targetPat.status === 'completed';
      const scannedCount = isCompleted ? cps.length : (targetPat.scanned || 0);

      cps = cps.map((cp, idx) => {
        if (isCompleted || idx < scannedCount) {
          return {
            ...cp,
            status: 'Completed',
            scanTime: cp.scanTime || 'Verified',
          };
        }
        return cp;
      });
      await AsyncStorage.setItem(key, JSON.stringify(cps));
    }

    return cps;
  },

  scanCheckpointCode: async (code: string, specificPatrolId?: string) => {
    let { activePatrol, guardId, guardEmail, patrols, isClockedIn } = get();
    if (!guardId) {
      const authUser = useAuthStore.getState().user;
      guardId = authUser?.id || authUser?.employeeId || 'G-1001';
    }
    if (!isClockedIn) {
      return { success: false, message: 'Please Clock In before scanning checkpoints.' };
    }

    let targetPat = (specificPatrolId ? (patrols || []).find(p => p.id === specificPatrolId) : null) || activePatrol;
    if (!targetPat) {
      await get().startPatrol();
      const updated = get();
      targetPat = updated.activePatrol;
    }

    if (!targetPat || targetPat.status === 'Completed' || targetPat.status === 'completed') {
      return { success: false, message: 'Patrol Completed' };
    }

    const key = `p1_db_patrol_checkpoints_${targetPat.id}`;
    const cps = await get().loadPatrolCheckpoints(targetPat.id);

    const cleanCode = (code || '').trim().toUpperCase();
    const cpIndex = cps.findIndex(
      c => (c.qrCode || '').trim().toUpperCase() === cleanCode ||
        (c.number || '').trim().toUpperCase() === cleanCode ||
        (c.id || '').trim().toUpperCase() === cleanCode ||
        cleanCode.includes((c.number || '').trim().toUpperCase())
    );

    if (cpIndex === -1) {
      return { success: false, message: 'Invalid Checkpoint QR Code' };
    }

    const cp = cps[cpIndex];
    if (cp.status === 'Completed') {
      return { success: false, message: 'Checkpoint Already Completed' };
    }

    const updatedCPs = [...cps];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updatedCPs[cpIndex] = {
      ...cp,
      status: 'Completed',
      scanTime: nowTime,
    };

    await AsyncStorage.setItem(key, JSON.stringify(updatedCPs));

    const totalScanned = updatedCPs.filter(c => c.status === 'Completed').length;
    const totalCount = updatedCPs.length;
    const isFinished = totalScanned >= totalCount;
    const nextStatus = isFinished ? 'Completed' : 'in_progress';

    await updateRow<DBPatrol>('patrols', targetPat.id, {
      scanned: totalScanned,
      checkpoints: totalCount,
      status: nextStatus,
      endTime: isFinished ? nowTime : (targetPat.endTime || ''),
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
      // Create Completion Notification
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
