import { getPatrolAvailability, findCurrentPatrol, parsePatrolDateTime } from '../src/features/patrol/utils/patrolUtils';
import { DBPatrol } from '../src/store/useGuardStore';

describe('Patrol Availability & Current Patrol Selection Logic', () => {
  const mockPatrol6to7: DBPatrol = {
    id: 'patrol-6-7',
    companyId: 'c-1',
    site: 'Ahmedabad Plant',
    siteId: 's-01',
    title: 'Early Evening Perimeter Patrol',
    guard: 'Khushi Rani',
    guardId: 'guard-1',
    date: '2026-08-25',
    startTime: '06:00 PM',
    scheduledStartTime: '06:00 PM',
    endTime: '07:00 PM',
    scheduledEndTime: '07:00 PM',
    status: 'Scheduled',
    checkpoints: 5,
    scanned: 0,
    missed: 0,
    incidents: 0,
  };

  const mockPatrol7to8: DBPatrol = {
    id: 'patrol-7-8',
    companyId: 'c-1',
    site: 'Ahmedabad Plant',
    siteId: 's-01',
    title: 'Evening Main Patrol',
    guard: 'Khushi Rani',
    guardId: 'guard-1',
    date: '2026-08-25',
    startTime: '07:00 PM',
    scheduledStartTime: '07:00 PM',
    endTime: '08:00 PM',
    scheduledEndTime: '08:00 PM',
    status: 'Scheduled',
    checkpoints: 5,
    scanned: 0,
    missed: 0,
    incidents: 0,
  };

  test('Test A: At 5:59 PM, 6:00 PM patrol is disabled', () => {
    const at559 = new Date(2026, 7, 25, 17, 59, 0); // 5:59 PM
    const avail = getPatrolAvailability(mockPatrol6to7, 0, at559);
    expect(avail.canStart).toBe(false);
    expect(avail.statusLabel).toBe('Scheduled');
    expect(avail.buttonText).toBe('Available at 06:00 PM');
  });

  test('Test B: At 6:00 PM, 6:00 PM patrol automatically becomes AVAILABLE and START PATROLLING becomes enabled', () => {
    const at600 = new Date(2026, 7, 25, 18, 0, 0); // 6:00 PM
    const avail = getPatrolAvailability(mockPatrol6to7, 0, at600);
    expect(avail.canStart).toBe(true);
    expect(avail.statusLabel).toBe('Available');
    expect(avail.buttonText).toBe('START PATROLLING');
  });

  test('Test C: Started patrol becomes IN PROGRESS, Continue enabled', () => {
    const at615 = new Date(2026, 7, 25, 18, 15, 0); // 6:15 PM
    const startedPatrol: DBPatrol = { ...mockPatrol6to7, status: 'in_progress', scanned: 1 };
    const avail = getPatrolAvailability(startedPatrol, 0, at615);
    expect(avail.canStart).toBe(true);
    expect(avail.isInProgress).toBe(true);
    expect(avail.statusLabel).toBe('In Progress');
    expect(avail.buttonText).toBe('CONTINUE PATROLLING');
  });

  test('Test D: At 7:01 PM with scans, Continue is still enabled (grace period)', () => {
    const at701 = new Date(2026, 7, 25, 19, 1, 0); // 7:01 PM
    const startedPatrol: DBPatrol = { ...mockPatrol6to7, status: 'in_progress', scanned: 2 };
    const avail = getPatrolAvailability(startedPatrol, 0, at701);
    expect(avail.canStart).toBe(true);
    expect(avail.isInProgress).toBe(true);
    expect(avail.buttonText).toBe('CONTINUE PATROLLING');
  });

  test('Test E: At 7:01 PM for 6:00 PM - 7:00 PM patrol with 0 scans (within grace period 7:00 PM - 7:30 PM) -> START PATROLLING still enabled', () => {
    const at701 = new Date(2026, 7, 25, 19, 1, 0); // 7:01 PM
    const unstartedPatrol: DBPatrol = { ...mockPatrol6to7, status: 'Scheduled', scanned: 0 };
    const avail = getPatrolAvailability(unstartedPatrol, 0, at701);
    expect(avail.canStart).toBe(true);
    expect(avail.statusLabel).toBe('Available');
    expect(avail.buttonText).toBe('START PATROLLING');
  });

  test('Test E2: At 7:31 PM for 6:00 PM - 7:00 PM patrol with 0 scans (after grace period cutoff) -> EXPIRED, disabled', () => {
    const at731 = new Date(2026, 7, 25, 19, 31, 0); // 7:31 PM
    const unstartedPatrol: DBPatrol = { ...mockPatrol6to7, status: 'Scheduled', scanned: 0 };
    const avail = getPatrolAvailability(unstartedPatrol, 0, at731);
    expect(avail.canStart).toBe(false);
    expect(avail.isExpired).toBe(true);
    expect(avail.statusLabel).toBe('Expired');
    expect(avail.buttonText).toBe('PATROL EXPIRED');
  });

  test('Test E3: At 8:20 PM for Evening Main Patrol (7:00 PM - 8:00 PM) with 0 scans (before 8:30 PM grace cutoff) -> START PATROLLING enabled', () => {
    const at820 = new Date(2026, 7, 25, 20, 20, 0); // 8:20 PM
    const avail = getPatrolAvailability(mockPatrol7to8, 0, at820);
    expect(avail.canStart).toBe(true);
    expect(avail.statusLabel).toBe('Available');
    expect(avail.buttonText).toBe('START PATROLLING');
  });

  test('Test E4: At 8:31 PM for Evening Main Patrol (7:00 PM - 8:00 PM) with 0 scans (after 8:30 PM grace cutoff) -> EXPIRED, disabled', () => {
    const at831 = new Date(2026, 7, 25, 20, 31, 0); // 8:31 PM
    const avail = getPatrolAvailability(mockPatrol7to8, 0, at831);
    expect(avail.canStart).toBe(false);
    expect(avail.isExpired).toBe(true);
    expect(avail.statusLabel).toBe('Expired');
    expect(avail.buttonText).toBe('PATROL EXPIRED');
  });

  test('Test F: At 7:29 PM with scans -> Continue enabled', () => {
    const at729 = new Date(2026, 7, 25, 19, 29, 0); // 7:29 PM
    const startedPatrol: DBPatrol = { ...mockPatrol6to7, status: 'in_progress', scanned: 3 };
    const avail = getPatrolAvailability(startedPatrol, 0, at729);
    expect(avail.canStart).toBe(true);
    expect(avail.isInProgress).toBe(true);
    expect(avail.buttonText).toBe('CONTINUE PATROLLING');
  });

  test('Test G: At 7:30 PM+ with scans but incomplete -> INCOMPLETE, disabled', () => {
    const at731 = new Date(2026, 7, 25, 19, 31, 0); // 7:31 PM
    const incompletePatrol: DBPatrol = { ...mockPatrol6to7, status: 'in_progress', scanned: 3 };
    const avail = getPatrolAvailability(incompletePatrol, 0, at731);
    expect(avail.canStart).toBe(false);
    expect(avail.isIncomplete).toBe(true);
    expect(avail.statusLabel).toBe('Incomplete');
    expect(avail.buttonText).toBe('INCOMPLETE PATROL');
  });

  test('Test H: At 7:30 PM+ with 0 scans -> EXPIRED, disabled', () => {
    const at731 = new Date(2026, 7, 25, 19, 31, 0); // 7:31 PM
    const unstartedPatrol: DBPatrol = { ...mockPatrol6to7, status: 'Scheduled', scanned: 0 };
    const avail = getPatrolAvailability(unstartedPatrol, 0, at731);
    expect(avail.canStart).toBe(false);
    expect(avail.isExpired).toBe(true);
    expect(avail.statusLabel).toBe('Expired');
    expect(avail.buttonText).toBe('PATROL EXPIRED');
  });

  test('Test I: At 7:31 PM, 7:00 PM patrol is AVAILABLE while 6:00 PM unstarted patrol has expired', () => {
    const at731 = new Date(2026, 7, 25, 19, 31, 0); // 7:31 PM
    const patrols = [mockPatrol6to7, mockPatrol7to8];
    const current = findCurrentPatrol(patrols, at731);

    expect(current).not.toBeNull();
    expect(current?.id).toBe('patrol-7-8');

    const avail6to7 = getPatrolAvailability(mockPatrol6to7, 0, at731);
    const avail7to8 = getPatrolAvailability(mockPatrol7to8, 0, at731);

    expect(avail6to7.canStart).toBe(false);
    expect(avail7to8.canStart).toBe(true);
    expect(avail7to8.statusLabel).toBe('Available');
  });

  test('Test J: A past patrol must NEVER become AVAILABLE again after cutoff', () => {
    const at814 = new Date(2026, 7, 25, 20, 14, 0); // 8:14 PM
    const availPast = getPatrolAvailability(mockPatrol6to7, 0, at814);
    expect(availPast.canStart).toBe(false);
    expect(availPast.statusLabel).toBe('Expired');
  });
});
