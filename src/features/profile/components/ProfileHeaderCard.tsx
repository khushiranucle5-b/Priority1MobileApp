import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const ProfileHeaderCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
          style={[styles.avatar, { borderRadius: borderRadius.full, backgroundColor: colors.surfaceSecondary }]} 
        />
        <View style={styles.info}>
          <Heading level="h3">John Doe</Heading>
          <AppText size="sm" color="secondary">ID: GRD-2026-001</AppText>
          <AppText size="sm" color="secondary">Senior Security Guard</AppText>
          <AppText size="xs" color="secondary" style={styles.joined}>Joined: Jan 15, 2024</AppText>
        </View>
      </View>

      <View style={[styles.statusContainer, { borderTopColor: colors.border, marginTop: spacing.sm }]}>
        <View style={styles.statusRow}>
          <AppText size="sm" color="secondary">Current Status</AppText>
          <View style={[styles.badge, { backgroundColor: colors.successLight, borderRadius: borderRadius.full }]}>
            <View style={[styles.dot, { backgroundColor: colors.success, borderRadius: borderRadius.full }]} />
            <AppText size="sm" color="success" weight="bold">On Duty</AppText>
          </View>
        </View>
        <View style={styles.statusRow}>
          <AppText size="sm" color="secondary">Assigned Company</AppText>
          <AppText size="sm" weight="medium">PriorityOne Security</AppText>
        </View>
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
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  joined: {
    marginTop: 4,
  },
  statusContainer: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    marginRight: 6,
  }
});
