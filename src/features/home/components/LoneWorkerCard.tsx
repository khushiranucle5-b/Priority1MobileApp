import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const LoneWorkerCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { loneWorker, checkInLoneWorker } = useGuardStore();

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Heading level="h4">Lone Worker Safety</Heading>
        <View style={[styles.badge, { backgroundColor: colors.successLight, borderRadius: borderRadius.full }]}>
          <AppText size="xs" color="success" weight="bold">Active Check-in</AppText>
        </View>
      </View>

      <View style={[styles.body, { marginTop: spacing.md }]}>
        <View style={styles.row}>
          <AppText size="sm" color="secondary">Status:</AppText>
          <AppText size="sm" weight="medium" color="success">{loneWorker.status}</AppText>
        </View>
        <View style={styles.row}>
          <AppText size="sm" color="secondary">Last Check-In:</AppText>
          <AppText size="sm" weight="medium">{loneWorker.lastCheckIn || 'None'}</AppText>
        </View>
        <View style={styles.row}>
          <AppText size="sm" color="secondary">Next Check Required:</AppText>
          <AppText size="sm" weight="medium" color="warning">{loneWorker.nextCheckRequired || 'N/A'}</AppText>
        </View>
      </View>

      <Button
        title="Verify Safety Check-In"
        variant="primary"
        size="medium"
        onPress={checkInLoneWorker}
        style={{ marginTop: spacing.md }}
        leftIcon={<AppText style={styles.icon}>🛡️</AppText>}
      />
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
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  body: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 16,
  }
});
