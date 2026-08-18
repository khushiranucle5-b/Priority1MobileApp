import AsyncStorage from '@react-native-async-storage/async-storage';
import { SEED_DATA } from '../constants/seedData';
import { LoggerService } from './logger.service';

const DB_PREFIX = 'p1_db_';

export interface DBUser {
  id: string;
  name: string;
  email: string;
  role: 'guard' | 'supervisor' | 'admin' | string;
  companyId: string;
  company?: string;
  status?: string;
  permissions?: string[];
  tempPassword?: string;
  password?: string;
}

export interface DBEmployee {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  status: string;
  joinedDate: string;
  site?: string;
  siteId?: string;
  supervisor?: string;
  supervisorId?: string;
}

export interface DBShift {
  id: string;
  companyId: string;
  title: string;
  site: string;
  siteId?: string;
  guard: string;
  guardId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'in_progress' | 'completed' | string;
}

export interface DBAttendance {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  badge: string;
  role: string;
  date: string;
  shift: string;
  clockIn: string | null;
  clockOut: string | null;
  workingHours?: string;
  totalHours?: number;
  regularHours?: number;
  overtimeHours?: number;
  status: 'present' | 'absent' | string;
  verification?: string;
  siteId?: string;
  siteName?: string;
  clockInLatitude?: number;
  clockInLongitude?: number;
  clockInGeoStatus?: string;
  clockOutLatitude?: number;
  clockOutLongitude?: number;
  clockOutGeoStatus?: string;
  exceptionStatus?: string;
  exceptionReason?: string;
  companyId: string;
}

export interface DBPatrol {
  id: string;
  companyId: string;
  site: string;
  siteId?: string;
  guard: string;
  guardId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'completed' | 'in_progress' | 'pending' | string;
  checkpoints: number;
  scanned: number;
  missed: number;
  incidents: number;
}

export interface DBLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  role: string;
  siteId?: string;
  siteName?: string;
  supervisorId?: string;
  supervisorName?: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  appliedOn: string;
  companyId: string;
}

export interface DBIncident {
  id: string;
  title: string;
  site: string;
  siteId?: string;
  reportedBy: string;
  reportedById?: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | string;
  status: 'open' | 'under_review' | 'resolved' | string;
  date: string;
  createdAt: string;
  details: string;
  gps?: string;
  companyId: string;
  attachments?: any[];
  comments?: any[];
  assignedTo?: string;
}

export interface DBMessage {
  id: string;
  type: 'site' | 'direct';
  conversationId: string;
  siteId?: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// Expose leave balance structure
export interface DBLeaveBalances {
  annual: number;
  sick: number;
  casual: number;
}

// Function to initialize storage with seed data if not present
export const initializeDB = async (forceReset = false) => {
  try {
    const initialized = await AsyncStorage.getItem(`${DB_PREFIX}initialized`);
    const rawEmployees = await AsyncStorage.getItem(`${DB_PREFIX}employees`);
    const hasG1001 = rawEmployees && rawEmployees.includes('G-1001');
    const hasEmp103 = rawEmployees && rawEmployees.includes('emp-103');

    if (!initialized || !hasG1001 || !hasEmp103 || forceReset) {
      console.log('Initializing local AsyncStorage DB from seed data...');
      
      // Load all seed keys
      const keys = Object.keys(SEED_DATA) as (keyof typeof SEED_DATA)[];
      for (const key of keys) {
        await AsyncStorage.setItem(`${DB_PREFIX}${key}`, JSON.stringify(SEED_DATA[key]));
      }
      
      const todayStr = new Date().toISOString().split('T')[0];

      // Seed employees list
      const employeesList: DBEmployee[] = [
        {
          id: 'G-1001',
          companyId: 'c-1',
          name: 'John Smith',
          email: 'john@priority-one.io',
          phone: '+1 415 555 0101',
          designation: 'Security Officer',
          department: 'Security Operations',
          status: 'active',
          joinedDate: '2026-01-01',
          site: 'Ahmedabad Plant',
          siteId: 's-01',
          supervisor: 'Jane Smith',
          supervisorId: 'emp-102',
        },
        {
          id: 'emp-102',
          companyId: 'c-1',
          name: 'Jane Smith',
          email: 'jane@priority-one.io',
          phone: '+1 415 555 0187',
          designation: 'Security Supervisor',
          department: 'Operations',
          status: 'active',
          joinedDate: '2025-06-15',
          site: 'Ahmedabad Plant',
          siteId: 's-01',
        },
        {
          id: 'emp-103',
          companyId: 'c-1',
          name: 'Mike Miller',
          email: 'mike@priority-one.io',
          phone: '+1 415 555 0103',
          designation: 'Security Officer',
          department: 'Security Operations',
          status: 'active',
          joinedDate: '2026-02-10',
          site: 'Ahmedabad Plant',
          siteId: 's-01',
        },
        {
          id: 'emp-104',
          companyId: 'c-1',
          name: 'David Davis',
          email: 'david.d@priority-one.io',
          phone: '+1 415 555 0104',
          designation: 'Security Officer',
          department: 'Security Operations',
          status: 'active',
          joinedDate: '2026-03-15',
          site: 'Ahmedabad Plant',
          siteId: 's-01',
        }
      ];
      await AsyncStorage.setItem(`${DB_PREFIX}employees`, JSON.stringify(employeesList));

      // Seed today's shift for G-1001
      const shiftsList: DBShift[] = [
        {
          id: 'shift-today',
          companyId: 'c-1',
          title: 'Morning Shift',
          site: 'Ahmedabad Plant',
          siteId: 's-01',
          guard: 'John Smith',
          guardId: 'G-1001',
          date: todayStr,
          startTime: '08:00 AM',
          endTime: '04:00 PM',
          status: 'confirmed',
        }
      ];
      await AsyncStorage.setItem(`${DB_PREFIX}shifts`, JSON.stringify(shiftsList));

      // Seed today's patrol for G-1001
      const patrolsList: DBPatrol[] = [
        {
          id: 'patrol-today',
          companyId: 'c-1',
          site: 'Ahmedabad Plant',
          siteId: 's-01',
          guard: 'John Smith',
          guardId: 'G-1001',
          date: todayStr,
          startTime: '08:00 AM',
          endTime: '04:00 PM',
          status: 'pending',
          checkpoints: 5,
          scanned: 0,
          missed: 0,
          incidents: 0,
        }
      ];
      await AsyncStorage.setItem(`${DB_PREFIX}patrols`, JSON.stringify(patrolsList));

      // Seed initial notifications
      const notificationsList = [
        {
          id: 'notif-g1',
          userId: 'G-1001',
          title: 'Welcome to PriorityOne',
          message: 'Welcome to your guard portal. Stay safe on duty.',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'notif-g2',
          userId: 'G-1001',
          title: 'Shift Scheduled',
          message: 'You have been assigned to the Morning Shift at Ahmedabad Plant today.',
          read: false,
          createdAt: new Date().toISOString()
        }
      ];
      await AsyncStorage.setItem(`${DB_PREFIX}notifications`, JSON.stringify(notificationsList));

      // Seed initial leave balances
      const initialLeaveBalances: DBLeaveBalances = {
        annual: 12,
        sick: 5,
        casual: 3,
      };
      await AsyncStorage.setItem(`${DB_PREFIX}leaveBalances_G-1001`, JSON.stringify(initialLeaveBalances));

      // Seed initial messages
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
      const messagesList: DBMessage[] = [
        {
          id: 'msg-seed-1',
          type: 'site',
          conversationId: 'site:s-01',
          siteId: 's-01',
          senderId: 'emp-102',
          senderName: 'Jane Smith',
          message: 'Hi Team, please make sure all gates are locked at 10 PM tonight.',
          timestamp: twoHoursAgo,
          read: false,
        },
        {
          id: 'msg-seed-2',
          type: 'direct',
          conversationId: 'direct:emp-102:G-1001',
          senderId: 'emp-102',
          senderName: 'Jane Smith',
          receiverId: 'G-1001',
          message: 'John, please verify the fire exit on Parking Level 1 is clear.',
          timestamp: oneHourAgo,
          read: false,
        }
      ];
      await AsyncStorage.setItem(`${DB_PREFIX}messages`, JSON.stringify(messagesList));

      await AsyncStorage.setItem(`${DB_PREFIX}initialized`, 'true');
    }
  } catch (error) {
    console.error('Failed to initialize local DB', error);
  }
};

// Leave balances helpers
export const getLeaveBalances = async (guardId: string): Promise<DBLeaveBalances> => {
  try {
    const raw = await AsyncStorage.getItem(`${DB_PREFIX}leaveBalances_${guardId}`);
    return raw ? JSON.parse(raw) : { annual: 12, sick: 5, casual: 3 };
  } catch (error) {
    console.error('Failed to read leave balances', error);
    return { annual: 12, sick: 5, casual: 3 };
  }
};

export const saveLeaveBalances = async (guardId: string, balances: DBLeaveBalances): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${DB_PREFIX}leaveBalances_${guardId}`, JSON.stringify(balances));
  } catch (error) {
    console.error('Failed to save leave balances', error);
  }
};

// CRUD Generic helpers
export const getTable = async <T>(table: string): Promise<T[]> => {
  try {
    const raw = await AsyncStorage.getItem(`${DB_PREFIX}${table}`);
    const data = raw ? JSON.parse(raw) : [];
    LoggerService.log(`[DB] getTable: read ${table} table, returned ${data.length} rows`);
    return data;
  } catch (error: any) {
    LoggerService.log(`[DB] getTable error for ${table}: ${error?.message || error}`, 'error');
    console.error(`Failed to read table: ${table}`, error);
    return [];
  }
};

export const saveTable = async <T>(table: string, data: T[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(`${DB_PREFIX}${table}`, JSON.stringify(data));
    LoggerService.log(`[DB] saveTable: saved ${data.length} rows to ${table} table`);
  } catch (error: any) {
    LoggerService.log(`[DB] saveTable error for ${table}: ${error?.message || error}`, 'error');
    console.error(`Failed to save table: ${table}`, error);
  }
};

export const insertRow = async <T extends { id: string }>(table: string, row: T): Promise<T> => {
  LoggerService.log(`[DB] insertRow: inserting into ${table} with id ${row.id} - ${JSON.stringify(row)}`);
  const current = await getTable<T>(table);
  current.unshift(row);
  await saveTable(table, current);
  return row;
};

export const updateRow = async <T extends { id: string }>(table: string, id: string, updates: Partial<T>): Promise<T | null> => {
  LoggerService.log(`[DB] updateRow: updating row id ${id} in table ${table} with updates: ${JSON.stringify(updates)}`);
  const current = await getTable<T>(table);
  const index = current.findIndex(item => item.id === id);
  if (index === -1) {
    LoggerService.log(`[DB] updateRow failed: row id ${id} not found in ${table} table`, 'warn');
    return null;
  }
  const updated = { ...current[index], ...updates };
  current[index] = updated;
  await saveTable(table, current);
  return updated;
};
