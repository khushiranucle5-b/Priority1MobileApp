import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const PatrolOverviewCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Heading level="h4">Patrol Overview</Heading>
        <View style={[styles.statusBadge, { backgroundColor: colors.infoLight, borderRadius: borderRadius.full }]}>
          <AppText size="xs" color={colors.info} weight="medium">In Progress</AppText>
        </View>
      </View>
      
      <View style={[styles.details, { marginTop: spacing.md }]}>
        <View style={styles.detailRow}>
          <AppText size="sm" color="secondary" style={styles.label}>Patrol Name</AppText>
          <AppText size="sm" weight="medium">Morning Perimeter Patrol</AppText>
        </View>
        <View style={styles.detailRow}>
          <AppText size="sm" color="secondary" style={styles.label}>Assigned Site</AppText>
          <AppText size="sm" weight="medium">Ahmedabad Plant</AppText>
        </View>
        <View style={styles.detailRow}>
          <AppText size="sm" color="secondary" style={styles.label}>Patrol Shift</AppText>
          <AppText size="sm" weight="medium">Morning Shift A</AppText>
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
