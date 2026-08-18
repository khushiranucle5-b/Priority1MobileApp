import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

import { useGuardStore } from '../../../store/useGuardStore';

export const PatrolProgressCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { activePatrol } = useGuardStore();

  if (!activePatrol) {
    return (
      <Card variant="flat" style={styles.card}>
        <Heading level="h4" style={styles.title}>Progress</Heading>
        <AppText size="sm" color="secondary" style={{ marginTop: spacing.xs }}>
          No active patrol. Please start a patrol first.
        </AppText>
      </Card>
    );
  }

  const total = activePatrol.checkpoints || 0;
  const completed = activePatrol.scanned || 0;
  const remaining = Math.max(0, total - completed);
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card variant="flat" style={styles.card}>
      <Heading level="h4" style={styles.title}>Progress</Heading>
      
      <View style={[styles.grid, { marginTop: spacing.sm }]}>
        <View style={styles.row}>
          <AppText size="sm" color="secondary">Total Checkpoints</AppText>
          <AppText size="sm" weight="semibold">{total}</AppText>
        </View>
        <View style={styles.row}>
          <AppText size="sm" color="secondary">Completed</AppText>
          <AppText size="sm" weight="semibold" color="success">{completed}</AppText>
        </View>
        <View style={styles.row}>
          <AppText size="sm" color="secondary">Remaining</AppText>
          <AppText size="sm" weight="semibold">{remaining}</AppText>
        </View>
        
        <View style={[styles.progressBarContainer, { backgroundColor: colors.border, borderRadius: borderRadius.full }]}>
          <View style={[styles.progressBarFill, { backgroundColor: colors.primary[500], borderRadius: borderRadius.full, width: `${percent}%` }]} />
        </View>
        <AppText size="xs" color="secondary" style={styles.progressText}>{percent}% Completed</AppText>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    marginBottom: 4,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressText: {
    textAlign: 'right',
    marginTop: 4,
  }
});
