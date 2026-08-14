import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

const mockNotifications = [
  { id: '1', title: 'Shift Starting Soon', desc: 'Your morning shift starts in 30 mins.', time: '10m ago', icon: '⏰' },
  { id: '2', title: 'New Message', desc: 'Supervisor sent you a message.', time: '1h ago', icon: '💬' },
  { id: '3', title: 'Leave Approved', desc: 'Your leave for tomorrow is approved.', time: '2h ago', icon: '✅' },
];

export const NotificationCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Heading level="h4">Recent Notifications</Heading>
        <TouchableOpacity>
          <AppText size="sm" color="primary" weight="medium">View All</AppText>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {mockNotifications.map((notif, index) => (
          <View key={notif.id} style={[styles.item, index !== mockNotifications.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }]}>
              <AppText size="base">{notif.icon}</AppText>
            </View>
            <View style={styles.content}>
              <View style={styles.itemHeader}>
                <AppText size="sm" weight="semibold">{notif.title}</AppText>
                <AppText size="xs" color="secondary">{notif.time}</AppText>
              </View>
              <AppText size="xs" color="secondary" style={styles.desc}>{notif.desc}</AppText>
            </View>
          </View>
        ))}
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
    width: 40,
    height: 40,
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
  }
});
