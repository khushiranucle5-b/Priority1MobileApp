import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

const mockHistory = [
  { id: '1', date: 'Aug 04, 2026', name: 'Night Perimeter', checkpoints: 10, status: 'Completed' },
  { id: '2', date: 'Aug 04, 2026', name: 'Evening Lobby', checkpoints: 5, status: 'Completed' },
  { id: '3', date: 'Aug 03, 2026', name: 'Morning Perimeter', checkpoints: 10, status: 'Missed Checkpoints' },
];

export const PatrolHistoryCard: React.FC = () => {
  const { colors, spacing } = useTheme();

  return (
    <Card variant="flat" style={styles.card}>
      <Heading level="h4" style={styles.title}>Patrol History</Heading>
      
      <View style={[styles.list, { marginTop: spacing.sm }]}>
        {mockHistory.map((item, index) => (
          <View key={item.id} style={[styles.item, index !== mockHistory.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.headerRow}>
              <AppText size="sm" weight="semibold">{item.name}</AppText>
              <AppText size="xs" color="secondary">{item.date}</AppText>
            </View>
            <View style={styles.detailRow}>
              <AppText size="xs" color="secondary">Total Checkpoints: {item.checkpoints}</AppText>
              <AppText size="xs" weight="medium" color={item.status === 'Completed' ? 'success' : 'warning'}>{item.status}</AppText>
            </View>
          </View>
        ))}
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
  }
});
