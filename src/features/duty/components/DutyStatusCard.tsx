import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const DutyStatusCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <Card variant="flat" style={styles.card}>
      <View style={styles.content}>
        <AppText size="sm" color="secondary">Duty Status</AppText>
        <View style={[styles.badge, { backgroundColor: colors.successLight, borderRadius: borderRadius.full, marginTop: spacing.xs }]}>
          <AppText size="base" color="success" weight="bold">Ongoing</AppText>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  }
});
