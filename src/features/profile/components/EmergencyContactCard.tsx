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
        <Heading level="h4">Emergency Contacts</Heading>
        <TouchableOpacity onPress={handleEdit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <AppText size="sm" color="primary" weight="medium">Edit</AppText>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.contactContainer, { marginTop: spacing.sm }]}>
        <View style={styles.contactItem}>
          <AppText size="sm" color="secondary">Primary Contact</AppText>
          <AppText size="base" weight="medium">{emergencyContactName || 'Not Set'}</AppText>
          <AppText size="sm" color="secondary">Relationship: {emergencyContactRelation || 'N/A'}</AppText>
          <AppText size="sm" color="secondary">Phone: {emergencyContactPhone || 'N/A'}</AppText>
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
    marginBottom: 4,
  },
  contactContainer: {
    gap: 12,
  },
  contactItem: {
    gap: 2,
  }
});
