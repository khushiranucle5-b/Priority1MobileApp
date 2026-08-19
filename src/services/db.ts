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

export interface DBSiteDocument {
  id: string;
  title: string;
  category: string;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadDate: string;
  downloadUrl?: string;
}

export interface DBSiteCheckpoint {
  id: string;
  name: string;
  code: string;
  location: string;
  status: string;
  sequence: number;
}

export interface DBSiteSafetyRule {
  id: string;
  ruleName: string;
  description: string;
  status: string;
  effectiveDate: string;
}

export interface DBSiteChecklist {
  id: string;
  title: string;
  category: string;
  itemsCount: number;
  frequency: string;
  status: string;
}

export interface DBSitePostOrder {
  id: string;
  title: string;
  version: string;
  lastUpdated: string;
  status: string;
}

export interface DBSite {
  id: string;
  companyId: string;
  name: string;
  code: string;
  clientName: string;
  clientId?: string;
  branch: string;
  facilityType: string;
  supervisorName: string;
  guardsCount: number;
  riskLevel: 'Low' | 'Medium' | 'High' | string;
  contractEnd: string;
  status: 'active' | 'inactive' | string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
  postOrders?: DBSitePostOrder[];
  checklists?: DBSiteChecklist[];
  safetyRules?: DBSiteSafetyRule[];
  tourCheckpoints?: DBSiteCheckpoint[];
  assignedUsers?: { id: string; name: string; role: string; email: string }[];
  documents?: DBSiteDocument[];
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
  patrolCode?: string;
  title?: string;
  companyId: string;
  site: string;
  siteId?: string;
  route?: string;
  guard: string;
  guardId?: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'completed' | 'in_progress' | 'assigned' | 'pending' | 'missed' | 'overdue' | string;
  checkpoints: number;
  scanned: number;
  missed: number;
  incidents: number;
  lastCheckpoint?: string;
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
  incidentCode?: string;
  title: string;
  site: string;
  siteId?: string;
  reportedBy: string;
  reportedById?: string;
  employeeId?: string;
  role?: string;
  category?: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | 'Low' | 'Medium' | 'High' | 'Critical' | string;
  status: 'open' | 'under_review' | 'resolved' | 'Open' | 'Under Review' | 'Resolved' | string;
  date: string;
  exactTime?: string;
  createdAt: string;
  details: string;
  observations?: string;
  gps?: string;
  gpsStatus?: string;
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

export interface DBAsset {
  id: string;
  assetCode: string;
  name: string;
  type: string;
  serialNumber?: string;
  site?: string;
  siteId?: string;
  assignedTo: string;
  assignedGuardId?: string;
  assignedGuardEmail?: string;
  assignedDate?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Requires Inspection' | string;
  quantity?: number;
  status: 'Assigned' | 'Pending Verification' | 'Returned' | 'Available' | string;
  notes?: string;
  companyId: string;
}

const DEFAULT_ASSETS: DBAsset[] = [
  {
    id: 'ast-101',
    assetCode: 'AST-1001',
    name: 'Motorola Digital Walkie-Talkie TP-800',
    type: 'Communication',
    serialNumber: 'SN-MOT-889421',
    site: 'Ahmedabad Plant (Ranucle Zundal)',
    siteId: 'site-001',
    assignedTo: 'Khushi Rani',
    assignedGuardId: 'guard-1',
    assignedGuardEmail: 'khushirani@ranucle.com',
    assignedDate: 'Aug 01, 2026',
    condition: 'Excellent',
    quantity: 1,
    status: 'Assigned',
    companyId: 'company-001',
    notes: 'Primary encrypted dual-frequency radio unit.',
  },
  {
    id: 'ast-102',
    assetCode: 'AST-1002',
    name: 'High-Power LED Tactical Flashlight',
    type: 'Security Gear',
    serialNumber: 'SN-FL-99102',
    site: 'Ahmedabad Plant (Ranucle Zundal)',
    siteId: 'site-001',
    assignedTo: 'Khushi Rani',
    assignedGuardId: 'guard-1',
    assignedGuardEmail: 'khushirani@ranucle.com',
    assignedDate: 'Aug 01, 2026',
    condition: 'Good',
    quantity: 1,
    status: 'Assigned',
    companyId: 'company-001',
    notes: '2000 lumens rechargeable aluminum patrol torch.',
  },
  {
    id: 'ast-103',
    assetCode: 'AST-1003',
    name: 'Priority One Guard Uniform Roster Set',
    type: 'Uniform',
    site: 'Ahmedabad Plant (Ranucle Zundal)',
    siteId: 'site-001',
    assignedTo: 'Khushi Rani',
    assignedGuardId: 'guard-1',
    assignedGuardEmail: 'khushirani@ranucle.com',
    assignedDate: 'Jul 15, 2026',
    condition: 'Excellent',
    quantity: 2,
    status: 'Assigned',
    companyId: 'company-001',
    notes: 'Official short-sleeve & long-sleeve uniform shirts with duty badges.',
  },
];

const DEFAULT_INCIDENTS: DBIncident[] = [
  {
    id: 'inc-201',
    incidentCode: 'INC-2026-089',
    title: 'Unauthorized Perimeter Access Attempt',
    category: 'Security Breach',
    severity: 'High',
    status: 'Under Review',
    reportedBy: 'Khushi Rani',
    reportedById: 'guard-1',
    employeeId: 'GRD-1024',
    role: 'Senior Security Officer',
    site: 'Ahmedabad Plant (Ranucle Zundal)',
    siteId: 'site-001',
    date: 'Aug 18, 2026',
    exactTime: '02:30:15 PM',
    createdAt: new Date().toISOString(),
    details: 'Unidentified vehicle parked near Sector 4 North Gate perimeter fence without authorization badge. Guard instructed vehicle driver to move out of secure perimeter zone.',
    observations: 'Vehicle license plate logged as GJ-01-AB-8890. Perimeter breach attempt intercepted at 14:30. Driver turned back toward highway.',
    gps: '23.1145° N, 72.5821° E',
    gpsStatus: 'GPS Verified — Inside Site Boundary',
    companyId: 'company-001',
    assignedTo: 'Jane Smith (Supervisor)',
    attachments: [
      { id: 'att-1', name: 'Perimeter_Vehicle_Log.jpg', type: 'image', url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800' },
      { id: 'att-2', name: 'Gate_Security_Report.pdf', type: 'document', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: '1.2 MB' }
    ],
    comments: [
      { id: 'c-1', author: 'Jane Smith', role: 'Security Supervisor', date: 'Aug 18, 2026 at 03:00 PM', text: 'Perimeter camera footage cross-verified. Extra patrol dispatched to Sector 4.' }
    ]
  },
  {
    id: 'inc-202',
    incidentCode: 'INC-2026-074',
    title: 'Patrol Radio Unit Connection Drop',
    category: 'Equipment Damage',
    severity: 'Medium',
    status: 'Resolved',
    reportedBy: 'Khushi Rani',
    reportedById: 'guard-1',
    employeeId: 'GRD-1024',
    role: 'Senior Security Officer',
    site: 'Ahmedabad Plant (Ranucle Zundal)',
    siteId: 'site-001',
    date: 'Aug 16, 2026',
    exactTime: '11:15:00 AM',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    details: 'Patrol radio unit R-014 lost signal transmission on dual-frequency Channel 2 during routine warehouse inspection.',
    observations: 'Radio battery connector replaced by IT equipment supervisor. Communication fully restored.',
    gps: '23.1148° N, 72.5823° E',
    gpsStatus: 'GPS Verified — Inside Site Boundary',
    companyId: 'company-001',
    assignedTo: 'Mike Miller (IT Support)',
    attachments: [
      { id: 'att-3', name: 'Radio_Diagnostic_Sheet.pdf', type: 'document', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: '850 KB' }
    ],
    comments: [
      { id: 'c-2', author: 'Mike Miller', role: 'Equipment Manager', date: 'Aug 16, 2026 at 01:20 PM', text: 'Unit battery terminal resoldered and tested with base radio.' }
    ]
  }
];

// CRUD Generic helpers
export const getTable = async <T>(table: string): Promise<T[]> => {
  try {
    const raw = await AsyncStorage.getItem(`${DB_PREFIX}${table}`);
    let data: T[] = raw ? JSON.parse(raw) : [];
    
    if (table === 'assets') {
      data = DEFAULT_ASSETS as unknown as T[];
      await AsyncStorage.setItem(`${DB_PREFIX}assets`, JSON.stringify(DEFAULT_ASSETS));
      return data;
    }

    if (table === 'incidents') {
      if (!data || data.length === 0) {
        data = DEFAULT_INCIDENTS as unknown as T[];
        await AsyncStorage.setItem(`${DB_PREFIX}incidents`, JSON.stringify(DEFAULT_INCIDENTS));
      }
      return data;
    }
    
    if ((!data || data.length === 0) && SEED_DATA[table as keyof typeof SEED_DATA]) {
      const seedItems = SEED_DATA[table as keyof typeof SEED_DATA] as unknown as T[];
      if (seedItems && seedItems.length > 0) {
        data = seedItems;
        await AsyncStorage.setItem(`${DB_PREFIX}${table}`, JSON.stringify(seedItems));
        LoggerService.log(`[DB] getTable: seeded ${seedItems.length} rows to ${table}`);
      }
    }

    if ((!data || data.length === 0) && table === 'assets') {
      data = DEFAULT_ASSETS as unknown as T[];
      await AsyncStorage.setItem(`${DB_PREFIX}assets`, JSON.stringify(DEFAULT_ASSETS));
    }
    
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
