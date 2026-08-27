import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

import { useNavigation } from '@react-navigation/native';

export const LoneWorkerCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
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
        <Heading level="h3" color="primary">LONE WORKER SAFETY</Heading>
        <View style={[styles.badge, { backgroundColor: '#D1FAE5', borderRadius: borderRadius.full }]}>
          <AppText size="xs" style={{ color: '#059669' }} weight="bold">● {loneWorker.status || 'SAFE'}</AppText>
        </View>
      </View>

      <View style={[styles.body, { marginTop: spacing.md }]}>
        <View style={styles.row}>
          <AppText size="xs" color="secondary" weight="semibold" style={{ textTransform: 'uppercase' }}>STATUS</AppText>
          <AppText size="sm" weight="bold" style={{ color: '#059669' }}>{loneWorker.status || 'SAFE'}</AppText>
        </View>
        <View style={styles.row}>
          <AppText size="xs" color="secondary" weight="semibold" style={{ textTransform: 'uppercase' }}>LAST CHECK-IN</AppText>
          <AppText size="sm" weight="bold" color="primary">{loneWorker.lastCheckIn || '03:58 PM'}</AppText>
        </View>
        <View style={styles.row}>
          <AppText size="xs" color="secondary" weight="semibold" style={{ textTransform: 'uppercase' }}>NEXT CHECK DUE</AppText>
          <AppText size="sm" weight="bold" color="warning">{loneWorker.nextCheckRequired || '04:28 PM'}</AppText>
        </View>
      </View>

      {/* Safety Actions */}
      <View style={styles.buttonGroup}>
        <Button
          title={isCheckInDisabled ? "✓ SAFE CHECKED" : "✓ I'M SAFE"}
          variant={isCheckInDisabled ? "secondary" : "primary"}
          size="large"
          fullWidth
          disabled={isCheckInDisabled}
          onPress={() => checkInLoneWorker()}
          style={{ flex: 1, backgroundColor: isCheckInDisabled ? undefined : '#059669' }}
        />
        <Button
          title="⚠️ REPORT ISSUE"
          variant="outline"
          size="large"
          fullWidth
          onPress={() => navigation.navigate('Incident')}
          style={{ flex: 1, borderColor: '#DC2626' }}
        />
      </View>

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
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 16,
  }
});
