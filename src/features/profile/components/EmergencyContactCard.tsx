import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

import { useNavigation } from '@react-navigation/native';
import { useGuardStore } from '../../../store/useGuardStore';

export const EmergencyContactCard: React.FC = () => {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<any>();
  const { emergencyContactName, emergencyContactPhone, emergencyContactRelation } = useGuardStore();

  const handleEdit = () => {
    navigation.navigate('ProfileSettings');
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Heading level="h3" color="primary">EMERGENCY CONTACTS</Heading>
      </View>
      
      <View style={[styles.contactContainer, { marginTop: spacing.md }]}>
        <View style={styles.contactItem}>
          <AppText style={[styles.subLabel, { color: colors.textSecondary }]}>Primary Contact</AppText>
          <AppText style={[styles.contactName, { color: colors.text }]}>{emergencyContactName || 'Not Set'}</AppText>
          <AppText style={[styles.contactDetail, { color: colors.textSecondary }]}>Relationship: {emergencyContactRelation || 'N/A'}</AppText>
          <AppText style={[styles.contactDetail, { color: colors.textSecondary }]}>Phone: {emergencyContactPhone || 'N/A'}</AppText>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  contactContainer: {
    gap: 12,
  },
  contactItem: {
    gap: 4,
  },
  subLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  contactName: {
    fontSize: 18,
    fontWeight: '700',
  },
  contactDetail: {
    fontSize: 15.5,
    fontWeight: '500',
  },
});
