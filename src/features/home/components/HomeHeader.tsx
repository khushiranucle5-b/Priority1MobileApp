import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation.types';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { useDrawerStore } from '../../../store/useDrawerStore';
import { Heading } from '../../../components/typography/Heading';
import { AppText } from '../../../components/typography/Text';

import { NavIcon } from '../../../components/NavIcon';
import { LoneWorkerModal } from './LoneWorkerModal';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface HomeHeaderProps {
  onMenuPress?: () => void;
  isScrolled?: boolean;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onMenuPress, isScrolled = false }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { notifications, guardName, profilePic } = useGuardStore();

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background || '#F8FAFC',
          paddingHorizontal: spacing.base,
          paddingTop: spacing.md,
          paddingBottom: spacing.sm,
          zIndex: 100,
        },
      ]}
    >
      <View style={styles.profileSection}>
        <TouchableOpacity
          onPress={() => {
            console.log('[HomeHeader] HAMBURGER PRESSED');
            if (onMenuPress) {
              onMenuPress();
            } else {
              useDrawerStore.getState().openDrawer();
            }
          }}
          style={styles.menuIconBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        >
          <View pointerEvents="none">
            <NavIcon name="menu" size={24} color="#334155" />
          </View>
        </TouchableOpacity>
        <Image
          source={{ uri: profilePic || 'https://i.pravatar.cc/150?img=11' }}
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
          {/* Notification Bell */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: '#F1F5F9', borderRadius: 24 }]}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <NavIcon name="bell" size={24} color="#334155" />
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
  menuIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: 'bold',
  },
});
