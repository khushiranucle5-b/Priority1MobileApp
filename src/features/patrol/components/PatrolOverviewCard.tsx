import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const PatrolOverviewCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { activePatrol, assignedSite, todayShift } = useGuardStore();

  const getStatusColor = () => {
    if (!activePatrol) return colors.secondary;
    if (activePatrol.status === 'completed') return colors.success;
    if (activePatrol.status === 'in_progress') return colors.info;
    return colors.warning;
  };

  const getStatusBg = () => {
    if (!activePatrol) return colors.surfaceSecondary;
    if (activePatrol.status === 'completed') return colors.successLight;
    if (activePatrol.status === 'in_progress') return colors.infoLight;
    return colors.warningLight;
  };

  const getStatusLabel = () => {
    if (!activePatrol) return 'No Patrol Active';
    if (activePatrol.status === 'in_progress') return 'In Progress';
    if (activePatrol.status === 'completed') return 'Completed';
    return activePatrol.status.charAt(0).toUpperCase() + activePatrol.status.slice(1);
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Heading level="h4">Patrol Overview</Heading>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(), borderRadius: borderRadius.full }]}>
          <AppText size="xs" color={getStatusColor()} weight="medium">
            {getStatusLabel()}
          </AppText>
        </View>
      </View>
      
      <View style={[styles.details, { marginTop: spacing.md }]}>
        <View style={styles.detailRow}>
          <AppText size="sm" color="secondary" style={styles.label}>Patrol Name</AppText>
          <AppText size="sm" weight="medium">
            {activePatrol ? (activePatrol.title || 'Afternoon Perimeter Patrol') : 'No Scheduled Patrol'}
          </AppText>
        </View>
        <View style={styles.detailRow}>
          <AppText size="sm" color="secondary" style={styles.label}>Assigned Site</AppText>
          <AppText size="sm" weight="medium">
            {activePatrol?.site || assignedSite || 'Ahmedabad Plant'}
          </AppText>
        </View>
        <View style={styles.detailRow}>
          <AppText size="sm" color="secondary" style={styles.label}>Patrol Shift</AppText>
          <AppText size="sm" weight="medium">
            {todayShift ? todayShift.title : 'Morning Shift A'}
          </AppText>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  label: {
    flex: 1,
  }
});
