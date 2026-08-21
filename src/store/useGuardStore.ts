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
  scanCheckpointCode: (code: string) => Promise<{ success: boolean; message: string }>;
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
      id: 'PT-2026-0821-01',
      patrolCode: 'PT-2026-0821-01',
      title: 'Morning Perimeter Patrol',
      companyId: 'c-1',
      site: 'Ahmedabad Plant',
      route: 'Morning Perimeter Route',
      guard: 'Khushi Rani',
      guardId: 'guard-1',
      date: 'Aug 21, 2026',
      startTime: '08:00 AM',
      endTime: '08:45 AM',
      scheduledStartTime: '08:00 AM',
      scheduledEndTime: '09:00 AM',
      startBufferMinutes: 15,
      status: 'Completed',
      checkpoints: 5,
      scanned: 5,
      missed: 0,
      incidents: 0,
      lastCheckpoint: 'Emergency Exit B',
    },
    {
      id: 'PT-2026-0821-02',
      patrolCode: 'PT-2026-0821-02',
      title: 'Evening Plant Security Patrol',
      companyId: 'c-1',
      site: 'Ahmedabad Plant',
      route: 'Plant Floor & Storage Bay',
      guard: 'Khushi Rani',
      guardId: 'guard-1',
      date: 'Aug 21, 2026',
      startTime: '06:00 PM',
      endTime: undefined,
      scheduledStartTime: '06:00 PM',
      scheduledEndTime: '07:30 PM',
      startBufferMinutes: 15,
      status: 'In Progress',
      checkpoints: 5,
      scanned: 2,
      missed: 0,
      incidents: 0,
      lastCheckpoint: 'Reception & Lobby Hall',
    },
    {
      id: 'PT-2026-0820-01',
      patrolCode: 'PT-2026-0820-01',
      title: 'Chemical Storage Area Inspection',
      companyId: 'c-1',
      site: 'Ahmedabad Plant',
      route: 'Chemical Bay Route',
      guard: 'Khushi Rani',
      guardId: 'guard-1',
      date: 'Aug 20, 2026',
      startTime: '02:00 PM',
      endTime: '02:35 PM',
      scheduledStartTime: '02:00 PM',
      scheduledEndTime: '03:00 PM',
      startBufferMinutes: 15,
      status: 'Completed',
      checkpoints: 4,
      scanned: 4,
      missed: 0,
      incidents: 1,
      lastCheckpoint: 'Chemical Storage Tank 2',
    },
    {
      id: 'PT-2026-0819-01',
      patrolCode: 'PT-2026-0819-01',
      title: 'South Dock Security Sweep',
      companyId: 'c-1',
      site: 'Ahmedabad Plant',
      route: 'South Loading Dock Route',
      guard: 'Khushi Rani',
      guardId: 'guard-1',
      date: 'Aug 19, 2026',
      startTime: '11:00 AM',
      endTime: '11:40 AM',
      scheduledStartTime: '11:00 AM',
      scheduledEndTime: '12:00 PM',
      startBufferMinutes: 15,
      status: 'Completed',
      checkpoints: 5,
      scanned: 5,
      missed: 0,
      incidents: 0,
      lastCheckpoint: 'Gate 4 Security Post',
    },
  ],
  activePatrol: {
    id: 'PT-2026-0821-02',
    patrolCode: 'PT-2026-0821-02',
    title: 'Evening Plant Security Patrol',
    companyId: 'c-1',
    site: 'Ahmedabad Plant',
    route: 'Plant Floor & Storage Bay',
    guard: 'Khushi Rani',
    guardId: 'guard-1',
    date: 'Aug 21, 2026',
    startTime: '06:00 PM',
    endTime: undefined,
    scheduledStartTime: '06:00 PM',
    scheduledEndTime: '07:30 PM',
    startBufferMinutes: 15,
    status: 'In Progress',
    checkpoints: 5,
    scanned: 2,
    missed: 0,
    incidents: 0,
    lastCheckpoint: 'Reception & Lobby Hall',
  },
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
  loneWorkerHistory: [
    {
      id: 'lw-101',
      guardId: 'guard-1',
      guardName: 'Khushi Rani',
      dateStr: 'Aug 18, 2026',
      exactTime: '10:00:15 AM',
      siteName: 'Ahmedabad Plant (Ranucle Zundal)',
      latitude: 23.1145,
      longitude: 72.5821,
      distanceMeters: 42,
      radiusMeters: 200,
      gpsStatus: 'GPS Verified',
      onTimeStatus: 'On Time',
      status: 'Safe',
      shiftInfo: 'Morning Shift (08:00 AM - 04:00 PM)',
      timestamp: Date.now() - 3600000,
    },
    {
      id: 'lw-102',
      guardId: 'guard-1',
      guardName: 'Khushi Rani',
      dateStr: 'Aug 18, 2026',
      exactTime: '09:00:10 AM',
      siteName: 'Ahmedabad Plant (Ranucle Zundal)',
      latitude: 23.1148,
      longitude: 72.5823,
      distanceMeters: 55,
      radiusMeters: 200,
      gpsStatus: 'GPS Verified',
      onTimeStatus: 'On Time',
      status: 'Safe',
      shiftInfo: 'Morning Shift (08:00 AM - 04:00 PM)',
      timestamp: Date.now() - 7200000,
    },
    {
      id: 'lw-103',
      guardId: 'guard-1',
      guardName: 'Khushi Rani',
      dateStr: 'Aug 17, 2026',
      exactTime: '03:45:00 PM',
      siteName: 'Ahmedabad Plant (Ranucle Zundal)',
      latitude: 23.1142,
      longitude: 72.5819,
      distanceMeters: 38,
      radiusMeters: 200,
      gpsStatus: 'GPS Verified',
      onTimeStatus: 'On Time',
      status: 'Safe',
      shiftInfo: 'Day Shift (08:00 AM - 04:00 PM)',
      timestamp: Date.now() - 86400000,
    },
    {
      id: 'lw-104',
      guardId: 'guard-1',
      guardName: 'Khushi Rani',
      dateStr: 'Aug 17, 2026',
      exactTime: '02:30:12 PM',
      siteName: 'Ahmedabad Plant (Ranucle Zundal)',
      latitude: 23.1210,
      longitude: 72.5910,
      distanceMeters: 850,
      radiusMeters: 200,
      gpsStatus: 'Location Not Verified',
      onTimeStatus: 'Late Check-In',
      status: 'Safe',
      shiftInfo: 'Day Shift (08:00 AM - 04:00 PM)',
      timestamp: Date.now() - 90000000,
    },
  ],

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

      const defaultAug21Patrols: DBPatrol[] = [
        {
          id: 'patrol-aug21-morning',
          patrolCode: 'PT-2026-0821-01',
          title: 'Morning Perimeter Patrol',
          companyId: 'c-1',
          site: emp?.site || 'Ahmedabad Plant',
          siteId: emp?.siteId || 's-01',
          route: 'Morning Perimeter Route',
          guard: emp?.name || 'Khushi Rani',
          guardId: guardId,
          date: '2026-08-21',
          startTime: '08:00 AM',
          endTime: '08:45 AM',
          scheduledStartTime: '08:00 AM',
          scheduledEndTime: '09:00 AM',
          startBufferMinutes: 15,
          status: 'Completed',
          checkpoints: 5,
          scanned: 5,
          missed: 0,
          incidents: 0,
          lastCheckpoint: 'Emergency Exit B',
        },
        {
          id: 'patrol-aug21-evening',
          patrolCode: 'PT-2026-0821-02',
          title: 'Evening Perimeter Patrol',
          companyId: 'c-1',
          site: emp?.site || 'Ahmedabad Plant',
          siteId: emp?.siteId || 's-01',
          route: 'Evening Perimeter Route',
          guard: emp?.name || 'Khushi Rani',
          guardId: guardId,
          date: '2026-08-21',
          startTime: '08:00 PM',
          endTime: undefined,
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
      ];

      let needsPatrolSave = false;
      for (const p of defaultAug21Patrols) {
        const existingIdx = allPatrols.findIndex(item => item.id === p.id);
        if (existingIdx === -1) {
          allPatrols.push(p);
          needsPatrolSave = true;
        } else if (p.id === 'patrol-aug21-evening') {
          // Sync schedule for 08:00 PM (buffer 07:45 PM)
          allPatrols[existingIdx] = {
            ...allPatrols[existingIdx],
            scheduledStartTime: '08:00 PM',
            scheduledEndTime: '09:00 PM',
            startTime: '08:00 PM',
            status: 'Scheduled',
            scanned: 0,
          };
          needsPatrolSave = true;
        }
      }

      // Invalidate/cleanup old stale active patrol status from past dates (Aug 18, Aug 17)
      allPatrols = allPatrols.map(p => {
        const isToday = p.date === '2026-08-21' || p.date === 'Aug 21, 2026';
        if (!isToday && (p.status === 'in_progress' || p.status === 'In Progress')) {
          needsPatrolSave = true;
          return { ...p, status: 'Completed', endTime: p.endTime || '09:00 PM' };
        }
        return p;
      });

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

      // Check current attendance state from today's attendance records
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecords = guardAtt.filter(a => a.date === todayStr);

      const openRecord = todayRecords.slice().reverse().find(a => a.clockIn && !a.clockOut);
      const latestCompletedRecord = todayRecords.slice().reverse().find(a => a.clockIn && a.clockOut);

      let attStatus: AttendanceStatus = 'Not Checked In';
      let clockInTime: number | null = null;
      let clockOutTime: number | null = null;

      const safeParseMs = (str: string | null | undefined): number | null => {
        if (!str) return null;
        const d = new Date(str);
        if (!isNaN(d.getTime())) return d.getTime();
        const n = Number(str);
        if (!isNaN(n) && n > 0) return n;
        return null;
      };

      const formatTime12h = (timestamp: number | null): string => {
        if (!timestamp) return '--:--';
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return '--:--';
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };

      if (openRecord && openRecord.clockIn) {
        attStatus = 'Checked In';
        clockInTime = safeParseMs(openRecord.clockIn);
        clockOutTime = null;
      } else if (latestCompletedRecord && latestCompletedRecord.clockIn && latestCompletedRecord.clockOut) {
        attStatus = 'Checked Out';
        clockInTime = safeParseMs(latestCompletedRecord.clockIn);
        clockOutTime = safeParseMs(latestCompletedRecord.clockOut);
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
      }

      // Find active patrol or resolve primary patrol for TODAY (Aug 21, 2026) ONLY
      const todayPatrols = guardPatrols.filter(p => p.date === '2026-08-21' || p.date === 'Aug 21, 2026');
      let activePat = todayPatrols.find(p => p.status === 'in_progress' || p.status === 'In Progress')
        || todayPatrols.find(p => p.id === 'patrol-aug21-evening')
        || todayPatrols[0]
        || null;

      // Load active checkpoints for this exact patrol
      let activeCPs: CheckpointData[] = [];
      const cpsRaw = await AsyncStorage.getItem(`p1_db_patrol_checkpoints_${activePat.id}`);
      if (cpsRaw) {
        try {
          activeCPs = JSON.parse(cpsRaw);
        } catch (e) {
          activeCPs = [];
        }
      }

      if (!activeCPs || activeCPs.length === 0) {
        // Initialize default checkpoints for Ahmedabad Plant
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

      // Find today's shift
      const todayShift = guardShifts.find(s => s.date === todayStr) || guardShifts[0] || null;

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

      // INJECT MOCK DATA FOR AUGUST 2026 (UP TO TODAY, AUG 20)
      const presentDates = [3, 4, 5, 7, 10, 11, 13, 17];
      presentDates.forEach(d => {
        const dateStr = `2026-08-${String(d).padStart(2, '0')}`;
        if (!mappedHistory.some(a => a.date === dateStr)) {
          mappedHistory.push({
            id: `mock-att-${d}`,
            date: dateStr,
            day: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' }),
            siteName: 'Ahmedabad Plant',
            shiftName: 'Morning Shift 08:00 AM - 04:00 PM',
            clockIn: `${dateStr}T08:00:00.000Z`,
            clockOut: `${dateStr}T17:00:00.000Z`,
            workingHours: 9,
            status: 'Present',
            notes: 'Standard shift',
          });
        }
      });

      // Inject Half Day records (Aug 6, Aug 18)
      if (!mappedHistory.some(a => a.date === '2026-08-06')) {
        mappedHistory.push({
          id: 'mock-att-06',
          date: '2026-08-06',
          day: 'Thursday',
          siteName: 'Ahmedabad Plant',
          shiftName: 'Morning Shift 08:00 AM - 04:00 PM',
          clockIn: '2026-08-06T08:00:00.000Z',
          clockOut: '2026-08-06T12:00:00.000Z',
          workingHours: 4,
          status: 'Half Day',
          notes: 'Half day duty',
        });
      }
      if (!mappedHistory.some(a => a.date === '2026-08-18')) {
        mappedHistory.push({
          id: 'mock-att-18',
          date: '2026-08-18',
          day: 'Tuesday',
          siteName: 'Ahmedabad Plant',
          shiftName: 'Morning Shift 08:00 AM - 04:00 PM',
          clockIn: '2026-08-18T08:04:00.000Z',
          clockOut: '2026-08-18T12:05:00.000Z',
          workingHours: 4.016,
          status: 'Half Day',
          notes: 'Half day duty',
        });
      }

      // Inject 3-session Present record on Aug 20 (Today: Total Hours 8h 00m)
      if (!mappedHistory.some(a => a.id === 'mock-att-20-1')) {
        mappedHistory.push(
          {
            id: 'mock-att-20-1',
            date: '2026-08-20',
            day: 'Thursday',
            siteName: 'Ahmedabad Plant',
            shiftName: 'Morning Shift 08:00 AM - 04:00 PM',
            clockIn: '2026-08-20T08:00:00.000Z',
            clockOut: '2026-08-20T12:00:00.000Z',
            workingHours: 4,
            status: 'Present',
            notes: 'Session 1',
          },
          {
            id: 'mock-att-20-2',
            date: '2026-08-20',
            day: 'Thursday',
            siteName: 'Ahmedabad Plant',
            shiftName: 'Morning Shift 08:00 AM - 04:00 PM',
            clockIn: '2026-08-20T12:45:00.000Z',
            clockOut: '2026-08-20T15:00:00.000Z',
            workingHours: 2.25,
            status: 'Present',
            notes: 'Session 2',
          },
          {
            id: 'mock-att-20-3',
            date: '2026-08-20',
            day: 'Thursday',
            siteName: 'Ahmedabad Plant',
            shiftName: 'Morning Shift 08:00 AM - 04:00 PM',
            clockIn: '2026-08-20T15:30:00.000Z',
            clockOut: '2026-08-20T17:15:00.000Z',
            workingHours: 1.75,
            status: 'Present',
            notes: 'Session 3',
          }
        );
      }

      // Inject 2-session record with Active open session on Aug 14
      if (!mappedHistory.some(a => a.id === 'mock-att-14-1')) {
        mappedHistory.push(
          {
            id: 'mock-att-14-1',
            date: '2026-08-14',
            day: 'Friday',
            siteName: 'Ahmedabad Plant',
            shiftName: 'Morning Shift 08:00 AM - 04:00 PM',
            clockIn: '2026-08-14T08:05:00.000Z',
            clockOut: '2026-08-14T12:00:00.000Z',
            workingHours: 3.916,
            status: 'Present',
            notes: 'Completed session 1',
          },
          {
            id: 'mock-att-14-2',
            date: '2026-08-14',
            day: 'Friday',
            siteName: 'Ahmedabad Plant',
            shiftName: 'Morning Shift 08:00 AM - 04:00 PM',
            clockIn: '2026-08-14T13:00:00.000Z',
            clockOut: null,
            workingHours: 0,
            status: 'Present',
            notes: 'Active open session',
          }
        );
      }

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

      set({
        guardId,
        guardEmail: email,
        guardName: emp?.name || 'Security Officer',
        phone: emp?.phone || '+1 415 555 0101',
        dateOfBirth: emp?.dateOfBirth || 'Oct 12, 1990',
        gender: emp?.gender || 'Male',
        bloodGroup: emp?.bloodGroup || 'O+',
        address: emp?.address || '123 Main St, Springfield, IL',
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
      const { guardId, guardEmail, guardName, assignedSite, assignedSiteId } = get();
      if (!guardId) {
        LoggerService.log('[useGuardStore] clockIn failed: guardId is null', 'warn');
        throw new Error('Cannot clock in: current guard identity has not been initialized.');
      }

      const now = Date.now();
      const todayStr = new Date(now).toISOString().split('T')[0];
      const newRecord: DBAttendance = {
        id: `att-${Date.now()}`,
        employeeId: guardId,
        employeeName: guardName,
        employeeEmail: guardEmail || '',
        badge: `GRD-${guardId.slice(-3).toUpperCase()}`,
        role: 'guard',
        date: todayStr,
        shift: 'Morning Shift 08:00 AM - 04:00 PM',
        clockIn: new Date(now).toISOString(),
        clockOut: null,
        status: 'present',
        siteId: assignedSiteId,
        siteName: assignedSite,
        companyId: 'c-1',
      };

      await insertRow('attendance', newRecord);

      // Create Notification
      const newNotif = {
        id: `notif-${Date.now()}`,
        userId: guardId,
        title: 'Clocked In Successfully',
        message: `You clocked in at ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} at ${assignedSite}.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      await insertRow('notifications', newNotif);

      const nowMs = Date.now();
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

      set({
        attendanceStatus: 'Checked In',
        clockInTimestamp: nowMs,
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
      const todayStr = new Date(nowMs).toISOString().split('T')[0];
      const currentAtt = await getTable<DBAttendance>('attendance');
      const todayRecord = currentAtt.slice().reverse().find(a => a.employeeId === guardId && a.date === todayStr && !a.clockOut)
        || currentAtt.slice().reverse().find(a => a.employeeId === guardId && a.date === todayStr);

      if (todayRecord) {
        const inT = (todayRecord.clockIn ? new Date(todayRecord.clockIn).getTime() : 0) || clockInTimestamp || nowMs;
        const outT = nowMs;
        const diffHrs = Math.max(0.01, (outT - inT) / (1000 * 3600)).toFixed(2) + ' hrs';

        await updateRow<DBAttendance>('attendance', todayRecord.id, {
          clockOut: nowStr,
          workingHours: diffHrs,
        });

        // Create Notification
        const newNotif = {
          id: `notif-${Date.now()}`,
          userId: guardId,
          title: 'Clocked Out Successfully',
          message: `You clocked out at ${new Date(nowStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Total: ${diffHrs}.`,
          read: false,
          createdAt: new Date().toISOString()
        };
        await insertRow('notifications', newNotif);
        LoggerService.log(`[useGuardStore] clockOut update complete for record ${todayRecord.id}`);
      } else {
        const fallbackRecord: DBAttendance = {
          id: `att-${nowMs}`,
          employeeId: guardId,
          employeeName: get().guardName || 'Security Officer',
          employeeEmail: guardEmail || '',
          badge: `GRD-${guardId.slice(-3).toUpperCase()}`,
          role: 'guard',
          date: todayStr,
          shift: 'Morning Shift 08:00 AM - 04:00 PM',
          clockIn: clockInTimestamp ? new Date(clockInTimestamp).toISOString() : new Date(nowMs - 8 * 3600 * 1000).toISOString(),
          clockOut: nowStr,
          workingHours: '8.00 hrs',
          status: 'present',
          siteId: get().assignedSiteId || 's-01',
          siteName: assignedSite || 'Assigned Site',
          companyId: 'c-1',
        };
        await insertRow('attendance', fallbackRecord);

        const newNotif = {
          id: `notif-${Date.now()}`,
          userId: guardId,
          title: 'Clocked Out Successfully',
          message: `You clocked out at ${new Date(nowStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          read: false,
          createdAt: new Date().toISOString()
        };
        await insertRow('notifications', newNotif);
        LoggerService.log(`[useGuardStore] clockOut fallback record created for ${guardId}`);
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
    const { guardId, guardEmail, patrols } = get();
    if (!guardId) return;

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

  scanCheckpointCode: async (code: string) => {
    let { activePatrol, guardId, guardEmail, patrolCheckpoints, patrols } = get();
    if (!guardId) return { success: false, message: 'User not logged in' };

    // If no active patrol exists, start default patrol
    if (!activePatrol) {
      await get().startPatrol();
      const updated = get();
      activePatrol = updated.activePatrol;
      patrolCheckpoints = updated.patrolCheckpoints;
    }

    if (!activePatrol || activePatrol.status === 'Completed' || activePatrol.status === 'completed') {
      return { success: false, message: 'Patrol Completed' };
    }

    const cleanCode = (code || '').trim().toUpperCase();
    const cpIndex = patrolCheckpoints.findIndex(
      c => (c.qrCode || '').trim().toUpperCase() === cleanCode ||
           (c.number || '').trim().toUpperCase() === cleanCode ||
           (c.id || '').trim().toUpperCase() === cleanCode ||
           cleanCode.includes((c.number || '').trim().toUpperCase())
    );

    if (cpIndex === -1) {
      return { success: false, message: 'Invalid Checkpoint QR Code' };
    }

    const cp = patrolCheckpoints[cpIndex];
    if (cp.status === 'Completed') {
      return { success: false, message: 'Checkpoint Already Completed' };
    }

    const updatedCPs = [...patrolCheckpoints];
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    updatedCPs[cpIndex] = {
      ...cp,
      status: 'Completed',
      scanTime: nowTime,
    };

    await AsyncStorage.setItem(`p1_db_patrol_checkpoints_${activePatrol.id}`, JSON.stringify(updatedCPs));

    const totalScanned = updatedCPs.filter(c => c.status === 'Completed').length;
    const totalCount = updatedCPs.length;
    const isFinished = totalScanned >= totalCount;
    const nextStatus = isFinished ? 'Completed' : 'in_progress';

    await updateRow<DBPatrol>('patrols', activePatrol.id, {
      scanned: totalScanned,
      checkpoints: totalCount,
      status: nextStatus,
      endTime: isFinished ? nowTime : '',
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
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const nowTimeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const shortTimeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nextMs = nowMs + 30 * 60 * 1000;
    const nextStr = new Date(nextMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const site = get().assignedSite || 'Ahmedabad Plant (Ranucle Zundal)';
    const guardId = get().guardId || 'guard-1';
    const guardName = get().guardName || 'Khushi Rani';

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

    if (guardId) {
      AsyncStorage.setItem(`@lone_worker_state_${guardId}`, JSON.stringify(lwState)).catch(() => { });
    }

    set((state) => ({
      loneWorker: lwState,
      loneWorkerHistory: [newHistoryItem, ...(state.loneWorkerHistory || [])],
    }));
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
