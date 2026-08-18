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
} from '../services/db';
import { LoggerService } from '../services/logger.service';

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
  status: 'SAFE' | 'Checked In' | 'Pending Check-In' | 'Missed Check-In' | string;
  lastCheckIn: string | null;
  lastCheckInTimestamp: number | null;
  nextCheckRequired: string | null;
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
  reportIncident: (incident: Omit<IncidentReport, 'id' | 'status' | 'reportedDate'>) => Promise<void>;
  startPatrol: () => Promise<void>;
  scanCheckpointCode: (code: string) => Promise<{ success: boolean; message: string }>;
  checkInLoneWorker: (customParams?: {
    latitude?: number;
    longitude?: number;
    distanceMeters?: number;
    gpsStatus?: string;
    status?: string;
  }) => void;
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
  notifications: [],
  shifts: [],
  todayShift: null,
  patrols: [],
  activePatrol: null,
  patrolCheckpoints: [],
  messages: [],
  
  loneWorker: {
    status: 'SAFE',
    lastCheckIn: '03:58 PM',
    lastCheckInTimestamp: null,
    nextCheckRequired: '04:28 PM',
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
      const allPatrols = await getTable<DBPatrol>('patrols');
      const guardPatrols = allPatrols.filter(p => p.guardId === guardId || p.guard === emp?.name);
      
      // Resolve leaves
      const allLeaves = await getTable<DBLeave>('leaves');
      const guardLeaves = allLeaves.filter(l => l.employeeId === guardId || l.employeeEmail === email);
      
      // Resolve incidents
      const allIncidents = await getTable<DBIncident>('incidents');
      const guardIncidents = allIncidents.filter(i => i.reportedById === guardId || i.reportedBy === emp?.name);

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
      
      if (openRecord && openRecord.clockIn) {
        attStatus = 'Checked In';
        const parsedIn = openRecord.clockIn.includes('Z') || openRecord.clockIn.includes('T') ? new Date(openRecord.clockIn).getTime() : Date.now();
        clockInTime = parsedIn;
        clockOutTime = null;
      } else if (latestCompletedRecord && latestCompletedRecord.clockIn && latestCompletedRecord.clockOut) {
        attStatus = 'Checked Out';
        const parsedIn = latestCompletedRecord.clockIn.includes('Z') || latestCompletedRecord.clockIn.includes('T') ? new Date(latestCompletedRecord.clockIn).getTime() : Date.now() - 8 * 3600 * 1000;
        const parsedOut = latestCompletedRecord.clockOut.includes('Z') || latestCompletedRecord.clockOut.includes('T') ? new Date(latestCompletedRecord.clockOut).getTime() : Date.now();
        clockInTime = parsedIn;
        clockOutTime = parsedOut;
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
      
      // Find active patrol
      const activePat = guardPatrols.find(p => p.status === 'in_progress') || null;
      
      // Load active checkpoints
      let activeCPs: CheckpointData[] = [];
      if (activePat) {
        const cpsRaw = await AsyncStorage.getItem(`p1_db_patrol_checkpoints_${activePat.id}`);
        if (cpsRaw) {
          activeCPs = JSON.parse(cpsRaw);
        } else {
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
      }
      
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
      
      // Load leave balances
      const leaveBalances = await getLeaveBalances(guardId);
      
      set({
        guardId,
        guardEmail: email,
        guardName: emp?.name || 'Security Officer',
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
        shifts: guardShifts,
        todayShift,
        patrols: guardPatrols,
        activePatrol: activePat,
        patrolCheckpoints: activeCPs,
        notifications: mappedNotifs,
        messages: guardMessages,
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
      const nowClockStr = new Date(nowMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const nextClockStr = new Date(nowMs + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      set({
        loneWorker: {
          status: 'SAFE',
          lastCheckIn: nowClockStr,
          lastCheckInTimestamp: nowMs,
          nextCheckRequired: nextClockStr,
        },
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
      const { guardId, guardEmail, assignedSite } = get();
      if (!guardId) {
        LoggerService.log('[useGuardStore] clockOut failed: guardId is null', 'warn');
        throw new Error('Cannot clock out: current guard identity has not been initialized.');
      }
      
      const todayStr = new Date().toISOString().split('T')[0];
      const currentAtt = await getTable<DBAttendance>('attendance');
      const todayRecord = currentAtt.slice().reverse().find(a => a.employeeId === guardId && a.date === todayStr && !a.clockOut)
        || currentAtt.slice().reverse().find(a => a.employeeId === guardId && a.date === todayStr);
      
      if (todayRecord) {
        const nowStr = new Date().toISOString();
        const inT = new Date(todayRecord.clockIn || nowStr).getTime();
        const outT = new Date(nowStr).getTime();
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
        const now = Date.now();
        const nowStr = new Date(now).toISOString();
        const clockInStr = new Date(now - 8 * 3600 * 1000).toISOString();
        const fallbackRecord: DBAttendance = {
          id: `att-${now}`,
          employeeId: guardId,
          employeeName: get().guardName || 'Security Officer',
          employeeEmail: guardEmail || '',
          badge: `GRD-${guardId.slice(-3).toUpperCase()}`,
          role: 'guard',
          date: todayStr,
          shift: 'Morning Shift 08:00 AM - 04:00 PM',
          clockIn: clockInStr,
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
      
      set({
        loneWorker: {
          status: 'NOT ACTIVE',
          lastCheckIn: null,
          lastCheckInTimestamp: null,
          nextCheckRequired: null,
        },
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

  startPatrol: async () => {
    const { guardId, guardEmail, patrols } = get();
    if (!guardId) return;

    // Find the today's pending patrol or build one
    const activePat = patrols.find(p => p.status === 'pending' || p.status === 'in_progress');
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
    const { activePatrol, guardId, guardEmail, patrolCheckpoints } = get();
    if (!guardId) return { success: false, message: 'User not logged in' };
    if (!activePatrol) return { success: false, message: 'Patrol must be started before scanning.' };

    const cpIndex = patrolCheckpoints.findIndex(c => c.qrCode === code);
    if (cpIndex === -1) {
      return { success: false, message: 'Invalid Checkpoint: This QR code does not belong to your current patrol.' };
    }

    const cp = patrolCheckpoints[cpIndex];
    if (cp.status === 'Completed') {
      return { success: false, message: 'Checkpoint already scanned.' };
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
    const isFinished = totalScanned === activePatrol.checkpoints;
    const nextStatus = isFinished ? 'completed' : 'in_progress';

    await updateRow<DBPatrol>('patrols', activePatrol.id, {
      scanned: totalScanned,
      status: nextStatus,
      endTime: isFinished ? nowTime : '',
    });

    // Create Notification for Scan
    const newNotif = {
      id: `notif-${Date.now()}`,
      userId: guardId,
      title: 'Checkpoint Scanned',
      message: `${cp.name} recorded at ${nowTime}.`,
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
        message: `All ${activePatrol.checkpoints} checkpoints completed at ${nowTime}.`,
        read: false,
        createdAt: new Date().toISOString()
      };
      await insertRow('notifications', completionNotif);
    }

    await get().loadGuardData(guardId, guardEmail || '');
    return { success: true, message: `Checkpoint "${cp.name}" marked completed at ${nowTime}.` };
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
    const nextStr = new Date(nowMs + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    set((state) => ({
      loneWorker: {
        status: checkStatus === 'Safe' ? 'SAFE' : 'SOS / Issue Reported',
        lastCheckIn: shortTimeStr,
        lastCheckInTimestamp: nowMs,
        nextCheckRequired: nextStr,
      },
      loneWorkerHistory: [newHistoryItem, ...(state.loneWorkerHistory || [])],
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
