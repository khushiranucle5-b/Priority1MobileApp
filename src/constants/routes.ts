export const ROUTES = {
  // Auth stack
  AUTH: 'Auth',
  LOGIN: 'Login',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Main stack
  MAIN: 'Main',

  // Tab screens
  HOME: 'Home',
  ATTENDANCE: 'Attendance',
  DUTY: 'Duty',
  PATROL: 'Patrol',
  PROFILE: 'Profile',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RouteName = (typeof ROUTES)[RouteKey];
