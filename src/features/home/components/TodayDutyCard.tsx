import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const TodayDutyCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Duty')}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <Heading level="h4">Today's Duty</Heading>
          <View style={[styles.statusBadge, { backgroundColor: colors.infoLight, borderRadius: borderRadius.full }]}>
            <AppText size="xs" color={colors.info} weight="medium">Upcoming</AppText>
          </View>
        </View>
        
        <View style={[styles.details, { marginTop: spacing.md }]}>
          <View style={styles.detailRow}>
            <AppText size="sm" color="secondary" style={styles.label}>Client:</AppText>
            <AppText size="sm" weight="medium">ABC Industries</AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText size="sm" color="secondary" style={styles.label}>Site:</AppText>
            <AppText size="sm" weight="medium">Ahmedabad Plant</AppText>
          </View>
          <View style={styles.detailRow}>
            <AppText size="sm" color="secondary" style={styles.label}>Time:</AppText>
            <AppText size="sm" weight="medium">09:00 AM - 06:00 PM</AppText>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
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
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    width: 60,
  }
});
