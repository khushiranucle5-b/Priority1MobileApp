import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

import { useGuardStore } from '../../../store/useGuardStore';

export const AttendanceInfoCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { assignedSite } = useGuardStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary[50], borderRadius: borderRadius.md, padding: spacing.md }]}>
      <AppText size="sm" color={colors.primary[900]} weight="bold" style={styles.title}>
        📍 Geofencing & Site Verification Active
      </AppText>
      <AppText size="xs" color={colors.primary[700]} style={styles.text}>
        Verified Location: {assignedSite || 'Ahmedabad Plant'} (Inside 50m Geofence Radius)
      </AppText>
      <AppText size="xs" color={colors.primary[700]} style={styles.subtext}>
        GPS position & selfie identity are tagged with every Clock In & Clock Out.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    gap: 4,
  },
  title: {
    marginBottom: 2,
  },
  text: {
    lineHeight: 18,
  },
  subtext: {
    lineHeight: 16,
    marginTop: 2,
  }
});
