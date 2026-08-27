import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppText } from './typography/Text';
import { Heading } from './typography/Heading';
import { useTheme } from '../providers/ThemeProvider';
import { useAuthStore } from '../store/useAuthStore';
import { useGuardStore } from '../store/useGuardStore';

import { NavIcon, NavIconName } from './NavIcon';

interface PersistentSidebarProps {
  activeRoute?: string;
}

const isRouteActive = (itemRoute: string, currentRoute?: string) => {
  if (!itemRoute || !currentRoute) return false;
  if (itemRoute === currentRoute) return true;

  const routeMap: Record<string, string[]> = {
    HomeScreen: ['Home', 'HomeMain', 'HomeScreen', 'Dashboard'],
    HomeMain: ['Home', 'HomeMain', 'HomeScreen', 'Dashboard'],
    Home: ['Home', 'HomeMain', 'HomeScreen', 'Dashboard'],
    Attendance: ['Attendance', 'AttendanceMain'],
    Patrol: ['Patrol', 'PatrolMain', 'PatrolDateLogs', 'PatrolDetails', 'PatrolLogs'],
    Leave: ['Leave', 'Leaves'],
    Incident: ['Incident', 'IncidentDetails', 'FileIncident'],
    LoneWorker: ['LoneWorker', 'LoneWorkerDetails', 'SafetyHistory', 'SafetyDateChecks'],
    SitesList: ['SitesList', 'SiteDetails', 'ChecklistExecution'],
    Payslips: ['Payslips', 'PayslipDetails'],
    Holidays: ['Holidays', 'HolidayDetails'],
    Policies: ['Policies', 'PolicyDetails'],
    Messages: ['Messages', 'ChatScreen'],
    Assets: ['Assets', 'AssetDetails'],
  };

  const matches = routeMap[itemRoute];
  if (matches && matches.includes(currentRoute)) return true;

  return itemRoute.toLowerCase() === currentRoute.toLowerCase();
};

export const PersistentSidebar: React.FC<PersistentSidebarProps> = ({ activeRoute }) => {
  const { borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const currentRoute = useRoute();
  const logout = useAuthStore((state) => state.logout);
  const { guardName, guardId, assignedSite } = useGuardStore();

  const activeName = activeRoute || currentRoute.name;

  const navigateTo = (route: string, params?: any) => {
    if (route === 'HomeScreen' || route === 'HomeMain' || route === 'Dashboard') {
      navigation.navigate('Home', { screen: 'HomeMain', params });
      return;
    }
    const tabRoutes = ['Home', 'Attendance', 'Duty', 'Patrol', 'Profile'];
    if (tabRoutes.includes(route)) {
      navigation.navigate(route);
    } else {
      navigation.navigate('Home', { screen: route, params });
    }
  };

  const sections: { title: string; items: { label: string; route: string; icon: NavIconName }[] }[] = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', route: 'HomeScreen', icon: 'dashboard' },
      ],
    },
    {
      title: 'Organization',
      items: [
        { label: 'Sites', route: 'SitesList', icon: 'sites' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Attendance', route: 'Attendance', icon: 'attendance' },
        { label: 'Leaves', route: 'Leave', icon: 'leaves' },
        { label: 'Patrol Logs', route: 'Patrol', icon: 'patrol' },
        { label: 'Incidents', route: 'Incident', icon: 'incidents' },
        { label: 'Lone Worker Check', route: 'LoneWorker', icon: 'loneworker' },
        { label: 'Assets', route: 'Assets', icon: 'assets' },
      ],
    },
    {
      title: 'Finance & HR',
      items: [
        { label: 'My Payslips', route: 'Payslips', icon: 'payslips' },
        { label: 'Holidays', route: 'Holidays', icon: 'holidays' },
        { label: 'Policy Manual', route: 'Policies', icon: 'policies' },
      ],
    },
    {
      title: 'Communication',
      items: [
        { label: 'Direct Messages', route: 'Messages', icon: 'messages' },
      ],
    },
  ];

  return (
    <View style={styles.sidebar}>
      {/* Sidebar Header */}
      <View style={styles.header}>
        <Heading level="h4" style={{ color: '#FFFFFF' }}>Acme Security Services</Heading>
        <AppText size="xs" style={{ color: '#94A3B8' }}>Security ERP • Portal</AppText>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
        {sections.map((sec, idx) => (
          <View key={idx} style={styles.section}>
            <AppText size="xs" weight="bold" style={styles.sectionTitle}>
              {sec.title.toUpperCase()}
            </AppText>
            {sec.items.map((item, itemIdx) => {
              const isActive = isRouteActive(item.route, activeName);
              return (
                <TouchableOpacity
                  key={itemIdx}
                  style={[
                    styles.item,
                    { borderRadius: borderRadius.sm },
                    isActive && styles.activeItem,
                  ]}
                  onPress={() => navigateTo(item.route)}
                >
                  <View style={{ marginRight: 12, width: 20, alignItems: 'center' }}>
                    <NavIcon name={item.icon} size={18} active={isActive} color="#94A3B8" />
                  </View>
                  <AppText
                    size="sm"
                    weight={isActive ? 'bold' : 'medium'}
                    style={{ color: isActive ? '#FFFFFF' : '#CBD5E1' }}
                  >
                    {item.label}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Profile Footer */}
        <View style={styles.profileBox}>
          <View style={styles.avatar}>
            <AppText style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
              {guardName ? guardName.charAt(0).toUpperCase() : 'G'}
            </AppText>
          </View>
          <View style={{ flex: 1 }}>
            <AppText size="sm" weight="bold" style={{ color: '#FFFFFF' }}>{guardName || 'Security Officer'}</AppText>
            <AppText size="xs" style={{ color: '#94A3B8' }}>{guardId || 'GRD-001'} • {assignedSite || 'Main Site'}</AppText>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderRadius: borderRadius.md }]}
          onPress={async () => {
            await logout();
          }}
        >
          <AppText style={{ color: '#EF4444', textAlign: 'center', fontWeight: 'bold' }}>Sign Out</AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    height: '100%',
    backgroundColor: '#0F172A',
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#64748B',
    letterSpacing: 1,
    paddingLeft: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 2,
  },
  activeItem: {
    backgroundColor: '#4F46E5',
  },
  itemIcon: {
    marginRight: 10,
    color: '#FFFFFF',
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    paddingVertical: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    marginBottom: 20,
  },
});
