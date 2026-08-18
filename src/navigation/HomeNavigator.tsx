import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types/navigation.types';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { SelfieVerificationScreen } from '../features/attendance/screens/SelfieVerificationScreen';
import { LeaveScreen } from '../features/leave/screens/LeaveScreen';
import { IncidentScreen } from '../features/incident/screens/IncidentScreen';
import { IncidentDetailsScreen } from '../features/incident/screens/IncidentDetailsScreen';
import { FileIncidentScreen } from '../features/incident/screens/FileIncidentScreen';
import { HolidaysScreen } from '../features/holidays/screens/HolidaysScreen';
import { HolidayDetailsScreen } from '../features/holidays/screens/HolidayDetailsScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { NotificationDetailsScreen } from '../features/notifications/screens/NotificationDetailsScreen';
import { LoneWorkerScreen } from '../features/safety/screens/LoneWorkerScreen';
import { LoneWorkerDetailsScreen } from '../features/safety/screens/LoneWorkerDetailsScreen';
import { PostOrdersScreen } from '../features/resources/screens/PostOrdersScreen';
import { AssetsScreen } from '../features/resources/screens/AssetsScreen';
import { AssetDetailsScreen } from '../features/resources/screens/AssetDetailsScreen';
import { DocumentsScreen } from '../features/resources/screens/DocumentsScreen';
import { MessagesScreen } from '../features/communication/screens/MessagesScreen';
import { PoliciesScreen } from '../features/policies/screens/PoliciesScreen';
import { PolicyDetailsScreen } from '../features/policies/screens/PolicyDetailsScreen';
import { PayslipsScreen } from '../features/payroll/screens/PayslipsScreen';
import { PayslipDetailsScreen } from '../features/payroll/screens/PayslipDetailsScreen';
import { SitesListScreen } from '../features/sites/screens/SitesListScreen';
import { SiteDetailsScreen } from '../features/sites/screens/SiteDetailsScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="SelfieVerification" component={SelfieVerificationScreen} />
      <Stack.Screen name="Leave" component={LeaveScreen} />
      <Stack.Screen name="Incident" component={IncidentScreen} />
      <Stack.Screen name="IncidentDetails" component={IncidentDetailsScreen} />
      <Stack.Screen name="FileIncident" component={FileIncidentScreen} />
      <Stack.Screen name="Holidays" component={HolidaysScreen} />
      <Stack.Screen name="HolidayDetails" component={HolidayDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="NotificationDetails" component={NotificationDetailsScreen} />
      <Stack.Screen name="LoneWorker" component={LoneWorkerScreen} />
      <Stack.Screen name="LoneWorkerDetails" component={LoneWorkerDetailsScreen} />
      <Stack.Screen name="PostOrders" component={PostOrdersScreen} />
      <Stack.Screen name="Assets" component={AssetsScreen} />
      <Stack.Screen name="AssetDetails" component={AssetDetailsScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="Policies" component={PoliciesScreen} />
      <Stack.Screen name="PolicyDetails" component={PolicyDetailsScreen} />
      <Stack.Screen name="Payslips" component={PayslipsScreen} />
      <Stack.Screen name="PayslipDetails" component={PayslipDetailsScreen} />
      <Stack.Screen name="SitesList" component={SitesListScreen} />
      <Stack.Screen name="SiteDetails" component={SiteDetailsScreen} />
    </Stack.Navigator>
  );
};
