export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskStatus = 'Pending' | 'In Progress' | 'Under Review' | 'Completed';

export interface AssignedGuardInfo {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface TaskRecord {
  id: string;
  taskReference: string; // e.g. TSK-2026-101
  title: string;
  site: string;
  siteId: string;
  priority: TaskPriority;
  instructions: string;
  dueDate: string; // e.g. "2026-10-26"
  dueTime: string; // e.g. "06:00 PM"
  status: TaskStatus;
  progress: number; // 0 to 100
  assignedGuardIds: string[];
  assignedGuards: AssignedGuardInfo[];
  requiresSignOff: boolean;
  supervisorName?: string;
  supervisorFeedback?: string;
  supervisorSignOffDate?: string;
  completionNotes?: string;
  completionPhotos?: string[];
  acknowledgedAt?: string;
  startedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  createdAt: string;
  companyId: string;
}
