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
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <Heading level="h3" color="primary" style={styles.title}>SITE INFORMATION</Heading>
        <View style={[styles.badge, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.sm }]}>
          <AppText style={[styles.badgeText, { color: colors.textSecondary }]}>ABC-AHM-01</AppText>
        </View>
      </View>
      
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.grid}>
        <View style={styles.row}>
          <AppText style={[styles.value, { color: colors.text }]}>{siteName}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }]}>
          <AppText style={[styles.value, { color: colors.text }]}>45 Industrial Estate, Changodar</AppText>
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
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
});


