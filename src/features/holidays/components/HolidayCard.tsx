import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export interface HolidayData {
  id: string;
  name: string;
  dateStr: string;
  dayOfWeek: string;
  type: 'National Holiday' | 'Company Holiday' | 'Festival Holiday';
  isUpcoming: boolean;
}

interface HolidayCardProps {
  data: HolidayData;
}

export const HolidayCard: React.FC<HolidayCardProps> = ({ data }) => {
  const { colors, spacing, borderRadius } = useTheme();

  const getTypeColor = () => {
    switch (data.type) {
      case 'National Holiday': return colors.primary[600];
      case 'Festival Holiday': return colors.warning;
      case 'Company Holiday': return colors.success;
      default: return colors.secondary;
    }
  };

  const getTypeBgColor = () => {
    switch (data.type) {
      case 'National Holiday': return colors.primary[50];
      case 'Festival Holiday': return colors.surfaceSecondary; // or a custom warning light
      case 'Company Holiday': return colors.successLight;
      default: return colors.surfaceSecondary;
    }
  };

  return (
    <Card variant="elevated" style={[styles.card, data.isUpcoming && { borderColor: colors.primary[500], borderWidth: 1 }]}>
      <View style={styles.header}>
        <AppText size="md" weight="semibold">{data.name}</AppText>
        {data.isUpcoming && (
          <View style={[styles.upcomingBadge, { backgroundColor: colors.primary[500], borderRadius: borderRadius.full }]}>
            <AppText size="sm" color="surface" weight="medium">Upcoming</AppText>
          </View>
        )}
      </View>
      
      <View style={[styles.details, { marginTop: spacing.xs }]}>
        <AppText size="base" color="secondary">📅 {data.dateStr} ({data.dayOfWeek})</AppText>
        <View style={[styles.typeBadge, { backgroundColor: getTypeBgColor(), borderRadius: borderRadius.full }]}>
          <AppText size="sm" color={getTypeColor()} weight="medium">{data.type}</AppText>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  }
});
