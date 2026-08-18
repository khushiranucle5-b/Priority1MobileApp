import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

import { NavIcon, NavIconName } from '../../../components/NavIcon';

export const NotificationCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const notifications = useGuardStore((state) => state.notifications);

  // Take the 3 most recent notifications
  const recentNotifications = notifications.slice(0, 3);

  const getIconName = (title: string): NavIconName => {
    const text = title.toLowerCase();
    if (text.includes('clock') || text.includes('attendance') || text.includes('shift')) return 'attendance';
    if (text.includes('leave')) return 'leaves';
    if (text.includes('patrol') || text.includes('checkpoint')) return 'patrol';
    return 'messages';
  };

  const handleViewAll = () => {
    navigation.navigate('Notifications');
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Heading level="h4">Recent Notifications</Heading>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={handleViewAll}>
            <AppText size="base" color="primary" weight="bold">View All</AppText>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.list}>
        {recentNotifications.map((notif, index) => (
          <View key={notif.id} style={[styles.item, index !== recentNotifications.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }]}>
              <NavIcon name={getIconName(notif.title)} size={18} color="#4F46E5" />
            </View>
            <View style={styles.content}>
              <View style={styles.itemHeader}>
                <AppText size="base" weight="semibold">{notif.title}</AppText>
                <AppText size="xs" color="secondary">{notif.time}</AppText>
              </View>
              <AppText size="sm" color="secondary" style={styles.desc}>{notif.description}</AppText>
            </View>
          </View>
        ))}

        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <AppText size="sm" color="secondary" style={styles.emptyText}>
              You're All Caught Up{"\n"}No new notifications.
            </AppText>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  list: {
    marginTop: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconStyle: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  desc: {
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 18,
  }
});
