import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export type CheckpointStatus = 'Pending' | 'Completed' | 'Missed';

export interface CheckpointData {
  id: string;
  name: string;
  number: string;
  location: string;
  scheduledTime: string;
  status: CheckpointStatus;
}

interface CheckpointCardProps {
  data: CheckpointData;
}

export const CheckpointCard: React.FC<CheckpointCardProps> = ({ data }) => {
  const { colors, spacing, borderRadius } = useTheme();

  const getStatusColor = () => {
    switch (data.status) {
      case 'Completed': return colors.success;
      case 'Missed': return colors.error;
      case 'Pending': default: return colors.info;
    }
  };

  const getStatusBgColor = () => {
    switch (data.status) {
      case 'Completed': return colors.successLight;
      case 'Missed': return colors.errorLight;
      case 'Pending': default: return colors.infoLight;
    }
  };

  return (
    <Card variant="elevated" padding={12} style={styles.card}>
      <View style={styles.header}>
        <AppText size="sm" weight="semibold">{data.number} - {data.name}</AppText>
        <View style={[styles.badge, { backgroundColor: getStatusBgColor(), borderRadius: borderRadius.full }]}>
          <AppText size="xs" color={getStatusColor()} weight="medium">{data.status}</AppText>
        </View>
      </View>
      
      <View style={[styles.details, { marginTop: spacing.xs }]}>
        <AppText size="xs" color="secondary">📍 {data.location}</AppText>
        <AppText size="xs" color="secondary">⏰ {data.scheduledTime}</AppText>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
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
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});
