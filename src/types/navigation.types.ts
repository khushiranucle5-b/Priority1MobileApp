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
  AttendanceDetails: { recordId?: string; dateStr?: string };
};

export type PatrolStackParamList = {
  PatrolMain: undefined;
  PatrolDateLogs: { dateStr: string };
  PatrolDetails: { patrolId: string };
};

export type HomeStackParamList = {
  HomeMain: undefined;
  SelfieVerification: { actionType: 'Clock In' | 'Clock Out' };
  Duty: undefined;
  Patrol: undefined;
  PatrolDateLogs: { dateStr: string };
  PatrolDetails: { patrolId: string };
  Leave: undefined;
  Incident: undefined;
  IncidentDetails: { incidentId: string };
  FileIncident: { prefillTitle?: string, incidentId?: string } | undefined;
  Holidays: undefined;
  HolidayDetails: { holidayId: string };
  Notifications: undefined;
  NotificationDetails: { notificationId: string };
  LoneWorker: undefined;
  LoneWorkerDetails: { recordId: string };
  SafetyHistory: undefined;
  SafetyDateChecks: { dateStr: string };
  PostOrders: undefined;
  Assets: undefined;
  AssetDetails: { assetId: string };
  Documents: undefined;
  UploadDocument: { documentId?: string } | undefined;
  Messages: undefined;
  Policies: undefined;
  PolicyDetails: { policyId: string };
  Payslips: undefined;
  PayslipDetails: { payslipId: string };
  SitesList: undefined;
  SiteDetails: { siteId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  ProfileSettings: undefined;
  ChangePassword: undefined;
  NotificationSettings: undefined;
  PrivacySecurity: undefined;
  BiometricAppLock: undefined;
  PrivacyPolicy: undefined;
  TermsConditions: undefined;
  LocationGPS: undefined;
  AttendanceSettings: undefined;
  Appearance: undefined;
  HelpSupport: undefined;
  ContactSupport: undefined;
  AppPermissions: undefined;
  DataStorage: undefined;
  AboutApplication: undefined;
  Documents: undefined;
  UploadDocument: { documentId?: string } | undefined;
};

export type TabParamList = {
  Home: { screen?: keyof HomeStackParamList; params?: any } | undefined;
  Attendance: { screen?: keyof AttendanceStackParamList; params?: any } | undefined;
  Duty: undefined;
  Patrol: { screen?: keyof PatrolStackParamList; params?: any } | undefined;
  Profile: { screen?: keyof ProfileStackParamList; params?: any } | undefined;
};
