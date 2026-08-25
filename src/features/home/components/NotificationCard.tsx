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
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const activities = useGuardStore((state) => state.activities);

  // Take the 3 most recent activities
  const recentActivities = activities.slice(0, 3);

  const getIconName = (type: string, title: string): NavIconName => {
    const text = (type || title || '').toLowerCase();
    if (text.includes('clock') || text.includes('attendance') || text.includes('shift')) return 'attendance';
    if (text.includes('leave')) return 'leaves';
    if (text.includes('patrol') || text.includes('checkpoint')) return 'patrol';
    if (text.includes('incident')) return 'incidents';
    if (text.includes('safety')) return 'loneworker';
    return 'messages';
  };

  const handleOpenRecentActivity = () => {
    navigation.navigate('RecentActivity');
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Heading level="h4">Recent Activity</Heading>
        <TouchableOpacity onPress={handleOpenRecentActivity} activeOpacity={0.7}>
          <AppText size="base" color="primary" weight="bold">View All</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {recentActivities.map((act, index) => (
          <TouchableOpacity
            key={act.id}
            onPress={handleOpenRecentActivity}
            activeOpacity={0.7}
            style={[
              styles.item,
              index !== recentActivities.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }]}>
              <NavIcon name={getIconName(act.type, act.title)} size={18} color="#4F46E5" />
            </View>
            <View style={styles.content}>
              <View style={styles.itemHeader}>
                <AppText size="base" weight="semibold" numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
                  {act.title}
                </AppText>
                <AppText size="xs" color="secondary">{act.time}</AppText>
              </View>
              <AppText size="sm" color="secondary" style={styles.desc} numberOfLines={2}>
                {act.description}
              </AppText>
            </View>
          </TouchableOpacity>
        ))}

        {activities.length === 0 && (
          <View style={styles.emptyContainer}>
            <AppText size="sm" color="secondary" style={styles.emptyText}>
              No Recent Activity{"\n"}Your activity logs will appear here.
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
  },
});
