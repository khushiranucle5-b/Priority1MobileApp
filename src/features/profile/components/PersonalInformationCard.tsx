import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

import { useGuardStore } from '../../../store/useGuardStore';

export const PersonalInformationCard: React.FC = () => {
  const { borderRadius, colors } = useTheme();
  const { guardName, guardEmail, phone, dateOfBirth, gender, bloodGroup, address } = useGuardStore();

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
      <View style={styles.header}>
        <Heading level="h3" color="primary" style={styles.title}>PERSONAL INFORMATION</Heading>
      </View>
      
      <View style={styles.divider} />

      <View style={styles.grid}>
        <View style={styles.row}>
          <AppText size="sm" color="secondary" style={styles.label}>Full Name</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{guardName || 'Security Officer'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border || '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Mobile Number</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{phone || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border || '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Email Address</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{guardEmail || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border || '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Date of Birth</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{dateOfBirth || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border || '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Gender</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{gender || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border || '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Blood Group</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{bloodGroup || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border || '#E2E8F0', paddingTop: 10 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Address</AppText>
          <AppText size="base" weight="bold" color="primary" style={styles.value}>{address || 'N/A'}</AppText>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
});
