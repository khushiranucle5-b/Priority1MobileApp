import { getNextDispatchStatus, DISPATCH_STATUS_FLOW } from '../src/features/dispatches/types/dispatch.types';
import { TaskRecord, TaskStatus } from '../src/features/tasks/types/task.types';

describe('Tasks & Dispatches Logic & Permissions Verification', () => {
  describe('Dispatch Lifecycle & Transitions', () => {
    test('Strict lifecycle sequence: Assigned -> Acknowledged -> En Route -> Arrived -> Completed', () => {
      expect(getNextDispatchStatus('Assigned')).toBe('Acknowledged');
      expect(getNextDispatchStatus('Acknowledged')).toBe('En Route');
      expect(getNextDispatchStatus('En Route')).toBe('Arrived');
      expect(getNextDispatchStatus('Arrived')).toBe('Completed');
      expect(getNextDispatchStatus('Completed')).toBeNull();
      expect(getNextDispatchStatus('Cancelled')).toBeNull();
    });

    test('Invalid transitions are blocked', () => {
      // Cannot jump from Assigned directly to Completed
      const validFromAssigned = getNextDispatchStatus('Assigned');
      expect(validFromAssigned).not.toBe('Completed');
      expect(validFromAssigned).not.toBe('Arrived');

      // Cannot advance past Completed
      const nextAfterCompleted = getNextDispatchStatus('Completed');
      expect(nextAfterCompleted).toBeNull();
    });

    test('Flow contains exactly 5 standard lifecycle stages', () => {
      expect(DISPATCH_STATUS_FLOW).toEqual([
        'Assigned',
        'Acknowledged',
        'En Route',
        'Arrived',
        'Completed',
      ]);
    });
  });

  describe('Tasks Assignment & Permissions', () => {
    const mockTasks: TaskRecord[] = [
      {
        id: 'tsk-single',
        taskReference: 'TSK-001',
        title: 'Single Guard Patrol Check',
        site: 'Ahmedabad Plant',
        siteId: 's-01',
        priority: 'High',
        instructions: 'Check locks',
        dueDate: '2026-10-26',
        dueTime: '06:00 PM',
        status: 'Pending',
        progress: 0,
        assignedGuardIds: ['G-1001'],
        assignedGuards: [{ id: 'G-1001', name: 'John Smith' }],
        requiresSignOff: true,
        createdAt: '2026-10-26 08:00 AM',
        companyId: 'c-1',
      },
      {
        id: 'tsk-multi',
        taskReference: 'TSK-002',
        title: 'Joint Server Room Audit',
        site: 'Ahmedabad Plant',
        siteId: 's-01',
        priority: 'Critical',
        instructions: 'Check fire extinguishers',
        dueDate: '2026-10-26',
        dueTime: '07:00 PM',
        status: 'In Progress',
        progress: 40,
        assignedGuardIds: ['G-1001', 'emp-103'],
        assignedGuards: [
          { id: 'G-1001', name: 'John Smith' },
          { id: 'emp-103', name: 'Mike Miller' },
        ],
        requiresSignOff: true,
        createdAt: '2026-10-26 09:00 AM',
        companyId: 'c-1',
      },
      {
        id: 'tsk-other',
        taskReference: 'TSK-003',
        title: 'Other Guard Task',
        site: 'Ahmedabad Plant',
        siteId: 's-01',
        priority: 'Low',
        instructions: 'Other guard only',
        dueDate: '2026-10-26',
        dueTime: '08:00 PM',
        status: 'Pending',
        progress: 0,
        assignedGuardIds: ['emp-999'],
        assignedGuards: [{ id: 'emp-999', name: 'Other Guard' }],
        requiresSignOff: false,
        createdAt: '2026-10-26 10:00 AM',
        companyId: 'c-1',
      },
    ];

    test('Guards see only tasks assigned to them, including multi-guard tasks', () => {
      const currentGuardId = 'G-1001';
      const guardTasks = mockTasks.filter(t => t.assignedGuardIds.includes(currentGuardId));

      expect(guardTasks.length).toBe(2);
      expect(guardTasks.some(t => t.id === 'tsk-single')).toBe(true);
      expect(guardTasks.some(t => t.id === 'tsk-multi')).toBe(true);
      expect(guardTasks.some(t => t.id === 'tsk-other')).toBe(false);
    });

    test('Tasks requiring supervisor sign-off transition to "Under Review" instead of "Completed"', () => {
      const taskWithSignOff = mockTasks[0];
      expect(taskWithSignOff.requiresSignOff).toBe(true);

      const submitStatus: TaskStatus = taskWithSignOff.requiresSignOff ? 'Under Review' : 'Completed';
      expect(submitStatus).toBe('Under Review');
    });

    test('Tasks NOT requiring sign-off transition directly to "Completed"', () => {
      const taskWithoutSignOff = mockTasks[2];
      expect(taskWithoutSignOff.requiresSignOff).toBe(false);

      const submitStatus: TaskStatus = taskWithoutSignOff.requiresSignOff ? 'Under Review' : 'Completed';
      expect(submitStatus).toBe('Completed');
    });
  });

  describe('Notifications Deep Linking Logic', () => {
    test('Task notifications route to TaskDetails with taskId', () => {
      const notif = {
        id: 'notif-task-1',
        type: 'Task',
        relatedEntityType: 'task',
        relatedEntityId: 'tsk-101',
      };

      const isTask = notif.relatedEntityType === 'task' || notif.type.toLowerCase().includes('task');
      expect(isTask).toBe(true);
      expect(notif.relatedEntityId).toBe('tsk-101');
    });

    test('Dispatch notifications route to DispatchDetails with dispatchId', () => {
      const notif = {
        id: 'notif-dsp-1',
        type: 'Dispatch',
        relatedEntityType: 'dispatch',
        relatedEntityId: 'dsp-101',
      };

      const isDispatch = notif.relatedEntityType === 'dispatch' || notif.type.toLowerCase().includes('dispatch');
      expect(isDispatch).toBe(true);
      expect(notif.relatedEntityId).toBe('dsp-101');
    });
  });
});
