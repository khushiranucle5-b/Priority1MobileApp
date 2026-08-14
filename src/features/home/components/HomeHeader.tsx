import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation.types';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { Heading } from '../../../components/typography/Heading';
import { AppText } from '../../../components/typography/Text';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export const HomeHeader: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { notifications } = useGuardStore();
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={[styles.container, { paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
      <View style={styles.profileSection}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=11' }}
          style={[styles.avatar, { borderRadius: borderRadius.full }]}
        />
        <View style={styles.textContainer}>
          <AppText size="sm" color="secondary">{getGreeting()}</AppText>
          <Heading level="h4">John Doe</Heading>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <AppText size="xs" color="secondary" style={styles.date}>Aug 05, 2026</AppText>
        <TouchableOpacity 
          style={[styles.notificationBtn, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <AppText>🔔</AppText>
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
  notificationBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
