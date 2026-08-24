import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

import { useGuardStore } from '../../../store/useGuardStore';

import { typography } from '../../../theme/tokens/typography';

export const EmploymentInformationCard: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { guardId, companyName, assignedSite, supervisor } = useGuardStore();

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Employment Information</Heading>
      
      <View style={[styles.grid, { marginTop: spacing.md }]}>
        <View style={styles.row}>
          <AppText style={styles.label}>Employee ID</AppText>
          <AppText style={styles.value}>{guardId || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
          <AppText style={styles.label}>Company Name</AppText>
          <AppText style={styles.value}>{companyName}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
          <AppText style={styles.label}>Department</AppText>
          <AppText style={styles.value}>Field Operations</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
          <AppText style={styles.label}>Designation</AppText>
          <AppText style={styles.value}>Security Guard</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
          <AppText style={styles.label}>Reporting Supervisor</AppText>
          <AppText style={styles.value}>{supervisor}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
          <AppText style={styles.label}>Work Location</AppText>
          <AppText style={styles.value}>{assignedSite}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
          <AppText style={styles.label}>Employment Type</AppText>
          <AppText style={styles.value}>Full-Time</AppText>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 18,
  },
  title: {
    ...typography.presets.cardTitle,
    marginBottom: 4,
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  label: {
    flex: 1,
    ...typography.presets.label,
    color: '#475569',
  },
  value: {
    flex: 1.5,
    textAlign: 'right',
    ...typography.presets.body,
    fontWeight: '600',
    color: '#0F172A',
  }
});
