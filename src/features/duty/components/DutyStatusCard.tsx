import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { StatusBadge } from '../../../components/StatusBadge';

export const DutyStatusCard: React.FC = () => {
  return (
    <Card variant="flat" style={styles.card}>
      <View style={styles.content}>
        <AppText size="base" color="secondary" weight="semibold" style={styles.statusTitle}>DUTY STATUS</AppText>
        <View style={{ marginTop: 6 }}>
          <StatusBadge status="ONGOING" size="md" />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
  },
  content: {
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
