import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../types/navigation.types';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { SelfieVerificationScreen } from '../features/attendance/screens/SelfieVerificationScreen';
import { LeaveScreen } from '../features/leave/screens/LeaveScreen';
import { IncidentScreen } from '../features/incident/screens/IncidentScreen';
import { HolidaysScreen } from '../features/holidays/screens/HolidaysScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { NotificationDetailsScreen } from '../features/notifications/screens/NotificationDetailsScreen';
import { LoneWorkerScreen } from '../features/safety/screens/LoneWorkerScreen';
import { PostOrdersScreen } from '../features/resources/screens/PostOrdersScreen';
import { AssetsScreen } from '../features/resources/screens/AssetsScreen';
import { DocumentsScreen } from '../features/resources/screens/DocumentsScreen';
import { MessagesScreen } from '../features/communication/screens/MessagesScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="SelfieVerification" component={SelfieVerificationScreen} />
      <Stack.Screen name="Leave" component={LeaveScreen} />
      <Stack.Screen name="Incident" component={IncidentScreen} />
      <Stack.Screen name="Holidays" component={HolidaysScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="NotificationDetails" component={NotificationDetailsScreen} />
      <Stack.Screen name="LoneWorker" component={LoneWorkerScreen} />
      <Stack.Screen name="PostOrders" component={PostOrdersScreen} />
      <Stack.Screen name="Assets" component={AssetsScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
    </Stack.Navigator>
  );
};
