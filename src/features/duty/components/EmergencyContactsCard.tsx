import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const EmergencyContactsCard: React.FC = () => {
  const { colors, spacing } = useTheme();

  const handleCall = () => {
    console.log('Call Emergency Contact');
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h3" style={styles.title}>Emergency Contacts</Heading>
      
      <View style={[styles.list, { marginTop: spacing.md }]}>
        <TouchableOpacity style={styles.row} onPress={handleCall} activeOpacity={0.7}>
          <View style={styles.info}>
            <AppText style={styles.label}>Client Emergency Number</AppText>
            <AppText style={styles.value}>100</AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }]} onPress={handleCall} activeOpacity={0.7}>
          <View style={styles.info}>
            <AppText style={styles.label}>Supervisor Number</AppText>
            <AppText style={styles.value}>+1 987-654-3210</AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }]} onPress={handleCall} activeOpacity={0.7}>
          <View style={styles.info}>
            <AppText style={styles.label}>Company Helpdesk Number</AppText>
            <AppText style={styles.value}>+1 800-123-4567</AppText>
          </View>
        </TouchableOpacity>
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
});

