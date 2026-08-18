import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppText } from './typography/Text';
import { Heading } from './typography/Heading';
import { useTheme } from '../providers/ThemeProvider';
import { useAuthStore } from '../store/useAuthStore';
import { useGuardStore } from '../store/useGuardStore';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const { spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const logout = useAuthStore((state) => state.logout);
  const { guardName, guardId, assignedSite } = useGuardStore();

  const navigateTo = (route: string, params?: any) => {
    onClose();
    const tabRoutes = ['Attendance', 'Duty', 'Patrol', 'Profile'];
    if (tabRoutes.includes(route)) {
      navigation.navigate(route);
    } else {
      navigation.navigate('Home', { screen: route, params });
    }
  };

  const sections = [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', route: 'HomeScreen', icon: '🏠' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Attendance', route: 'Attendance', icon: '⏱️' },
        { label: 'Leaves', route: 'Leave', icon: '📅' },
        { label: 'Patrol Logs', route: 'Patrol', icon: '🚨' },
        { label: 'Incidents', route: 'Incident', icon: '⚠️' },
        { label: 'Lone Worker Check', route: 'LoneWorker', icon: '🛡️' },
        { label: 'Assets', route: 'Assets', icon: '📦' },
      ],
    },
    {
      title: 'Communication',
      items: [
        { label: 'Direct Messages', route: 'Messages', icon: '💬' },
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
        {/* Backdrop to close */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        {/* Sidebar Panel - Dark Navy Style */}
        <View style={styles.panel}>
          <View style={[styles.header, { padding: spacing.md }]}>
            <View>
              <Heading level="h3" style={{ color: '#FFFFFF' }}>Priority One</Heading>
              <AppText size="xs" style={{ color: '#94A3B8' }}>Security ERP • Guard Portal</AppText>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <AppText size="lg" style={{ color: '#94A3B8' }}>✕</AppText>
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={{ padding: spacing.md }}>
            {sections.map((sec, idx) => (
              <View key={idx} style={styles.section}>
                <AppText size="xs" weight="bold" style={styles.sectionTitle}>
                  {sec.title.toUpperCase()}
                </AppText>
                {sec.items.map((item, itemIdx) => (
                  <TouchableOpacity
                    key={itemIdx}
                    style={[styles.item, { borderRadius: borderRadius.sm }]}
                    onPress={() => navigateTo(item.route)}
                  >
                    <AppText size="sm" style={styles.itemIcon}>{item.icon}</AppText>
                    <AppText size="sm" weight="medium" style={styles.itemLabel}>
                      {item.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
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
                onClose();
                await logout();
              }}
            >
              <AppText style={{ color: '#EF4444', textAlign: 'center', fontWeight: 'bold' }}>Sign Out</AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  panel: {
    width: 290,
    height: '100%',
    backgroundColor: '#0F172A',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 2,
    backgroundColor: '#1E293B',
  },
  itemIcon: {
    marginRight: 12,
  },
  itemLabel: {
    color: '#F8FAFC',
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    paddingVertical: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    marginBottom: 40,
  }
});
