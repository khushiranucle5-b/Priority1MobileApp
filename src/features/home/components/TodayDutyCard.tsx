import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

import { useGuardStore } from '../../../store/useGuardStore';

export const TodayDutyCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { todayShift, assignedSite } = useGuardStore();

  const getStatusColor = () => {
    if (!todayShift) return colors.secondary;
    if (todayShift.status === 'in_progress') return colors.success;
    if (todayShift.status === 'completed') return colors.primary[500];
    return colors.info;
  };

  const getStatusBg = () => {
    if (!todayShift) return colors.surfaceSecondary;
    if (todayShift.status === 'in_progress') return colors.successLight;
    if (todayShift.status === 'completed') return colors.primary[50];
    return colors.infoLight;
  };

  const getStatusLabel = () => {
    if (!todayShift) return 'Off Duty';
    if (todayShift.status === 'in_progress') return 'In Progress';
    if (todayShift.status === 'completed') return 'Completed';
    return 'Assigned';
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Duty')}>
      <Card variant="elevated" style={styles.card}>
        <View style={styles.header}>
          <Heading level="h4">Today's Duty</Heading>
          <View style={[styles.statusBadge, { backgroundColor: getStatusBg(), borderRadius: borderRadius.full }]}>
            <AppText size="xs" color={getStatusColor()} weight="medium">
              {getStatusLabel()}
            </AppText>
          </View>
        </View>
        
        {todayShift ? (
          <View style={[styles.details, { marginTop: spacing.md }]}>
            <View style={styles.detailRow}>
              <AppText size="sm" color="secondary" style={styles.label}>Shift:</AppText>
              <AppText size="sm" weight="medium">{todayShift.title}</AppText>
            </View>
            <View style={styles.detailRow}>
              <AppText size="sm" color="secondary" style={styles.label}>Site:</AppText>
              <AppText size="sm" weight="medium">{todayShift.site || assignedSite}</AppText>
            </View>
            <View style={styles.detailRow}>
              <AppText size="sm" color="secondary" style={styles.label}>Time:</AppText>
              <AppText size="sm" weight="medium">
                {todayShift.startTime} - {todayShift.endTime}
              </AppText>
            </View>
          </View>
        ) : (
          <View style={[styles.details, { marginTop: spacing.md }]}>
            <AppText size="sm" color="secondary">
              No shift scheduled for today.
            </AppText>
          </View>
        )}
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
