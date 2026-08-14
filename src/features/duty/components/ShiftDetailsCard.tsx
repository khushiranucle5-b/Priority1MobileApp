import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const ShiftDetailsCard: React.FC = () => {
  const { colors, spacing } = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Shift Details</Heading>
      
      <View style={[styles.grid, { marginTop: spacing.sm }]}>
        <View style={styles.row}>
          <AppText size="sm" color="secondary" style={styles.label}>Shift Name</AppText>
          <AppText size="sm" weight="medium">Morning Shift A</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Reporting Time</AppText>
          <AppText size="sm" weight="medium">08:45 AM</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Shift Start</AppText>
          <AppText size="sm" weight="medium">09:00 AM</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Shift End</AppText>
          <AppText size="sm" weight="medium">06:00 PM</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Working Hours</AppText>
          <AppText size="sm" weight="medium">9 Hrs</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Break</AppText>
          <AppText size="sm" weight="medium">1 Hr</AppText>
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
  title: {
    marginBottom: 8,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  label: {
    flex: 1,
  }
});
