import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  VisitorRecord,
  VisitorProfile,
  VisitorPolicy,
  VisitorIdDocumentType,
  VisitorCategory,
  STANDARD_VISITOR_CATEGORIES,
  AssignedGuardVehicle,
  VehicleHandoverChecklist,
  VehicleExpenseClaim,
  ExpenseType,
  UnitResident,
  ResidentMember,
} from '../types/visitor.types';
import { LoggerService } from '../../../services/logger.service';

const STORAGE_KEYS = {
  VISITORS: 'p1_db_visitors_v2',
  PROFILES: 'p1_db_visitor_profiles_v2',
  UNITS: 'p1_db_units_residents_v2',
  POLICY: 'p1_db_visitor_policy_v2',
  ASSIGNED_VEHICLE: 'p1_db_assigned_vehicle_v2',
  HANDOVER_CHECKLISTS: 'p1_db_handover_checklists_v2',
  EXPENSE_CLAIMS: 'p1_db_expense_claims_v2',
};

export const VISITOR_ID_TYPES: VisitorIdDocumentType[] = [
  { code: 'NATIONAL_ID', label: 'National ID Card' },
  { code: 'DRIVERS_LIC', label: "Driver's License" },
  { code: 'PASSPORT', label: 'Passport' },
  { code: 'CORP_ID', label: 'Corporate Employee Badge' },
  { code: 'VOTER_ID', label: 'Voter ID Card' },
  { code: 'OTHER', label: 'Other Government Photo ID' },
];

export const formatAmountK = (num: number, prefix: string = '$'): string => {
  if (num > 999) {
    const kVal = num / 1000;
    const formatted = parseFloat(kVal.toFixed(2));
    return `${prefix}${formatted}k`;
  }
  return `${prefix}${num.toFixed(2)}`;
};

const DEFAULT_POLICY: VisitorPolicy = {
  companyId: 'company-001',
  requireApproval: 'never',
  supervisorApprovalPermitted: true,
  allowWalkIn: true,
  requireHostConfirmation: false,
  requireContactPhone: true,
  requireContactEmail: false,
  requireVisitorCompany: false,
  requireBadgeIssuance: true,
  overstayAlertMinutes: 30,
  defaultPassDurationHours: 4,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Admin',
};

// Seed Units & Flat Resident Directory
export function getSeedUnits(): UnitResident[] {
  return [
    {
      unitNumber: 'A-101',
      block: 'A',
      ownerName: 'Amit Sharma',
      ownerPhone: '+91 98251 22334',
      members: [
        { id: 'm-101-1', name: 'Amit Sharma', relation: 'Owner', phone: '+91 98251 22334', isPrimary: true },
        { id: 'm-101-2', name: 'Priya Sharma', relation: 'Spouse', phone: '+91 98251 22335' },
        { id: 'm-101-3', name: 'Aarav Sharma', relation: 'Son', phone: '+91 98251 22336' },
      ],
    },
    {
      unitNumber: 'A-102',
      block: 'A',
      ownerName: 'Vikram Mehta',
      ownerPhone: '+91 98790 33445',
      members: [
        { id: 'm-102-1', name: 'Vikram Mehta', relation: 'Owner', phone: '+91 98790 33445', isPrimary: true },
        { id: 'm-102-2', name: 'Ananya Mehta', relation: 'Spouse', phone: '+91 98790 33446' },
        { id: 'm-102-3', name: 'Rohan Mehta', relation: 'Son', phone: '+91 98790 33447' },
      ],
    },
    {
      unitNumber: 'B-201',
      block: 'B',
      ownerName: 'Suresh Patel',
      ownerPhone: '+91 98240 55667',
      members: [
        { id: 'm-201-1', name: 'Suresh Patel', relation: 'Owner', phone: '+91 98240 55667', isPrimary: true },
        { id: 'm-201-2', name: 'Meena Patel', relation: 'Spouse', phone: '+91 98240 55668' },
        { id: 'm-201-3', name: 'Hardik Patel', relation: 'Son', phone: '+91 98240 55669' },
      ],
    },
    {
      unitNumber: 'B-203',
      block: 'B',
      ownerName: 'Rajesh Verma',
      ownerPhone: '+91 98980 11223',
      members: [
        { id: 'm-203-1', name: 'Rajesh Verma', relation: 'Owner', phone: '+91 98980 11223', isPrimary: true },
        { id: 'm-203-2', name: 'Sunita Verma', relation: 'Spouse', phone: '+91 98980 11224' },
        { id: 'm-203-3', name: 'Kavita Verma', relation: 'Daughter', phone: '+91 98980 11225' },
        { id: 'm-203-4', name: 'Rahul Verma', relation: 'Son', phone: '+91 98980 11226' },
      ],
    },
    {
      unitNumber: 'C-302',
      block: 'C',
      ownerName: 'Dharmendra Joshi',
      ownerPhone: '+91 97120 77889',
      members: [
        { id: 'm-302-1', name: 'Dharmendra Joshi', relation: 'Owner', phone: '+91 97120 77889', isPrimary: true },
        { id: 'm-302-2', name: 'Bhavna Joshi', relation: 'Spouse', phone: '+91 97120 77890' },
        { id: 'm-302-3', name: 'Jay Joshi', relation: 'Son', phone: '+91 97120 77891' },
      ],
    },
    {
      unitNumber: 'D-404',
      block: 'D',
      ownerName: 'Neha Shah',
      ownerPhone: '+91 99090 44556',
      members: [
        { id: 'm-404-1', name: 'Neha Shah', relation: 'Owner', phone: '+91 99090 44556', isPrimary: true },
        { id: 'm-404-2', name: 'Chirag Shah', relation: 'Brother', phone: '+91 99090 44557' },
        { id: 'm-404-3', name: 'Malti Shah', relation: 'Mother', phone: '+91 99090 44558' },
      ],
    },
  ];
}

// Seed Frequent / Previous Visitor Profiles for Auto-Complete
export function getSeedProfiles(): VisitorProfile[] {
  return [
    {
      id: 'prof-1',
      visitorName: 'Ramesh Patel',
      visitorPhone: '+91 98765 43210',
      category: 'Contractor / Vendor',
      idType: 'NATIONAL_ID',
      idNumber: 'XXXX-XXXX-9012',
      lastUnitNumber: 'B-203',
      defaultHostName: 'Rajesh Verma',
      defaultPurpose: 'Air Conditioner Repair & Servicing',
      totalVisits: 3,
      lastVisitedAt: new Date().toISOString(),
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prof-2',
      visitorName: 'Sunil Kumar',
      visitorPhone: '+91 98221 55432',
      category: 'Delivery / Courier',
      idType: 'DRIVERS_LIC',
      idNumber: 'DL-GJ-2023-8821',
      lastUnitNumber: 'A-102',
      defaultHostName: 'Vikram Mehta',
      defaultPurpose: 'Amazon Package Delivery',
      totalVisits: 5,
      lastVisitedAt: new Date().toISOString(),
      createdAt: '2026-10-05T14:30:00Z',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prof-3',
      visitorName: 'Pooja Trivedi',
      visitorPhone: '+91 98981 77665',
      category: 'Guest / General Visitor',
      idType: 'VOTER_ID',
      idNumber: 'VTR-291844',
      lastUnitNumber: 'B-203',
      defaultHostName: 'Sunita Verma',
      defaultPurpose: 'Family Visit',
      totalVisits: 2,
      lastVisitedAt: new Date().toISOString(),
      createdAt: '2026-10-10T11:00:00Z',
      updatedAt: new Date().toISOString(),
    },
  ];
}

// Seed Assigned Patrol Vehicle (Read-Only for Guard)
export function getSeedAssignedVehicle(): AssignedGuardVehicle {
  return {
    id: 'veh-patrol-101',
    vehicleName: 'Mahindra Scorpio-N 4x4 Patrol SUV',
    plateNumber: 'GJ-01-SEC-2026',
    vehicleType: 'Patrol SUV',
    siteId: 'site-001',
    siteName: 'Ahmedabad Plant (Ranucle Zundal)',
    status: 'Active',
    assignedGuardId: 'guard-1',
    assignedGuardName: 'Khushi Rani',
    fuelType: 'Diesel',
    currentOdometer: 24850,
    fuelLevel: '3/4',
    insuranceExpiry: 'Nov 2027',
    pucExpiry: 'Mar 2027',
    lastServiceDate: 'Oct 05, 2026',
    assignedDate: 'Aug 01, 2026',
  };
}

// Seed Handover Checklists
export function getSeedHandoverLogs(): VehicleHandoverChecklist[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'chk-101',
      vehicleId: 'veh-patrol-101',
      vehiclePlate: 'GJ-01-SEC-2026',
      guardId: 'guard-1',
      guardName: 'Khushi Rani',
      shiftType: 'Shift Start',
      odometerReading: 24820,
      fuelLevel: 'Full',
      tireCondition: 'All Good',
      exteriorBody: 'Clean & Intact',
      emergencyKitBeacon: 'Present & Working',
      notes: 'Vehicle taken over in clean condition. Beacon siren verified.',
      timestamp: `${today}T06:00:00Z`,
    },
  ];
}

// Seed Vehicle & Operational Expense Claims
export function getSeedExpenseClaims(): VehicleExpenseClaim[] {
  const today = '10/26/2026';
  const isoToday = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'EXP-2026-042',
      businessPurpose: 'Fuel refueling',
      expenseCategory: 'Fuel and Mileage',
      expenseType: 'Employee Reimbursement',
      merchantName: 'Shell Petroleum',
      expenseDate: today,
      claimedAmount: 68.50,
      amount: 68.50,
      salesTaxAmount: 5.48,
      detailedDescription: '15.2 gallons fuel for patrol vehicle.',
      currency: '$',
      vehicleId: 'veh-patrol-101',
      vehiclePlate: 'GJ-01-SEC-2026',
      vehicleName: 'Mahindra Scorpio-N 4x4 Patrol SUV',
      guardId: 'guard-1',
      guardName: 'Khushi Rani',
      odometerReading: 24820,
      dateTime: `${isoToday}T07:15:00Z`,
      status: 'Approved',
      submittedAt: `${isoToday}T07:20:00Z`,
      approvedBy: {
        userId: 'sup-1',
        userName: 'Jane Smith (Supervisor)',
        at: `${isoToday}T08:30:00Z`,
      },
    },
    {
      id: 'EXP-2026-043',
      businessPurpose: 'Toll gate pass',
      expenseCategory: 'Travel & Parking',
      expenseType: 'Employee Reimbursement',
      merchantName: 'Expressway Authority',
      expenseDate: today,
      claimedAmount: 14.50,
      amount: 14.50,
      salesTaxAmount: 1.15,
      detailedDescription: 'Expressway toll passes during North Gate response.',
      currency: '$',
      vehicleId: 'veh-patrol-101',
      vehiclePlate: 'GJ-01-SEC-2026',
      vehicleName: 'Mahindra Scorpio-N 4x4 Patrol SUV',
      guardId: 'guard-1',
      guardName: 'Khushi Rani',
      odometerReading: 24845,
      dateTime: `${isoToday}T09:40:00Z`,
      status: 'Pending Supervisor Approval',
      submittedAt: `${isoToday}T09:45:00Z`,
    },
    {
      id: 'EXP-2026-044',
      businessPurpose: 'Replacement bulbs',
      expenseCategory: 'Supplies & Maintenance',
      expenseType: 'Employee Reimbursement',
      merchantName: 'Metro Hardware',
      expenseDate: today,
      claimedAmount: 28.00,
      amount: 28.00,
      salesTaxAmount: 2.24,
      detailedDescription: '2x 500W halogen replacement bulbs for West Gate tower.',
      currency: '$',
      guardId: 'guard-1',
      guardName: 'Khushi Rani',
      dateTime: `${isoToday}T11:00:00Z`,
      status: 'Changes Requested by Supervisor',
      submittedAt: `${isoToday}T11:05:00Z`,
      supervisorNotes: 'Please attach itemized store receipt with tax breakdown.',
    },
    {
      id: 'EXP-2026-039',
      businessPurpose: 'Flashlight batteries & caution tape',
      expenseCategory: 'Equipment & Gear',
      expenseType: 'Employee Reimbursement',
      merchantName: 'Tactical Supply Co.',
      expenseDate: '10/21/2026',
      claimedAmount: 42.00,
      amount: 42.00,
      salesTaxAmount: 3.36,
      detailedDescription: '4x D-Cell battery packs and 1 roll caution tape.',
      currency: '$',
      guardId: 'guard-1',
      guardName: 'Khushi Rani',
      dateTime: '2026-10-21T14:10:00Z',
      status: 'Approved',
      submittedAt: '2026-10-21T14:20:00Z',
      approvedBy: {
        userId: 'sup-1',
        userName: 'Jane Smith (Supervisor)',
        at: '2026-10-21T15:00:00Z',
      },
    },
  ];
}

// Seed Visitors
export function getSeedVisitors(): VisitorRecord[] {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return [
    {
      id: 'vis-101',
      referenceNumber: 'VIS-2026-001',
      companyId: 'company-001',
      siteId: 'site-001',
      siteName: 'Ahmedabad Plant (Ranucle Zundal)',
      visitorName: 'Marcus Vance',
      visitorPhone: '+91 98765 43210',
      visitorEmail: 'marcus.vance@apexhvac.com',
      visitorCompany: 'Apex HVAC Systems',
      category: 'Contractor / Vendor',
      purpose: 'Quarterly HVAC chiller inspection & roof intake servicing',
      hostType: 'employee',
      hostName: 'Michael Carter',
      hostDepartment: 'Field Operations',
      expectedArrival: `${todayStr}T08:00:00`,
      expectedDeparture: `${todayStr}T14:00:00`,
      status: 'checked_in',
      isWalkIn: true,
      requiresApproval: false,
      actualCheckInAt: `${todayStr}T08:15:00Z`,
      hasVehicle: true,
      vehiclePlateNumber: 'CA-7XYZ90',
      vehicleType: 'Delivery Van',
      badgeNumber: 'B-101',
      idType: 'NATIONAL_ID',
      idNumber: 'XXXX-XXXX-9012',
      escortRequired: false,
      notes: 'Roof intake access clearance granted.',
      qrPassCode: 'P1-VIS-2026-001-vis101',
      checkInBy: {
        userId: 'guard-1',
        userName: 'Khushi Rani',
        userRole: 'guard',
      },
      createdAt: `${todayStr}T07:30:00Z`,
      createdBy: {
        userId: 'guard-1',
        userName: 'Khushi Rani',
        userRole: 'guard',
      },
    },
    {
      id: 'vis-102',
      referenceNumber: 'VIS-2026-002',
      companyId: 'company-001',
      siteId: 'site-001',
      siteName: 'Ahmedabad Plant (Ranucle Zundal)',
      visitorName: 'Dr. Aris Thorne',
      visitorPhone: '+91 98221 55432',
      visitorEmail: 'aris.thorne@biotech.example',
      visitorCompany: 'BioTech Research Labs',
      category: 'Client / Executive',
      purpose: 'Executive site audit and security review',
      hostType: 'employee',
      hostName: 'Sarah Jenkins',
      hostDepartment: 'Human Resources',
      expectedArrival: `${todayStr}T08:30:00`,
      expectedDeparture: `${todayStr}T11:00:00`,
      status: 'checked_in',
      isWalkIn: true,
      requiresApproval: false,
      actualCheckInAt: `${todayStr}T08:42:00Z`,
      badgeNumber: 'VIP-04',
      idType: 'PASSPORT',
      idNumber: 'Z8920114',
      escortRequired: true,
      notes: 'Security escort mandatory inside warehouse zones.',
      qrPassCode: 'P1-VIS-2026-002-vis102',
      checkInBy: {
        userId: 'guard-1',
        userName: 'Khushi Rani',
        userRole: 'guard',
      },
      createdAt: `${todayStr}T07:45:00Z`,
      createdBy: {
        userId: 'guard-1',
        userName: 'Khushi Rani',
        userRole: 'guard',
      },
    },
    {
      id: 'vis-103',
      referenceNumber: 'VIS-2026-003',
      companyId: 'company-001',
      siteId: 'site-001',
      siteName: 'Ahmedabad Plant (Ranucle Zundal)',
      visitorName: 'Elena Gomez',
      visitorPhone: '+91 97654 32109',
      visitorCompany: 'FedEx Freight Express',
      category: 'Delivery / Courier',
      purpose: 'Secure freight parcel delivery to Bay 4 Logistics Office',
      hostType: 'employee',
      hostName: 'Michael Carter',
      hostDepartment: 'Field Operations',
      expectedArrival: `${todayStr}T07:15:00`,
      expectedDeparture: `${todayStr}T08:00:00`,
      status: 'checked_out',
      isWalkIn: true,
      requiresApproval: false,
      actualCheckInAt: `${todayStr}T07:22:00Z`,
      actualCheckOutAt: `${todayStr}T08:05:00Z`,
      badgeNumber: 'TMP-12',
      idType: 'DRIVERS_LIC',
      idNumber: 'DL-GJ01-2021-8901',
      notes: '3 boxes delivered with signature receipt.',
      qrPassCode: 'P1-VIS-2026-003-vis103',
      checkInBy: {
        userId: 'guard-1',
        userName: 'Khushi Rani',
        userRole: 'guard',
      },
      checkOutBy: {
        userId: 'guard-1',
        userName: 'Khushi Rani',
        userRole: 'guard',
      },
      createdAt: `${todayStr}T07:00:00Z`,
      createdBy: {
        userId: 'guard-1',
        userName: 'Khushi Rani',
        userRole: 'guard',
      },
    },
    {
      id: 'vis-104',
      referenceNumber: 'VIS-2026-004',
      companyId: 'company-001',
      siteId: 'site-001',
      siteName: 'Ahmedabad Plant (Ranucle Zundal)',
      visitorName: 'Rajesh Sharma',
      visitorPhone: '+91 98110 23456',
      visitorCompany: 'Siemens Energy Ltd.',
      category: 'Maintenance / Service Tech',
      purpose: 'Transformer maintenance & high voltage switchgear testing',
      hostType: 'employee',
      hostName: 'Michael Carter',
      hostDepartment: 'Field Operations',
      expectedArrival: `${todayStr}T14:30:00`,
      expectedDeparture: `${todayStr}T18:00:00`,
      status: 'scheduled',
      isWalkIn: false,
      requiresApproval: false,
      badgeNumber: 'B-118',
      idType: 'NATIONAL_ID',
      notes: 'Tools inspection required at Gate 2 security cabin.',
      qrPassCode: 'P1-VIS-2026-004-vis104',
      createdAt: `${todayStr}T06:00:00Z`,
      createdBy: {
        userId: 'u-5',
        userName: 'Sarah Jenkins',
        userRole: 'hr',
      },
    },
    {
      id: 'vis-105',
      referenceNumber: 'VIS-2026-005',
      companyId: 'company-001',
      siteId: 'site-001',
      siteName: 'Ahmedabad Plant (Ranucle Zundal)',
      visitorName: 'Ananya Roy',
      visitorPhone: '+91 99011 88223',
      category: 'Job Applicant / Interviewee',
      purpose: 'Final round technical interview for Operations Lead',
      hostType: 'employee',
      hostName: 'Sarah Jenkins',
      hostDepartment: 'Human Resources',
      expectedArrival: `${todayStr}T15:00:00`,
      expectedDeparture: `${todayStr}T16:30:00`,
      status: 'scheduled',
      isWalkIn: false,
      requiresApproval: false,
      notes: 'HR Visitor pass issued for Admin Block 2.',
      qrPassCode: 'P1-VIS-2026-005-vis105',
      createdAt: `${todayStr}T07:10:00Z`,
      createdBy: {
        userId: 'u-5',
        userName: 'Sarah Jenkins',
        userRole: 'hr',
      },
    },
  ];
}

class VisitorService {
  private visitorsCache: VisitorRecord[] | null = null;
  private unitsCache: UnitResident[] | null = null;
  private profilesCache: VisitorProfile[] | null = null;
  private assignedVehicleCache: AssignedGuardVehicle | null = null;
  private expenseClaimsCache: VehicleExpenseClaim[] | null = null;
  private handoverLogsCache: VehicleHandoverChecklist[] | null = null;

  // ==========================================
  // RESIDENT UNITS & FAMILY DIRECTORY
  // ==========================================

  public async getUnits(): Promise<UnitResident[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.UNITS);
      let list: UnitResident[] = raw ? JSON.parse(raw) : [];

      if (!list || list.length === 0) {
        list = getSeedUnits();
        await AsyncStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(list));
      }
      this.unitsCache = list;
      return list;
    } catch (e) {
      LoggerService.log(`[VisitorService] getUnits error: ${e}`, 'error');
      return getSeedUnits();
    }
  }

  public async searchUnits(query: string): Promise<UnitResident[]> {
    const units = await this.getUnits();
    if (!query.trim()) return units;

    const q = query.toLowerCase().trim();
    return units.filter((u) => {
      const matchUnit = u.unitNumber.toLowerCase().includes(q);
      const matchOwner = u.ownerName.toLowerCase().includes(q);
      const matchPhone = u.ownerPhone.replace(/[\s-]/g, '').includes(q.replace(/[\s-]/g, ''));
      const matchMember = u.members.some(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.phone.replace(/[\s-]/g, '').includes(q.replace(/[\s-]/g, ''))
      );
      return matchUnit || matchOwner || matchPhone || matchMember;
    });
  }

  public async getUnitByNumber(unitNumber: string): Promise<UnitResident | null> {
    const units = await this.getUnits();
    const cleanNum = unitNumber.trim().toUpperCase();
    return units.find((u) => u.unitNumber.toUpperCase() === cleanNum) || null;
  }

  public async saveOrUpdateUnit(unit: UnitResident): Promise<void> {
    try {
      const units = await this.getUnits();
      const cleanNum = unit.unitNumber.trim().toUpperCase();
      const idx = units.findIndex((u) => u.unitNumber.toUpperCase() === cleanNum);

      if (idx >= 0) {
        units[idx] = { ...units[idx], ...unit };
      } else {
        units.unshift(unit);
      }

      await AsyncStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
      this.unitsCache = units;
      LoggerService.log(`[VisitorService] Saved unit: ${unit.unitNumber}`);
    } catch (e) {
      LoggerService.log(`[VisitorService] saveOrUpdateUnit error: ${e}`, 'error');
    }
  }

  // ==========================================
  // FREQUENT / PREVIOUS VISITOR PROFILES
  // ==========================================

  public async getProfiles(): Promise<VisitorProfile[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILES);
      let list: VisitorProfile[] = raw ? JSON.parse(raw) : [];

      if (!list || list.length === 0) {
        list = getSeedProfiles();
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(list));
      }
      this.profilesCache = list;
      return list;
    } catch (e) {
      LoggerService.log(`[VisitorService] getProfiles error: ${e}`, 'error');
      return getSeedProfiles();
    }
  }

  public async searchProfiles(query: string): Promise<VisitorProfile[]> {
    const profiles = await this.getProfiles();
    if (!query.trim()) return profiles;

    const q = query.toLowerCase().trim();
    const qClean = q.replace(/[\s-]/g, '');

    return profiles.filter((p) => {
      const matchName = p.visitorName.toLowerCase().includes(q);
      const matchPhone = p.visitorPhone && p.visitorPhone.replace(/[\s-]/g, '').includes(qClean);
      const matchDoc = p.idNumber && p.idNumber.toLowerCase().includes(q);
      const matchUnit = p.lastUnitNumber && p.lastUnitNumber.toLowerCase().includes(q);
      return matchName || matchPhone || matchDoc || matchUnit;
    });
  }

  public async saveOrUpdateProfile(data: Partial<VisitorProfile>): Promise<VisitorProfile> {
    const profiles = await this.getProfiles();
    const cleanPhone = (data.visitorPhone || '').replace(/[\s-]/g, '');
    const cleanName = (data.visitorName || '').trim().toLowerCase();

    const idx = profiles.findIndex((p) => {
      const pPhone = p.visitorPhone.replace(/[\s-]/g, '');
      const pName = p.visitorName.trim().toLowerCase();
      return (cleanPhone && pPhone === cleanPhone) || (cleanName && pName === cleanName);
    });

    const now = new Date().toISOString();
    let result: VisitorProfile;

    if (idx >= 0) {
      result = {
        ...profiles[idx],
        ...data,
        visitorName: data.visitorName || profiles[idx].visitorName,
        visitorPhone: data.visitorPhone || profiles[idx].visitorPhone,
        totalVisits: (profiles[idx].totalVisits || 1) + 1,
        lastVisitedAt: now,
        updatedAt: now,
      };
      profiles[idx] = result;
    } else {
      result = {
        id: `prof-${Date.now()}`,
        visitorName: data.visitorName || 'Guest',
        visitorPhone: data.visitorPhone || '',
        category: data.category || 'Guest / General Visitor',
        idType: data.idType,
        idNumber: data.idNumber,
        idPhotoUri: data.idPhotoUri,
        lastUnitNumber: data.lastUnitNumber,
        defaultHostName: data.defaultHostName,
        defaultPurpose: data.defaultPurpose,
        totalVisits: 1,
        lastVisitedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      profiles.unshift(result);
    }

    await AsyncStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
    this.profilesCache = profiles;
    return result;
  }

  // ==========================================
  // VISITOR OPERATIONS
  // ==========================================

  public async getVisitors(): Promise<VisitorRecord[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.VISITORS);
      let list: VisitorRecord[] = raw ? JSON.parse(raw) : [];

      if (!list || list.length === 0) {
        list = getSeedVisitors();
        await AsyncStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(list));
      }
      this.visitorsCache = list;
      return list;
    } catch (e) {
      LoggerService.log(`[VisitorService] getVisitors error: ${e}`, 'error');
      return getSeedVisitors();
    }
  }

  public async getVisitorById(id: string): Promise<VisitorRecord | null> {
    const all = await this.getVisitors();
    return all.find((v) => v.id === id) || null;
  }

  public async getActiveVisitors(): Promise<VisitorRecord[]> {
    const all = await this.getVisitors();
    return all.filter((v) => v.status === 'checked_in');
  }

  public async registerVisitor(
    data: {
      visitorName: string;
      visitorPhone?: string;
      visitorEmail?: string;
      visitorCompany?: string;
      unitNumber?: string;
      category: VisitorCategory | string;
      hostName: string;
      hostPhone?: string;
      hostDepartment?: string;
      purpose: string;
      hasVehicle?: boolean;
      vehiclePlateNumber?: string;
      vehicleType?: string;
      idType?: string;
      idNumber?: string;
      idPhotoUri?: string;
      badgeNumber?: string;
      escortRequired?: boolean;
      instantCheckIn?: boolean;
      notes?: string;
    },
    guard: { guardId: string; guardName: string; siteName?: string }
  ): Promise<{ success: boolean; visitor?: VisitorRecord; error?: string }> {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const randomSeq = Math.floor(100 + Math.random() * 900);
      const referenceNumber = `VIS-${now.getFullYear()}-${randomSeq}`;
      const id = `vis-${Date.now()}`;
      const qrPassCode = `P1-${referenceNumber}-${id}`;

      const departureTime = new Date(now.getTime() + 4 * 3600 * 1000);
      const isInstantCheckIn = data.instantCheckIn !== false;

      const newRecord: VisitorRecord = {
        id,
        referenceNumber,
        companyId: 'company-001',
        siteId: 'site-001',
        siteName: guard.siteName || 'Ahmedabad Plant (Ranucle Zundal)',
        visitorName: data.visitorName.trim(),
        visitorPhone: data.visitorPhone?.trim() || undefined,
        visitorEmail: data.visitorEmail?.trim(),
        visitorCompany: data.visitorCompany?.trim() || undefined,
        unitNumber: data.unitNumber?.trim() || undefined,
        category: data.category || 'Guest / General Visitor',
        purpose: data.purpose.trim() || 'Personal / Resident Visit',
        hostType: 'employee',
        hostName: data.hostName.trim(),
        hostPhone: data.hostPhone?.trim() || undefined,
        hostDepartment: data.hostDepartment?.trim() || undefined,
        expectedArrival: now.toISOString(),
        expectedDeparture: departureTime.toISOString(),
        actualCheckInAt: isInstantCheckIn ? now.toISOString() : undefined,
        status: isInstantCheckIn ? 'checked_in' : 'scheduled',
        isWalkIn: true,
        requiresApproval: false,
        hasVehicle: data.hasVehicle,
        vehiclePlateNumber: data.vehiclePlateNumber?.trim(),
        vehicleType: data.vehicleType,
        badgeNumber: data.badgeNumber?.trim(),
        idType: data.idType,
        idNumber: data.idNumber?.trim(),
        idPhotoUri: data.idPhotoUri,
        escortRequired: data.escortRequired,
        notes: data.notes?.trim(),
        qrPassCode,
        checkInBy: isInstantCheckIn
          ? {
              userId: guard.guardId,
              userName: guard.guardName,
              userRole: 'guard',
            }
          : undefined,
        createdAt: now.toISOString(),
        createdBy: {
          userId: guard.guardId,
          userName: guard.guardName,
          userRole: 'guard',
        },
      };

      const all = await this.getVisitors();
      all.unshift(newRecord);
      await AsyncStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(all));
      this.visitorsCache = all;

      // Automatically save visitor profile for 1-tap future auto-fill!
      try {
        await this.saveOrUpdateProfile({
          visitorName: newRecord.visitorName,
          visitorPhone: newRecord.visitorPhone,
          category: newRecord.category,
          hasVehicle: newRecord.hasVehicle,
          vehiclePlateNumber: newRecord.vehiclePlateNumber,
          vehicleType: newRecord.vehicleType,
          idType: newRecord.idType,
          idNumber: newRecord.idNumber,
          idPhotoUri: newRecord.idPhotoUri,
          lastUnitNumber: newRecord.unitNumber,
          defaultHostName: newRecord.hostName,
          defaultPurpose: newRecord.purpose,
        });
      } catch (err) {
        LoggerService.log(`[VisitorService] Profile auto-save error: ${err}`, 'warn');
      }

      // Automatically update/save unit & resident if unitNumber is given
      if (newRecord.unitNumber && newRecord.hostName) {
        try {
          const uNum = newRecord.unitNumber.toUpperCase();
          const existingUnit = await this.getUnitByNumber(uNum);
          if (existingUnit) {
            const hasMember = existingUnit.members.some(
              (m) => m.name.toLowerCase() === newRecord.hostName.toLowerCase()
            );
            if (!hasMember) {
              existingUnit.members.push({
                id: `m-${Date.now()}`,
                name: newRecord.hostName,
                relation: 'Resident',
                phone: newRecord.hostPhone || '',
              });
              await this.saveOrUpdateUnit(existingUnit);
            }
          } else {
            await this.saveOrUpdateUnit({
              unitNumber: uNum,
              ownerName: newRecord.hostName,
              ownerPhone: newRecord.hostPhone || '',
              members: [
                {
                  id: `m-${Date.now()}`,
                  name: newRecord.hostName,
                  relation: 'Owner',
                  phone: newRecord.hostPhone || '',
                  isPrimary: true,
                },
              ],
            });
          }
        } catch (err) {
          LoggerService.log(`[VisitorService] Unit auto-save error: ${err}`, 'warn');
        }
      }

      LoggerService.log(`[VisitorService] Registered visitor: ${newRecord.visitorName} (${newRecord.referenceNumber})`);
      return { success: true, visitor: newRecord };
    } catch (e: any) {
      LoggerService.log(`[VisitorService] registerVisitor error: ${e?.message || e}`, 'error');
      return { success: false, error: e?.message || 'Failed to register visitor' };
    }
  }

  // Quick Check-in for Guard
  public async quickCheckIn(
    id: string,
    guard: { guardId: string; guardName: string }
  ): Promise<{ success: boolean; visitor?: VisitorRecord; error?: string }> {
    try {
      const all = await this.getVisitors();
      const idx = all.findIndex((v) => v.id === id);
      if (idx === -1) return { success: false, error: 'Visitor record not found.' };

      const v = all[idx];
      const now = new Date().toISOString();
      v.status = 'checked_in';
      v.actualCheckInAt = now;
      v.checkInBy = {
        userId: guard.guardId,
        userName: guard.guardName,
        userRole: 'guard',
      };

      all[idx] = v;
      await AsyncStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(all));
      this.visitorsCache = all;

      return { success: true, visitor: v };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to check in.' };
    }
  }

  // Single-Tap Check-out for Guard (No parking slot reservation required!)
  public async singleTapCheckOut(
    id: string,
    guard: { guardId: string; guardName: string }
  ): Promise<{ success: boolean; visitor?: VisitorRecord; error?: string }> {
    try {
      const all = await this.getVisitors();
      const idx = all.findIndex((v) => v.id === id);
      if (idx === -1) return { success: false, error: 'Visitor record not found.' };

      const v = all[idx];
      const now = new Date().toISOString();
      v.status = 'checked_out';
      v.actualCheckOutAt = now;
      v.checkOutBy = {
        userId: guard.guardId,
        userName: guard.guardName,
        userRole: 'guard',
      };

      all[idx] = v;
      await AsyncStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(all));
      this.visitorsCache = all;

      return { success: true, visitor: v };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to check out.' };
    }
  }

  public async denyVisitorEntry(
    id: string,
    params: { reason: string; comments?: string },
    guard: { guardId: string; guardName: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const all = await this.getVisitors();
      const idx = all.findIndex((v) => v.id === id);
      if (idx === -1) return { success: false, error: 'Visitor not found.' };

      const v = all[idx];
      v.status = 'denied_entry';
      v.deniedEntryBy = {
        guardId: guard.guardId,
        guardName: guard.guardName,
        guardRole: 'guard',
        reason: params.reason,
        comments: params.comments,
        at: new Date().toISOString(),
      };

      all[idx] = v;
      await AsyncStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(all));
      this.visitorsCache = all;

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to record denial.' };
    }
  }

  public isVisitorOverstay(visitor: VisitorRecord): boolean {
    if (visitor.status !== 'checked_in') return false;
    const expectedEnd = new Date(visitor.expectedDeparture).getTime();
    const threshold = expectedEnd + 30 * 60 * 1000;
    return Date.now() > threshold;
  }

  // Delete visitor record
  public async deleteVisitor(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const all = await this.getVisitors();
      const filtered = all.filter((v) => v.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(filtered));
      this.visitorsCache = filtered;
      LoggerService.log(`[VisitorService] Deleted visitor: ${id}`);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to delete visitor' };
    }
  }

  // Update existing visitor record
  public async updateVisitor(
    id: string,
    data: Partial<VisitorRecord>
  ): Promise<{ success: boolean; visitor?: VisitorRecord; error?: string }> {
    try {
      const all = await this.getVisitors();
      const idx = all.findIndex((v) => v.id === id);
      if (idx === -1) return { success: false, error: 'Visitor not found' };

      const updated: VisitorRecord = {
        ...all[idx],
        ...data,
      };
      all[idx] = updated;
      await AsyncStorage.setItem(STORAGE_KEYS.VISITORS, JSON.stringify(all));
      this.visitorsCache = all;
      LoggerService.log(`[VisitorService] Updated visitor: ${updated.visitorName} (${updated.id})`);
      return { success: true, visitor: updated };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to update visitor' };
    }
  }

  // ==========================================
  // GUARD ASSIGNED VEHICLE (VIEW-ONLY)
  // ==========================================

  public async getAssignedVehicle(guardId?: string): Promise<AssignedGuardVehicle> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.ASSIGNED_VEHICLE);
      if (raw) {
        this.assignedVehicleCache = JSON.parse(raw);
        return this.assignedVehicleCache!;
      }
    } catch (e) {
      LoggerService.log(`[VisitorService] getAssignedVehicle error: ${e}`, 'warn');
    }
    const seed = getSeedAssignedVehicle();
    this.assignedVehicleCache = seed;
    await AsyncStorage.setItem(STORAGE_KEYS.ASSIGNED_VEHICLE, JSON.stringify(seed));
    return seed;
  }

  public async getHandoverChecklists(vehicleId?: string): Promise<VehicleHandoverChecklist[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.HANDOVER_CHECKLISTS);
      let list: VehicleHandoverChecklist[] = raw ? JSON.parse(raw) : [];

      if (!list || list.length === 0) {
        list = getSeedHandoverLogs();
        await AsyncStorage.setItem(STORAGE_KEYS.HANDOVER_CHECKLISTS, JSON.stringify(list));
      }
      this.handoverLogsCache = list;
      return list;
    } catch (e) {
      return getSeedHandoverLogs();
    }
  }

  public async submitHandoverChecklist(
    data: {
      shiftType: 'Shift Start' | 'Shift End';
      odometerReading: number;
      fuelLevel: 'Full' | '3/4' | 'Half' | '1/4' | 'Low';
      tireCondition: 'All Good' | 'Front Right Low' | 'Needs Air' | 'Worn Out';
      exteriorBody: 'Clean & Intact' | 'Minor Scratches' | 'Dents Reported';
      emergencyKitBeacon: 'Present & Working' | 'Defective' | 'Missing';
      notes?: string;
    },
    guard: { guardId: string; guardName: string }
  ): Promise<{ success: boolean; checklist?: VehicleHandoverChecklist; error?: string }> {
    try {
      const assigned = await this.getAssignedVehicle(guard.guardId);
      const newEntry: VehicleHandoverChecklist = {
        id: `chk-${Date.now()}`,
        vehicleId: assigned.id,
        vehiclePlate: assigned.plateNumber,
        guardId: guard.guardId,
        guardName: guard.guardName,
        shiftType: data.shiftType,
        odometerReading: data.odometerReading,
        fuelLevel: data.fuelLevel,
        tireCondition: data.tireCondition,
        exteriorBody: data.exteriorBody,
        emergencyKitBeacon: data.emergencyKitBeacon,
        notes: data.notes?.trim(),
        timestamp: new Date().toISOString(),
      };

      // Also update vehicle's current odometer & fuel level in local cache
      assigned.currentOdometer = data.odometerReading;
      assigned.fuelLevel = data.fuelLevel;
      await AsyncStorage.setItem(STORAGE_KEYS.ASSIGNED_VEHICLE, JSON.stringify(assigned));

      const logs = await this.getHandoverChecklists();
      logs.unshift(newEntry);
      await AsyncStorage.setItem(STORAGE_KEYS.HANDOVER_CHECKLISTS, JSON.stringify(logs));
      this.handoverLogsCache = logs;

      return { success: true, checklist: newEntry };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to submit handover checklist' };
    }
  }

  // ==========================================
  // VEHICLE EXPENSE CLAIMS (GUARD SUBMISSION)
  // ==========================================

  public async getExpenseClaims(guardId?: string): Promise<VehicleExpenseClaim[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSE_CLAIMS);
      let list: VehicleExpenseClaim[] = raw ? JSON.parse(raw) : [];

      if (!list || list.length === 0) {
        list = getSeedExpenseClaims();
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSE_CLAIMS, JSON.stringify(list));
      }
      this.expenseClaimsCache = list;
      return list;
    } catch (e) {
      return getSeedExpenseClaims();
    }
  }

  public async getExpenseClaimById(id: string): Promise<VehicleExpenseClaim | null> {
    try {
      const claims = await this.getExpenseClaims();
      return claims.find((c) => c.id === id) || null;
    } catch (e) {
      return null;
    }
  }

  public async submitExpenseClaim(
    data: {
      businessPurpose?: string;
      expenseCategory?: string;
      expenseType?: string;
      merchantName?: string;
      expenseDate?: string;
      claimedAmount?: number;
      amount?: number;
      currency?: string;
      salesTaxAmount?: number;
      detailedDescription?: string;
      vehicleId?: string;
      vehiclePlate?: string;
      vehicleName?: string;
      odometerReading?: number;
      receiptPhotoUri?: string;
      receiptFileName?: string;
      receiptFileType?: 'image' | 'pdf' | 'document';
      dateTime?: string;
      remarks?: string;
    },
    guard: { guardId: string; guardName: string }
  ): Promise<{ success: boolean; claim?: VehicleExpenseClaim; error?: string }> {
    try {
      const now = new Date();
      const randomSeq = Math.floor(100 + Math.random() * 900);
      const claimId = `EXP-${now.getFullYear()}-${randomSeq}`;

      const finalAmount = data.claimedAmount ?? data.amount ?? 0;
      const finalDate = data.expenseDate || now.toLocaleDateString('en-US');

      const newClaim: VehicleExpenseClaim = {
        id: claimId,
        businessPurpose: data.businessPurpose || data.remarks || 'Operational Expense Claim',
        expenseCategory: data.expenseCategory || 'Fuel and Mileage',
        expenseType: data.expenseType || 'Employee-Paid (Reimburse Staff)',
        merchantName: data.merchantName || 'Tactical & Field Supplier',
        expenseDate: finalDate,
        claimedAmount: finalAmount,
        amount: finalAmount,
        currency: data.currency || '$',
        salesTaxAmount: data.salesTaxAmount,
        detailedDescription: data.detailedDescription || data.remarks,
        vehicleId: data.vehicleId,
        vehiclePlate: data.vehiclePlate,
        vehicleName: data.vehicleName,
        guardId: guard.guardId,
        guardName: guard.guardName,
        odometerReading: data.odometerReading,
        receiptPhotoUri: data.receiptPhotoUri,
        receiptFileName: data.receiptFileName,
        receiptFileType: data.receiptFileType,
        dateTime: data.dateTime || now.toISOString(),
        remarks: data.remarks?.trim(),
        status: 'Pending Supervisor Approval',
        submittedAt: now.toISOString(),
      };

      const claims = await this.getExpenseClaims();
      claims.unshift(newClaim);
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSE_CLAIMS, JSON.stringify(claims));
      this.expenseClaimsCache = claims;

      LoggerService.log(`[VisitorService] Expense claim submitted: ${newClaim.id} - ${newClaim.amount}`);
      return { success: true, claim: newClaim };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to submit expense claim' };
    }
  }

  public async updateExpenseClaim(
    claimId: string,
    updates: Partial<VehicleExpenseClaim>
  ): Promise<{ success: boolean; claim?: VehicleExpenseClaim; error?: string }> {
    try {
      const claims = await this.getExpenseClaims();
      const index = claims.findIndex((c) => c.id === claimId);
      if (index === -1) {
        return { success: false, error: 'Claim not found' };
      }

      const existing = claims[index];
      const finalAmount =
        updates.claimedAmount !== undefined
          ? updates.claimedAmount
          : updates.amount !== undefined
          ? updates.amount
          : existing.claimedAmount ?? existing.amount;

      const updatedClaim: VehicleExpenseClaim = {
        ...existing,
        ...updates,
        claimedAmount: finalAmount,
        amount: finalAmount,
        updatedAt: new Date().toISOString(),
      };

      claims[index] = updatedClaim;
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSE_CLAIMS, JSON.stringify(claims));
      this.expenseClaimsCache = claims;

      LoggerService.log(`[VisitorService] Expense claim updated: ${claimId}`);
      return { success: true, claim: updatedClaim };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to update expense claim' };
    }
  }
}

export const visitorService = new VisitorService();
