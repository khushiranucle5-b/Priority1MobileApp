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
    </Stack.Navigator>
  );
};
