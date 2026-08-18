import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const PatrolProgressSummaryCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { activePatrol } = useGuardStore();
  const navigation = useNavigation<any>();

  if (!activePatrol) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Patrol')}>
        <Card variant="flat" style={styles.card}>
          <Heading level="h4">Patrol Progress</Heading>
          <AppText size="sm" color="secondary" style={{ marginTop: spacing.sm }}>
            No patrol active today. Tap to start.
          </AppText>
        </Card>
      </TouchableOpacity>
    );
  }

  const total = activePatrol.checkpoints || 0;
  const completed = activePatrol.scanned || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Patrol')}>
      <Card variant="flat" style={styles.card}>
        <View style={styles.header}>
          <Heading level="h4">Patrol Progress</Heading>
          <AppText size="sm" color="primary" weight="semibold">
            {completed}/{total} Scanned
          </AppText>
        </View>

        <View style={[styles.progressBarContainer, { backgroundColor: colors.border, borderRadius: borderRadius.full }]}>
          <View style={[styles.progressBarFill, { backgroundColor: colors.success, borderRadius: borderRadius.full, width: `${percent}%` }]} />
        </View>

        <AppText size="xs" color="secondary" style={styles.progressText}>
          {percent}% Completed - Tap to view checkpoints
        </AppText>
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
  progressBarContainer: {
    height: 8,
    width: '100%',
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressText: {
    textAlign: 'right',
    marginTop: 6,
  }
});
