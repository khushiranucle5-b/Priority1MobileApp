import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

import { useNavigation } from '@react-navigation/native';
import { useGuardStore } from '../../../store/useGuardStore';

import { typography } from '../../../theme/tokens/typography';

export const PersonalInformationCard: React.FC = () => {
  const { borderRadius, colors } = useTheme();
  const navigation = useNavigation<any>();
  const { guardName, guardEmail, phone, dateOfBirth, gender, bloodGroup, address } = useGuardStore();

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg, borderColor: colors.borderStrong }]}>
      <View style={styles.header}>
        <Heading level="h3" color="primary" style={styles.title}>PERSONAL INFORMATION</Heading>
      </View>
      
      <View style={[styles.divider, { backgroundColor: colors.borderStrong }]} />

      <View style={styles.grid}>
        <View style={styles.row}>
          <AppText style={[styles.label, { color: colors.textSecondary }]}>Full Name</AppText>
          <AppText style={[styles.value, { color: colors.text }]}>{guardName || 'Security Officer'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.borderStrong, paddingTop: 10 }]}>
          <AppText style={[styles.label, { color: colors.textSecondary }]}>Mobile Number</AppText>
          <AppText style={[styles.value, { color: colors.text }]}>{phone || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.borderStrong, paddingTop: 10 }]}>
          <AppText style={[styles.label, { color: colors.textSecondary }]}>Email Address</AppText>
          <AppText style={[styles.value, { color: colors.text }]}>{guardEmail || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.borderStrong, paddingTop: 10 }]}>
          <AppText style={[styles.label, { color: colors.textSecondary }]}>Date of Birth</AppText>
          <AppText style={[styles.value, { color: colors.text }]}>{dateOfBirth || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.borderStrong, paddingTop: 10 }]}>
          <AppText style={[styles.label, { color: colors.textSecondary }]}>Gender</AppText>
          <AppText style={[styles.value, { color: colors.text }]}>{gender || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.borderStrong, paddingTop: 10 }]}>
          <AppText style={[styles.label, { color: colors.textSecondary }]}>Blood Group</AppText>
          <AppText style={[styles.value, { color: colors.text }]}>{bloodGroup || 'N/A'}</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.borderStrong, paddingTop: 10 }]}>
          <AppText style={[styles.label, { color: colors.textSecondary }]}>Address</AppText>
          <AppText style={[styles.value, { color: colors.text }]}>{address || 'N/A'}</AppText>
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
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.presets.cardTitle,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  grid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    ...typography.presets.label,
  },
  value: {
    flex: 1.5,
    textAlign: 'right',
    ...typography.presets.body,
    fontWeight: '600',
  },
});
