export type DispatchPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type DispatchStatus = 'Assigned' | 'Acknowledged' | 'En Route' | 'Arrived' | 'Completed' | 'Cancelled';

export interface DispatchContact {
  name: string;
  phone: string;
  role: string;
}

export interface DispatchRecord {
  id: string;
  dispatchReference: string; // e.g. DSP-2026-042
  site: string;
  siteId: string;
  reason: string;
  priority: DispatchPriority;
  reportingTime: string; // e.g. "02:15 PM"
  expectedDuration: string; // e.g. "45 mins"
  instructions: string;
  contact: DispatchContact;
  assignedGuardId: string;
  assignedGuardName: string;
  assignedGuardEmail?: string;
  status: DispatchStatus;
  assignedAt: string;
  acknowledgedAt?: string;
  enRouteAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationNotice?: string;
  reassignmentNotice?: string;
  supervisorNotes?: string;
  completionNotes?: string;
  createdAt: string;
  companyId: string;
}

// Lifecycle sequence validation helper
export const DISPATCH_STATUS_FLOW: DispatchStatus[] = [
  'Assigned',
  'Acknowledged',
  'En Route',
  'Arrived',
  'Completed',
];

export const getNextDispatchStatus = (current: DispatchStatus): DispatchStatus | null => {
  switch (current) {
    case 'Assigned': return 'Acknowledged';
    case 'Acknowledged': return 'En Route';
    case 'En Route': return 'Arrived';
    case 'Arrived': return 'Completed';
    default: return null;
  }
};
