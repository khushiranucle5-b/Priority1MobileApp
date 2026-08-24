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
          <AppText size="lg" weight="bold" style={{ color: colors.primary[600] || '#2563EB', fontSize: 22 }}>
            ABC
          </AppText>
        </View>

        <View style={styles.info}>
          <AppText style={styles.clientName}>
            ABC Industries Ltd.
          </AppText>
          <AppText style={styles.detailText}>
            123 Business Park, Sector 45
          </AppText>
          <AppText style={[styles.phoneText, { color: colors.primary[600] || '#2563EB' }]}>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBox: {
    width: 64,
    height: 64,
    marginRight: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  info: {
    flex: 1,
  },
  clientName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#0F172A',
  },
  detailText: {
    fontSize: 15.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 3,
  },
  phoneText: {
    fontSize: 16.5,
    fontWeight: '700',
    marginTop: 5,
  },
});
