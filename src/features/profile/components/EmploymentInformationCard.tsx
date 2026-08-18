import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

import { useGuardStore } from '../../../store/useGuardStore';

export const EmploymentInformationCard: React.FC = () => {
  const { colors, spacing } = useTheme();
  const { guardId, companyName, assignedSite, supervisor } = useGuardStore();

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Employment Information</Heading>
      
      <View style={[styles.grid, { marginTop: spacing.sm }]}>
        <View style={styles.row}>
          <AppText size="sm" color="secondary" style={styles.label}>Employee ID</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>{guardId || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Company Name</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>{companyName}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Department</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>Field Operations</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Designation</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>Security Guard</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Reporting Supervisor</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>{supervisor}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Work Location</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>{assignedSite}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Employment Type</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>Full-Time</AppText>
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
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  label: {
    flex: 1,
  },
  value: {
    flex: 2,
    textAlign: 'right',
  }
});
