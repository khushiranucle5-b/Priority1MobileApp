import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const LeaveHistory: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const leaves = useGuardStore((state) => state.leaves);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return colors.success;
      case 'Rejected': return colors.error;
      default: return colors.warning;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Approved': return colors.successLight;
      case 'Rejected': return colors.errorLight;
      default: return colors.surfaceSecondary;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {leaves.map((leave) => (
        <Card key={leave.id} variant="elevated" style={styles.card}>
          <View style={styles.headerRow}>
            <AppText size="base" weight="semibold">{leave.type}</AppText>
            <View style={[styles.badge, { backgroundColor: getStatusBg(leave.status), borderRadius: borderRadius.full }]}>
              <AppText size="xs" weight="medium" color={getStatusColor(leave.status)}>{leave.status}</AppText>
            </View>
          </View>
          <View style={[styles.detailRow, { marginTop: spacing.xs }]}>
            <AppText size="sm" color="secondary">Date: {leave.fromDate} to {leave.toDate}</AppText>
            <AppText size="sm" color="secondary">{leave.days} Day(s)</AppText>
          </View>
          <View style={{ marginTop: 4 }}>
            <AppText size="sm" color="secondary">Applied: {leave.appliedDate}</AppText>
          </View>
          <View style={{ marginTop: 4 }}>
            <AppText size="sm" color="secondary">Reason: {leave.reason}</AppText>
          </View>
          {leave.attachment && (
            <View style={[styles.attachmentBadge, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.sm, marginTop: 8 }]}>
              <AppText size="xs" color="primary">📎 {leave.attachment.name}</AppText>
              <AppText size="xs" color="secondary">{(leave.attachment.size / 1024).toFixed(1)} KB</AppText>
            </View>
          )}
        </Card>
      ))}
      {leaves.length === 0 && (
        <AppText size="base" color="secondary" style={styles.empty}>No leave history found.</AppText>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
  },
  attachmentBadge: {
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});
