import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ScrollView, useWindowDimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { AppText } from './typography/Text';
import { Heading } from './typography/Heading';
import { useTheme } from '../providers/ThemeProvider';
import { useAuthStore } from '../store/useAuthStore';
import { useGuardStore } from '../store/useGuardStore';
import { useDrawerStore } from '../store/useDrawerStore';
import { NavIcon, NavIconName } from './NavIcon';
import { DevLocationSimulator } from './DevLocationSimulator';

interface SidebarDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  activeRouteName?: string;
}

interface DrawerMenuItem {
  label: string;
  route: string;
  icon: NavIconName;
  params?: any;
}

// Helper to find innermost active route name recursively
const getActiveRouteName = (state: any): string | undefined => {
  if (!state || !state.routes || state.routes.length === 0) return undefined;
  const route = state.routes[state.index ?? 0];
  if (route.state) {
    return getActiveRouteName(route.state);
  }
  return route.name;
};

// Helper to check if a drawer item matches the current active screen
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

const getInitials = (name?: string) => {
  if (!name || !name.trim()) return 'DJ';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  activeRouteName,
}) => {
  const [showDevSimulator, setShowDevSimulator] = React.useState(false);
  const storeIsOpen = useDrawerStore((state) => state.isOpen);
  const storeCloseDrawer = useDrawerStore((state) => state.closeDrawer);

  const isOpen = propIsOpen ?? storeIsOpen;
  const onClose = propOnClose ?? storeCloseDrawer;

  console.log('[SidebarDrawer] Rendering, isOpen:', isOpen);
  const { borderRadius, colors } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  let navigation: any;
  try {
    navigation = useNavigation<any>();
  } catch {
    navigation = null;
  }

  let currentRouteName: string | undefined;
  try {
    currentRouteName = useNavigationState((state) => (state ? getActiveRouteName(state) : undefined));
  } catch {
    currentRouteName = undefined;
  }

  const { user, logout } = useAuthStore();
  const { guardName, guardId, assignedSite, profilePic } = useGuardStore();

  // Drawer Width: 80-85% of mobile screen width
  const drawerWidth = Math.min(Math.round(width * 0.82), 360);
  const activeName = activeRouteName || currentRouteName || 'HomeScreen';

  const topPadding = Math.max(insets.top + 16, 52);
  const bottomInset = Math.max(insets.bottom, 16);

  const navigateTo = (route: string, params?: any) => {
    onClose();
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

  const sections: { title: string; items: DrawerMenuItem[] }[] = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', route: 'HomeScreen', icon: 'dashboard' },
      ],
    },
    {
      title: 'ORGANIZATION',
      items: [
        { label: 'Sites', route: 'SitesList', icon: 'sites' },
      ],
    },
    {
      title: 'OPERATIONS',
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
      title: 'FINANCE & HR',
      items: [
        { label: 'My Payslips', route: 'Payslips', icon: 'payslips' },
        { label: 'Holidays', route: 'Holidays', icon: 'holidays' },
        { label: 'Policy Manual', route: 'Policies', icon: 'policies' },
      ],
    },
    {
      title: 'COMMUNICATION',
      items: [
        { label: 'Direct Messages', route: 'Messages', icon: 'messages' },
      ],
    },
  ];

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Mobile Drawer Panel */}
        <View style={[styles.panel, { width: drawerWidth, backgroundColor: colors.surface }]}>
          {/* Top Header UI */}
          <View style={[styles.header, { paddingTop: topPadding, borderBottomColor: colors.border }]}>
            <View>
              <Heading level="h3" style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Priority One</Heading>
              <AppText size="xs" style={{ color: colors.textTertiary, marginTop: 3, fontWeight: '600' }}>Security ERP • Portal</AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <NavIcon name="close" size={24} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Navigation Sections */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 }}>
            {sections.map((sec, idx) => (
              <View key={idx} style={styles.section}>
                <AppText size="xs" weight="bold" style={[styles.sectionTitle, { color: colors.textTertiary }]}>
                  {sec.title}
                </AppText>
                {sec.items.map((item, itemIdx) => {
                  const isActive = isRouteActive(item.route, activeName);
                  return (
                    <TouchableOpacity
                      key={itemIdx}
                      style={[
                        styles.item,
                        { borderRadius: borderRadius.md },
                        isActive && [styles.activeItem, { backgroundColor: colors.surfaceSecondary, borderLeftColor: colors.primary[500] }],
                      ]}
                      onPress={() => navigateTo(item.route)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.iconContainer}>
                        <NavIcon name={item.icon} size={28} color={isActive ? colors.primary[500] : colors.textTertiary} />
                      </View>
                      <AppText
                        style={[
                          styles.itemLabel,
                          { color: colors.textSecondary },
                          isActive && { color: colors.text, fontWeight: '500' },
                        ]}
                      >
                        {item.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          {/* Fixed Bottom Footer (User Profile & Sign Out Button Row) */}
          <View style={[styles.bottomFooter, { paddingBottom: bottomInset + 8, borderTopColor: colors.border, backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.userSignoutRow, { marginBottom: 8, backgroundColor: colors.warningLight, borderColor: colors.warningBorder }]}
              onPress={() => setShowDevSimulator(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.avatarCircle, { backgroundColor: 'transparent' }]}>
                <AppText style={{ fontSize: 20 }}>🛠</AppText>
              </View>
              <View style={styles.userInfoContainer}>
                <AppText style={{ color: colors.warning, fontSize: 14, fontWeight: '600' }}>GPS Location Simulator</AppText>
                <AppText style={{ color: colors.textTertiary, fontSize: 11 }}>Test Geofence Edge Cases</AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.userSignoutRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              onPress={async () => {
                onClose();
                await logout();
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.avatarCircle, { backgroundColor: colors.surfacePressed }]}>
                {profilePic ? (
                  <Image source={{ uri: profilePic }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                ) : (
                  <AppText style={[styles.avatarText, { color: colors.text }]}>
                    {getInitials(guardName || user?.name)}
                  </AppText>
                )}
              </View>

              <View style={styles.userInfoContainer}>
                <AppText style={[styles.userNameText, { color: colors.text }]} numberOfLines={1}>
                  {guardName || user?.name || 'David Johnson'}
                </AppText>
                <AppText style={[styles.userRoleText, { color: colors.textTertiary }]} numberOfLines={1}>
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Guard'}
                </AppText>
              </View>

              <View style={styles.signoutIconBox}>
                <NavIcon name="logout" size={20} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Backdrop (Tapping closes drawer) */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      </View>

      <DevLocationSimulator visible={showDevSimulator} onClose={() => setShowDevSimulator(false)} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  panel: {
    height: '100%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    justifyContent: 'space-between',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomFooter: {
    paddingHorizontal: 14,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  userSignoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: '700',
    fontSize: 15,
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  userNameText: {
    fontSize: 15.5,
    fontWeight: '600',
  },
  userRoleText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
  },
  signoutIconBox: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    letterSpacing: 1.4,
    fontSize: 12.5,
    fontWeight: '600',
    paddingLeft: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginVertical: 3,
    minHeight: 56,
  },
  activeItem: {
    borderLeftWidth: 4,
    paddingLeft: 10,
  },
  iconContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemLabel: {
    fontSize: 17,
    fontWeight: '400',
    letterSpacing: 0.2,
  },
});
