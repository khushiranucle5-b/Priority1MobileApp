import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const LeaveBalanceCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <Card variant="flat" style={styles.card}>
      <Heading level="h4">Leave Balance</Heading>
      
      <View style={[styles.grid, { marginTop: spacing.md }]}>
        <View style={[styles.item, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          <AppText size="xs" color="secondary">Annual</AppText>
          <AppText size="base" weight="semibold">12</AppText>
        </View>
        <View style={[styles.item, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          <AppText size="xs" color="secondary">Sick</AppText>
          <AppText size="base" weight="semibold">5</AppText>
        </View>
        <View style={[styles.item, { backgroundColor: colors.surface, borderRadius: borderRadius.md }]}>
          <AppText size="xs" color="secondary">Casual</AppText>
          <AppText size="base" weight="semibold">3</AppText>
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
    gap: 8,
  },
  item: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  }
});
