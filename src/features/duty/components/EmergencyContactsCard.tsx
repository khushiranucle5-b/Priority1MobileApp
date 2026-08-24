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
      <Heading level="h3" style={styles.title}>Emergency Contacts</Heading>
      
      <View style={[styles.list, { marginTop: spacing.md }]}>
        <View style={styles.row}>
          <View style={styles.info}>
            <AppText style={styles.label}>Client Emergency Number</AppText>
            <AppText style={styles.value}>100</AppText>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.errorLight || '#FEE2E2', borderRadius: borderRadius.full }]} onPress={handleCall}>
            <NavIcon name="loneworker" size={22} color="#DC2626" />
          </TouchableOpacity>
        </View>

        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }]}>
          <View style={styles.info}>
            <AppText style={styles.label}>Supervisor Number</AppText>
            <AppText style={styles.value}>+1 987-654-3210</AppText>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary[50] || '#EFF6FF', borderRadius: borderRadius.full }]} onPress={handleCall}>
            <NavIcon name="messages" size={22} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }]}>
          <View style={styles.info}>
            <AppText style={styles.label}>Company Helpdesk Number</AppText>
            <AppText style={styles.value}>+1 800-123-4567</AppText>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary[50] || '#EFF6FF', borderRadius: borderRadius.full }]} onPress={handleCall}>
            <NavIcon name="messages" size={22} color="#2563EB" />
          </TouchableOpacity>
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
  title: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  list: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  btn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
