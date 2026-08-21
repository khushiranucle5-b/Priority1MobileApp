import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const SiteInformationCard: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const { assignedSite } = useGuardStore();

  const siteName = assignedSite || 'Ahmedabad Plant';

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
      <Heading level="h3" color="primary" style={styles.title}>SITE INFORMATION</Heading>
      
      <View style={styles.divider} />

      <View style={styles.grid}>
        <View style={styles.row}>
          <AppText size="sm" color="secondary" style={styles.label}>Site Name</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{siteName}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Site Address</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>45 Industrial Estate, Changodar</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Site Code</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>ABC-AHM-01</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Site Type</AppText>
          <View style={[styles.badge, { backgroundColor: '#F1F5F9', borderRadius: borderRadius.sm }]}>
            <AppText size="xs" color="secondary" weight="bold" style={styles.badgeText}>Warehouse Facility</AppText>
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
    flex: 1.5,
    textAlign: 'right',
    fontSize: 15.5,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#475569',
  },
});
