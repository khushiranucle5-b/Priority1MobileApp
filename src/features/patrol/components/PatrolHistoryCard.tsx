import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const PatrolHistoryCard: React.FC = () => {
  const { colors, spacing } = useTheme();
  const patrols = useGuardStore((state) => state.patrols);

  // Filter completed patrols
  const completedPatrols = patrols.filter(p => p.status === 'completed');

  return (
    <Card variant="flat" style={styles.card}>
      <Heading level="h4" style={styles.title}>Patrol History</Heading>
      
      <View style={[styles.list, { marginTop: spacing.sm }]}>
        {completedPatrols.map((item, index) => (
          <View key={item.id} style={[styles.item, index !== completedPatrols.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.headerRow}>
              <AppText size="sm" weight="semibold">{item.title || 'Patrol'}</AppText>
              <AppText size="xs" color="secondary">{item.date}</AppText>
            </View>
            <View style={styles.detailRow}>
              <AppText size="xs" color="secondary">Total Checkpoints: {item.checkpoints} • Completed: {item.scanned}</AppText>
              <AppText size="xs" weight="medium" color="success">Completed</AppText>
            </View>
          </View>
        ))}

        {completedPatrols.length === 0 && (
          <View style={styles.emptyContainer}>
            <AppText size="sm" color="secondary">
              No completed patrols logged yet.
            </AppText>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    marginBottom: 4,
  },
  list: {
    marginTop: 4,
  },
  item: {
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  }
});
