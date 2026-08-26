
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const LeaveBalanceCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const leaveBalances = useGuardStore((state) => state.leaveBalances);

  return (
    <Card variant="flat" style={styles.card}>
      <Heading level="h4">Leave Balance</Heading>
      
      <View style={[styles.grid, { marginTop: spacing.md }]}>
        <View style={[styles.item, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          <AppText size="sm" weight="bold" color="secondary">Annual</AppText>
          <AppText size="xl" weight="bold" color="primary" style={styles.countText}>{leaveBalances.annual}</AppText>
        </View>
        <View style={[styles.item, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          <AppText size="sm" weight="bold" color="secondary">Sick</AppText>
          <AppText size="xl" weight="bold" color="primary" style={styles.countText}>{leaveBalances.sick}</AppText>
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
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  item: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  countText: {
    fontSize: 22,
    marginTop: 4,
  },
});
