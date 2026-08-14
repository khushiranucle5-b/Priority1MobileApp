import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const SiteInformationCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Site Information</Heading>
      
      <View style={[styles.grid, { marginTop: spacing.sm }]}>
        <View style={styles.row}>
          <AppText size="sm" color="secondary" style={styles.label}>Site Name</AppText>
          <AppText size="sm" weight="medium">Ahmedabad Plant</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Site Address</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>45 Industrial Estate, Changodar</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Site Code</AppText>
          <AppText size="sm" weight="medium">ABC-AHM-01</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Site Type</AppText>
          <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.sm }]}>
            <AppText size="xs" color="secondary" weight="medium">Warehouse</AppText>
          </View>
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
  },
  value: {
    flex: 2,
    textAlign: 'right',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  }
});
