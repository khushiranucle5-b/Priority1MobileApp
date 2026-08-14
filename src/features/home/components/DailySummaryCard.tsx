import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { useLiveAttendance } from '../../../hooks/useLiveAttendance';

export const DailySummaryCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  
  const leaves = useGuardStore((state) => state.leaves);
  const incidents = useGuardStore((state) => state.incidents);
  const { workingHours } = useLiveAttendance();

  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  const incidentCount = incidents.length;

  return (
    <Card variant="flat" style={styles.card}>
      <Heading level="h4" style={styles.title}>Today's Summary</Heading>
      
      <View style={styles.grid}>
        <View style={[styles.item, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          <AppText size="base" weight="bold" color="primary" style={{ fontVariant: ['tabular-nums'] }}>{workingHours.split(':').slice(0, 2).join('h ')}m</AppText>
          <AppText size="xs" color="secondary" style={styles.label}>Working Hours</AppText>
        </View>
        
        <View style={[styles.item, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          <AppText size="xl" weight="bold" color="success">{pendingLeaves}</AppText>
          <AppText size="xs" color="secondary" style={styles.label}>Pending Leaves</AppText>
        </View>
        
        <View style={[styles.item, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          <AppText size="xl" weight="bold" color="warning">{incidentCount}</AppText>
          <AppText size="xs" color="secondary" style={styles.label}>Incidents</AppText>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 24, // Extra padding at bottom
  },
  title: {
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  item: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  label: {
    marginTop: 4,
    textAlign: 'center',
  }
});
