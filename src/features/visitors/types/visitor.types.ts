export type VisitorStatus =
  | 'scheduled'
  | 'awaiting_approval'
  | 'approved'
  | 'checked_in'
  | 'checked_out'
  | 'rejected'
  | 'denied_entry'
  | 'cancelled';

export type HostType = 'employee' | 'client_representative';

export type VisitorCategory =
  | 'Guest / Visitor'
  | 'Contractor / Vendor'
  | 'Delivery / Courier'
  | 'Client / Executive'
  | 'Job Applicant'
  | 'Maintenance'
  | 'Guest / General Visitor'
  | 'Job Applicant / Interviewee'
  | 'Maintenance / Service Tech';

export const STANDARD_VISITOR_CATEGORIES: VisitorCategory[] = [
  'Guest / Visitor',
  'Contractor / Vendor',
  'Delivery / Courier',
  'Client / Executive',
  'Job Applicant',
  'Maintenance',
];

export interface VisitorRecord {
  id: string;
  referenceNumber: string; // e.g. VIS-2026-001
  companyId: string;
  siteId: string;
  siteName: string;
  visitorName: string;
  visitorPhone?: string;
  visitorEmail?: string;
  visitorCompany?: string;
  unitNumber?: string; // e.g. B-203, A-102
  category: VisitorCategory | string;
  purpose: string;
  hostType: HostType;
  hostId?: string;
  hostName: string;
  hostPhone?: string;
  hostDepartment?: string;
  expectedArrival: string;
  expectedDeparture: string;
  actualCheckInAt?: string;
  actualCheckOutAt?: string;
  status: VisitorStatus;
  isWalkIn: boolean;
  requiresApproval: boolean;
  hasVehicle?: boolean;
  vehiclePlateNumber?: string;
  vehicleType?: string;
  badgeNumber?: string;
  idType?: string;
  idNumber?: string;
  idPhotoUri?: string;
  escortRequired?: boolean;
  notes?: string;
  qrPassCode: string;
  checkInBy?: {
    userId: string;
    userName: string;
    userRole: string;
  };
  checkOutBy?: {
    userId: string;
    userName: string;
    userRole: string;
  };
  deniedEntryBy?: {
    guardId: string;
    guardName: string;
    guardRole: string;
    reason: string;
    comments?: string;
    at: string;
  };
  createdAt: string;
  createdBy: {
    userId: string;
    userName: string;
    userRole: string;
  };
}

export const VISITOR_VEHICLE_TYPES = [
  'Car / SUV',
  'Motorcycle / Scooter',
  'Auto / Cab',
  'Delivery Van',
  'Truck / Commercial',
  'Other',
];

export interface VisitorProfile {
  id: string;
  visitorName: string;
  visitorPhone: string;
  visitorCompany?: string;
  visitorEmail?: string;
  category: VisitorCategory | string;
  hasVehicle?: boolean;
  vehiclePlateNumber?: string;
  vehicleType?: string;
  idType?: string;
  idNumber?: string;
  defaultHostName?: string;
  defaultPurpose?: string;
  lastUnitNumber?: string;
  idPhotoUri?: string;
  totalVisits: number;
  lastVisitedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResidentMember {
  id: string;
  name: string;
  relation: string; // e.g. 'Owner', 'Spouse', 'Son', 'Daughter', 'Parent', 'Tenant'
  phone: string;
  isPrimary?: boolean;
}

export interface UnitResident {
  unitNumber: string; // e.g. 'B-203', 'A-102'
  block?: string;
  ownerName: string;
  ownerPhone: string;
  members: ResidentMember[];
}

export interface VisitorPolicy {
  companyId: string;
  requireApproval: 'always' | 'walkin_only' | 'vip_only' | 'never';
  supervisorApprovalPermitted: boolean;
  allowWalkIn: boolean;
  requireHostConfirmation: boolean;
  requireContactPhone: boolean;
  requireContactEmail: boolean;
  requireVisitorCompany: boolean;
  requireBadgeIssuance: boolean;
  overstayAlertMinutes: number;
  defaultPassDurationHours: number;
  updatedAt: string;
  updatedBy?: string;
}

export interface VisitorIdDocumentType {
  code: string;
  label: string;
}

// ==========================================
// GUARD ASSIGNED VEHICLE & EXPENSE TYPES
// ==========================================

export type AssignedVehicleType = 'Patrol Car' | 'Patrol Bike' | 'Response Van' | 'Patrol SUV';

export interface AssignedGuardVehicle {
  id: string; // e.g. "veh-001"
  vehicleName: string; // e.g. "Mahindra Scorpio-N Patrol SUV"
  plateNumber: string; // e.g. "GJ-01-SEC-2026"
  vehicleType: AssignedVehicleType;
  siteId: string;
  siteName: string;
  status: 'Assigned' | 'Active' | 'Under Maintenance';
  assignedGuardId: string;
  assignedGuardName: string;
  fuelType: 'Diesel' | 'Petrol' | 'EV' | 'CNG';
  currentOdometer: number; // in km
  fuelLevel: 'Full' | '3/4' | 'Half' | '1/4' | 'Low';
  insuranceExpiry: string;
  pucExpiry: string;
  lastServiceDate?: string;
  assignedDate: string;
  vehicleImage?: string;
}

export interface VehicleHandoverChecklist {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  guardId: string;
  guardName: string;
  shiftType: 'Shift Start' | 'Shift End';
  odometerReading: number;
  fuelLevel: 'Full' | '3/4' | 'Half' | '1/4' | 'Low';
  tireCondition: 'All Good' | 'Front Right Low' | 'Needs Air' | 'Worn Out';
  exteriorBody: 'Clean & Intact' | 'Minor Scratches' | 'Dents Reported';
  emergencyKitBeacon: 'Present & Working' | 'Defective' | 'Missing';
  notes?: string;
  timestamp: string;
}

export type ExpenseCategory =
  | 'Fuel and Mileage'
  | 'Travel & Parking'
  | 'Equipment & Gear'
  | 'Supplies & Maintenance'
  | 'Meals & Food'
  | 'Emergency Response'
  | 'Other'
  | 'Travel & Transit (Tolls, Parking, Cab)'
  | 'Equipment & Security Gear'
  | 'Site Supplies & Maintenance'
  | 'Meals & Subsistence (Extended Shift)'
  | 'Emergency & Incident Response'
  | 'Other Operational Expense';

export const STANDARD_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Fuel and Mileage',
  'Travel & Parking',
  'Equipment & Gear',
  'Supplies & Maintenance',
  'Meals & Food',
  'Emergency Response',
  'Other',
];

export type ExpensePaymentType =
  | 'Employee Reimbursement'
  | 'Company Card'
  | 'Petty Cash'
  | 'Employee-Paid (Reimburse Staff)'
  | 'Company Card / Direct Bill'
  | 'Petty Cash Imprest';

export const STANDARD_EXPENSE_PAYMENT_TYPES: ExpensePaymentType[] = [
  'Employee Reimbursement',
  'Company Card',
  'Petty Cash',
];

// Legacy alias for backward compatibility
export type ExpenseType = ExpenseCategory | ExpensePaymentType | string;
export const STANDARD_EXPENSE_TYPES: string[] = STANDARD_EXPENSE_CATEGORIES;

export type ExpenseStatus =
  | 'Submitted'
  | 'Pending Supervisor Approval'
  | 'Changes Requested by Supervisor'
  | 'Approved'
  | 'Rejected';

export interface VehicleExpenseClaim {
  id: string; // e.g. "EXP-2026-001"
  businessPurpose: string;
  expenseCategory: ExpenseCategory | string;
  expenseType: ExpensePaymentType | string;
  merchantName: string;
  expenseDate: string; // e.g. "10/26/2026"
  claimedAmount: number;
  amount: number; // backward compatibility: mirrors claimedAmount
  currency: string; // e.g. "$"
  salesTaxAmount?: number;
  detailedDescription?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  vehicleName?: string;
  guardId: string;
  guardName: string;
  odometerReading?: number;
  receiptPhotoUri?: string;
  receiptFileName?: string;
  receiptFileType?: 'image' | 'pdf' | 'document';
  dateTime: string;
  remarks?: string;
  status: ExpenseStatus;
  submittedAt: string;
  updatedAt?: string;
  supervisorNotes?: string; // Feedback when supervisor requests changes
  approvedBy?: {
    userId: string;
    userName: string;
    at: string;
  };
  rejectionReason?: string;
}

export type ExpenseClaim = VehicleExpenseClaim;

