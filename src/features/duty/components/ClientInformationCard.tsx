import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const ClientInformationCard: React.FC = () => {
  const { borderRadius, colors } = useTheme();

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
      <Heading level="h3" color="primary" style={styles.title}>CLIENT INFORMATION</Heading>
      
      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={[styles.avatarBox, { borderRadius: borderRadius.md, backgroundColor: colors.primary[50] || '#EFF6FF' }]}>
          <AppText size="lg" weight="bold" style={{ color: colors.primary[600] || '#2563EB', fontSize: 20 }}>
            ABC
          </AppText>
        </View>

        <View style={styles.info}>
          <AppText size="lg" weight="bold" color="primary" style={styles.clientName}>
            ABC Industries Ltd.
          </AppText>
          <AppText size="sm" weight="semibold" color="secondary" style={styles.detailText}>
            123 Business Park, Sector 45
          </AppText>
          <AppText size="sm" weight="bold" style={[styles.phoneText, { color: colors.primary[600] || '#2563EB' }]}>
            +1 234-567-8900
          </AppText>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 56,
    height: 56,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  info: {
    flex: 1,
  },
  clientName: {
    fontSize: 17,
    fontWeight: '700',
  },
  detailText: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 2,
  },
  phoneText: {
    fontSize: 14.5,
    fontWeight: '700',
    marginTop: 4,
  },
});
