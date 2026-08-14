import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const EmergencyContactCard: React.FC = () => {
  const { colors, spacing } = useTheme();

  const handleEdit = () => {
    console.log('Edit Emergency Contacts');
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
          <AppText size="base" weight="medium">Sarah Doe</AppText>
          <AppText size="sm" color="secondary">Relationship: Spouse</AppText>
          <AppText size="sm" color="secondary">Phone: +1 555-123-4567</AppText>
        </View>

        <View style={[styles.contactItem, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }]}>
          <AppText size="sm" color="secondary">Secondary Contact</AppText>
          <AppText size="base" weight="medium">Michael Doe</AppText>
          <AppText size="sm" color="secondary">Relationship: Brother</AppText>
          <AppText size="sm" color="secondary">Phone: +1 555-987-6543</AppText>
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
