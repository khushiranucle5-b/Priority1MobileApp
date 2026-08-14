import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const PersonalInformationCard: React.FC = () => {
  const { colors, spacing } = useTheme();

  const handleEditProfile = () => {
    // Placeholder function
    console.log('handleEditProfile called');
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Heading level="h4">Personal Information</Heading>
        <TouchableOpacity onPress={handleEditProfile} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <AppText size="sm" color="primary" weight="medium">Edit</AppText>
        </TouchableOpacity>
      </View>
      
      <View style={[styles.grid, { marginTop: spacing.sm }]}>
        <View style={styles.row}>
          <AppText size="sm" color="secondary" style={styles.label}>Full Name</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>John Doe</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Mobile Number</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>+1 987-654-3210</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Email Address</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>johndoe@example.com</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Date of Birth</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>Oct 12, 1990</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Gender</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>Male</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Blood Group</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>O+</AppText>
        </View>
        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }]}>
          <AppText size="sm" color="secondary" style={styles.label}>Address</AppText>
          <AppText size="sm" weight="medium" style={styles.value}>123 Main St, Springfield, IL</AppText>
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
    marginBottom: 8,
  },
  grid: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 2,
  },
  label: {
    flex: 1,
  },
  value: {
    flex: 2,
    textAlign: 'right',
  }
});
