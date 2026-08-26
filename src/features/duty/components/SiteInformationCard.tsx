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
      <View style={styles.headerRow}>
        <Heading level="h3" color="primary" style={styles.title}>SITE INFORMATION</Heading>
        <View style={[styles.badge, { backgroundColor: '#F1F5F9', borderRadius: borderRadius.sm }]}>
          <AppText style={styles.badgeText}>ABC-AHM-01</AppText>
        </View>
      </View>
      
      <View style={styles.divider} />

      <View style={styles.grid}>
        <View style={styles.row}>
          <AppText style={styles.value}>{siteName}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: 12 }]}>
          <AppText style={styles.value}>45 Industrial Estate, Changodar</AppText>
        </View>
        
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 17.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});


