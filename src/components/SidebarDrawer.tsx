import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppText } from './typography/Text';
import { Heading } from './typography/Heading';
import { useTheme } from '../providers/ThemeProvider';
import { useAuthStore } from '../store/useAuthStore';
import { useGuardStore } from '../store/useGuardStore';

import { NavIcon, NavIconName } from './NavIcon';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const { spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const currentRoute = useRoute();
  const logout = useAuthStore((state) => state.logout);
  const { guardName, guardId, assignedSite } = useGuardStore();

  const activeName = currentRoute.name;

  const navigateTo = (route: string, params?: any) => {
    onClose();
    const tabRoutes = ['Attendance', 'Duty', 'Patrol', 'Profile'];
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
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Sidebar Panel - Left-Aligned Drawer */}
        <View style={styles.panel}>
          {/* Header */}
          <View style={[styles.header, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
            <View>
              <Heading level="h3" style={{ color: '#FFFFFF', fontSize: 18 }}>Priority One</Heading>
              <AppText size="xs" style={{ color: '#94A3B8', marginTop: 2 }}>Security ERP • Portal</AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <AppText size="lg" style={{ color: '#94A3B8', fontSize: 20 }}>✕</AppText>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing.md }}>
            {sections.map((sec, idx) => (
              <View key={idx} style={styles.section}>
                <AppText size="xs" weight="bold" style={styles.sectionTitle}>
                  {sec.title.toUpperCase()}
                </AppText>
                {sec.items.map((item, itemIdx) => {
                  const isActive = activeName === item.route;
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
                        style={[
                          styles.itemLabel,
                          isActive && { color: '#FFFFFF', fontWeight: 'bold' },
                        ]}
                      >
                        {item.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Guard Profile Footer */}
            <View style={styles.profileBox}>
              <View style={styles.avatar}>
                <AppText style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>
                  {guardName ? guardName.charAt(0).toUpperCase() : 'G'}
                </AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText size="sm" weight="bold" style={{ color: '#FFFFFF', fontSize: 15 }}>{guardName || 'Security Officer'}</AppText>
                <AppText size="xs" style={{ color: '#94A3B8', fontSize: 12 }}>{guardId || 'GRD-001'} • {assignedSite || 'Main Site'}</AppText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.logoutBtn, { borderRadius: borderRadius.md }]}
              onPress={async () => {
                onClose();
                await logout();
              }}
            >
              <AppText style={{ color: '#EF4444', textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>Sign Out</AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Dark Backdrop (Tapping closes drawer) */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  panel: {
    width: 290,
    height: '100%',
    backgroundColor: '#0F172A',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingTop: 16,
  },
  closeBtn: {
    padding: 6,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#64748B',
    letterSpacing: 1.2,
    fontSize: 11,
    paddingLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 3,
    minHeight: 46,
  },
  activeItem: {
    backgroundColor: '#4F46E5',
  },
  itemIcon: {
    marginRight: 12,
    fontSize: 18,
    color: '#FFFFFF',
  },
  itemLabel: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '500',
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    paddingVertical: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    marginBottom: 40,
  },
});
