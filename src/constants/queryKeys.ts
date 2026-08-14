export const QUERY_KEYS = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
    session: () => ['auth', 'session'] as const,
  },

  // Attendance
  attendance: {
    all: () => ['attendance'] as const,
    today: () => ['attendance', 'today'] as const,
    history: (page: number) => ['attendance', 'history', page] as const,
    summary: (month: number, year: number) => ['attendance', 'summary', month, year] as const,
  },

  // Duty
  duty: {
    all: () => ['duty'] as const,
    today: () => ['duty', 'today'] as const,
    history: (page: number) => ['duty', 'history', page] as const,
    site: (siteId: string) => ['duty', 'site', siteId] as const,
    tasks: (dutyId: string) => ['duty', 'tasks', dutyId] as const,
  },

  // Patrol
  patrol: {
    all: () => ['patrol'] as const,
    routes: () => ['patrol', 'routes'] as const,
    active: () => ['patrol', 'active'] as const,
    history: (page: number) => ['patrol', 'history', page] as const,
  },

  // Profile
  profile: {
    me: () => ['profile', 'me'] as const,
  },

  // Notifications
  notifications: {
    all: () => ['notifications'] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
    list: (page: number) => ['notifications', 'list', page] as const,
  },
} as const;
