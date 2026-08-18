export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export type AttendanceStackParamList = {
  AttendanceMain: undefined;
  SelfieVerification: { actionType: 'Clock In' | 'Clock Out' };
  AttendanceHistory: undefined;
  AttendanceDetails: { recordId: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  SelfieVerification: { actionType: 'Clock In' | 'Clock Out' };
  Duty: undefined;
  Patrol: undefined;
  Leave: undefined;
  Incident: undefined;
  Holidays: undefined;
  Notifications: undefined;
  NotificationDetails: { notificationId: string };
  LoneWorker: undefined;
  PostOrders: undefined;
  Assets: undefined;
  Documents: undefined;
  Messages: undefined;
};

export type TabParamList = {
  Home: { screen?: keyof HomeStackParamList; params?: any } | undefined;
  Attendance: { screen?: keyof AttendanceStackParamList; params?: any } | undefined;
  Duty: undefined;
  Patrol: undefined;
  Profile: undefined;
};

