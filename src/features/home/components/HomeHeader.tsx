import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation.types';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { Heading } from '../../../components/typography/Heading';
import { AppText } from '../../../components/typography/Text';

import { NavIcon } from '../../../components/NavIcon';
import { LoneWorkerModal } from './LoneWorkerModal';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface HomeHeaderProps {
  onMenuPress?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onMenuPress }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { notifications, guardName, isClockedIn, loneWorker } = useGuardStore();
  
  const [isSafetyModalOpen, setIsSafetyModalOpen] = React.useState(false);
  const [nowMs, setNowMs] = React.useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const elapsedMs = loneWorker.lastCheckInTimestamp ? nowMs - loneWorker.lastCheckInTimestamp : 0;

  const getSafetyStatusColor = () => {
    if (!isClockedIn) return '#94A3B8';
    if (elapsedMs >= 45 * 60 * 1000) return '#DC2626';
    if (elapsedMs >= 30 * 60 * 1000) return '#D97706';
    return '#059669';
  };

  const safetyColor = getSafetyStatusColor();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <View style={[styles.container, { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
        <View style={styles.profileSection}>
          {onMenuPress && (
            <TouchableOpacity onPress={onMenuPress} style={{ marginRight: 12 }}>
              <AppText size="xl">☰</AppText>
            </TouchableOpacity>
          )}
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
            style={[styles.avatar, { borderRadius: borderRadius.full }]}
          />
          <View style={styles.textContainer}>
            <AppText size="sm" color="secondary">{getGreeting()}</AppText>
            <Heading level="h4">{guardName || 'Security Officer'}</Heading>
          </View>
        </View>
        
        <View style={styles.rightSection}>
          <AppText size="xs" color="secondary" style={styles.date}>{getFormattedDate()}</AppText>

          <View style={styles.headerActionsRow}>
            {/* Lone Worker Safety Icon */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full, borderColor: safetyColor, borderWidth: isClockedIn ? 1.5 : 0 },
              ]}
              onPress={() => setIsSafetyModalOpen(true)}
              activeOpacity={0.7}
            >
              <NavIcon name="loneworker" size={18} color={safetyColor} />
              {isClockedIn && (
                <View style={[styles.statusDot, { backgroundColor: safetyColor }]} />
              )}
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity 
              style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }]}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.7}
            >
              <NavIcon name="messages" size={18} color="#475569" />
              {unreadCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.error, borderRadius: borderRadius.full }]}>
                  <AppText size="xs" color="surface" weight="bold" style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Lone Worker Safety Sheet */}
      <LoneWorkerModal
        visible={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  textContainer: {
    justifyContent: 'center',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  date: {
    marginBottom: 4,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
});
