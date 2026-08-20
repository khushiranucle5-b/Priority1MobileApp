import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types/navigation.types';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { SettingsScreen } from '../features/profile/screens/SettingsScreen';

import { ProfileSettingsScreen } from '../features/profile/screens/ProfileSettingsScreen';
import { ChangePasswordScreen } from '../features/profile/screens/ChangePasswordScreen';
import { NotificationSettingsScreen } from '../features/profile/screens/NotificationSettingsScreen';
import { PrivacySecurityScreen } from '../features/profile/screens/PrivacySecurityScreen';
import { BiometricAppLockScreen } from '../features/profile/screens/BiometricAppLockScreen';
import { PrivacyPolicyScreen } from '../features/profile/screens/PrivacyPolicyScreen';
import { TermsConditionsScreen } from '../features/profile/screens/TermsConditionsScreen';
import { LocationGPSScreen } from '../features/profile/screens/LocationGPSScreen';
import { AttendanceSettingsScreen } from '../features/profile/screens/AttendanceSettingsScreen';
import { AppearanceScreen } from '../features/profile/screens/AppearanceScreen';
import { HelpSupportScreen } from '../features/profile/screens/HelpSupportScreen';
import { ContactSupportScreen } from '../features/profile/screens/ContactSupportScreen';
import { AppPermissionsScreen } from '../features/profile/screens/AppPermissionsScreen';
import { DataStorageScreen } from '../features/profile/screens/DataStorageScreen';
import { AboutApplicationScreen } from '../features/profile/screens/AboutApplicationScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="BiometricAppLock" component={BiometricAppLockScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
      <Stack.Screen name="LocationGPS" component={LocationGPSScreen} />
      <Stack.Screen name="AttendanceSettings" component={AttendanceSettingsScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="AppPermissions" component={AppPermissionsScreen} />
      <Stack.Screen name="DataStorage" component={DataStorageScreen} />
      <Stack.Screen name="AboutApplication" component={AboutApplicationScreen} />
    </Stack.Navigator>
  );
};
