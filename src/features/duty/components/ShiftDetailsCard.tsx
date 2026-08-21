import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const ShiftDetailsCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { todayShift } = useGuardStore();

  const title = todayShift?.title || 'Morning Shift';
  const startTime = todayShift?.startTime || '08:00 AM';
  const endTime = todayShift?.endTime || '04:00 PM';

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
      <Heading level="h3" color="primary" style={styles.title}>SHIFT DETAILS</Heading>
      
      <View style={styles.divider} />

      <View style={styles.grid}>
        <View style={styles.row}>
          <AppText size="sm" color="secondary" style={styles.label}>Shift Name</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{title}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Reporting Time</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{startTime}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Shift Start</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{startTime}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Shift End</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{endTime}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Working Hours</AppText>
          <AppText size="base" weight="bold" style={[styles.value, { color: colors.primary[600] || '#2563EB' }]}>8 Hrs</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Break Duration</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>1 Hr</AppText>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  grid: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  value: {
    fontSize: 15.5,
    fontWeight: '700',
  },
});
