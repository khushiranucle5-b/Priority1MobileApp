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
  const [nowMs, setNowMs] = React.useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const isCheckInDisabled = loneWorker.lastCheckInTimestamp
    ? nowMs - loneWorker.lastCheckInTimestamp < 30 * 60 * 1000
    : false;

  return (
    <Card variant="elevated" style={styles.card}>
      <View style={styles.header}>
        <Heading level="h4">Lone Worker Safety</Heading>
        <View style={[styles.badge, { backgroundColor: colors.successLight, borderRadius: borderRadius.full }]}>
          <AppText size="xs" color="success" weight="bold">● {loneWorker.status || 'SAFE'}</AppText>
        </View>
      </View>

      <View style={[styles.body, { marginTop: spacing.md }]}>
        <View style={styles.row}>
          <AppText size="sm" color="secondary">Status:</AppText>
          <AppText size="sm" weight="bold" color="success">{loneWorker.status || 'SAFE'}</AppText>
        </View>
        <View style={styles.row}>
          <AppText size="sm" color="secondary">Last Check-In:</AppText>
          <AppText size="sm" weight="bold" color="primary">{loneWorker.lastCheckIn || 'None'}</AppText>
        </View>
        <View style={styles.row}>
          <AppText size="sm" color="secondary">Next Check Due:</AppText>
          <AppText size="sm" weight="bold" color="warning">{loneWorker.nextCheckRequired || 'N/A'}</AppText>
        </View>
      </View>

      <Button
        title={isCheckInDisabled ? "✓ SAFE CHECKED (Next in 30m)" : "✓  I'M SAFE"}
        variant={isCheckInDisabled ? "secondary" : "primary"}
        size="large"
        fullWidth
        disabled={isCheckInDisabled}
        onPress={checkInLoneWorker}
        style={{ marginTop: spacing.md, backgroundColor: isCheckInDisabled ? undefined : '#059669' }}
      />
      {isCheckInDisabled && (
        <AppText size="xs" color="secondary" style={{ textAlign: 'center', marginTop: 6 }}>
          ✓ Verified. Re-enables in 30 mins at {loneWorker.nextCheckRequired}.
        </AppText>
      )}
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
