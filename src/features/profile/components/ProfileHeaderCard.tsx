import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

import { useGuardStore } from '../../../store/useGuardStore';

export const ProfileHeaderCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { guardName, guardId, companyName, attendanceStatus, profilePic } = useGuardStore();

  const isOnline = attendanceStatus === 'Checked In';

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Image 
          source={{ uri: profilePic || 'https://i.pravatar.cc/150?img=11' }} 
          style={[styles.avatar, { borderRadius: borderRadius.full, backgroundColor: colors.surfaceSecondary }]} 
        />
        <View style={styles.info}>
          <Heading level="h2" style={styles.guardNameTitle}>{guardName || 'Security Officer'}</Heading>
          <AppText size="base" color="secondary" style={styles.subText}>ID: {guardId || 'N/A'}</AppText>
          <AppText size="base" color="secondary" style={styles.subText}>Security Guard</AppText>
        </View>
      </View>

      <View style={[styles.statusContainer, { borderTopColor: colors.border, marginTop: spacing.md }]}>
        <View style={styles.statusRow}>
          <AppText size="sm" weight="medium" color="secondary">Current Status</AppText>
          <View style={[styles.badge, { backgroundColor: isOnline ? colors.successLight : colors.surfaceSecondary, borderRadius: borderRadius.full }]}>
            <View style={[styles.dot, { backgroundColor: isOnline ? colors.success : colors.secondary, borderRadius: borderRadius.full }]} />
            <AppText size="sm" color={isOnline ? 'success' : 'secondary'} weight="semibold">
              {isOnline ? 'On Duty' : 'Off Duty'}
            </AppText>
          </View>
        </View>
        <View style={styles.statusRow}>
          <AppText size="sm" weight="medium" color="secondary">Assigned Company</AppText>
          <AppText size="base" weight="semibold" color="primary">{companyName}</AppText>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  guardNameTitle: {
    marginBottom: 2,
  },
  subText: {
    marginTop: 2,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    marginRight: 6,
  }
});
