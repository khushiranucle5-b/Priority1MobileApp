import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { NavIcon } from '../../../components/NavIcon';

export const EmergencyContactsCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  const handleCall = () => {
    console.log('Call Emergency Contact');
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Emergency Contacts</Heading>
      
      <View style={[styles.list, { marginTop: spacing.sm }]}>
        <View style={styles.row}>
          <View style={styles.info}>
            <AppText size="sm" color="secondary">Client Emergency Number</AppText>
            <AppText size="base" weight="medium">100</AppText>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.errorLight || '#FEE2E2', borderRadius: borderRadius.full }]} onPress={handleCall}>
            <NavIcon name="loneworker" size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }]}>
          <View style={styles.info}>
            <AppText size="sm" color="secondary">Supervisor Number</AppText>
            <AppText size="base" weight="medium">+1 987-654-3210</AppText>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary[50] || '#EFF6FF', borderRadius: borderRadius.full }]} onPress={handleCall}>
            <NavIcon name="messages" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }]}>
          <View style={styles.info}>
            <AppText size="sm" color="secondary">Company Helpdesk Number</AppText>
            <AppText size="base" weight="medium">+1 800-123-4567</AppText>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary[50] || '#EFF6FF', borderRadius: borderRadius.full }]} onPress={handleCall}>
            <NavIcon name="messages" size={20} color="#2563EB" />
          </TouchableOpacity>
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
  title: {
    marginBottom: 4,
  },
  list: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  btn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
