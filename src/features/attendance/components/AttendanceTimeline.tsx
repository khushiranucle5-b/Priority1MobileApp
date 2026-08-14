import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

const timelineData = [
  { id: '1', time: '09:00 AM', event: 'Clock In', type: 'active' },
  { id: '2', time: '01:00 PM', event: 'Break Started', type: 'neutral' },
  { id: '3', time: '01:30 PM', event: 'Break Ended', type: 'neutral' },
  { id: '4', time: '06:00 PM', event: 'Clock Out', type: 'pending' },
];

export const AttendanceTimeline: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <Card variant="flat" style={styles.card}>
      <Heading level="h4" style={styles.title}>Timeline</Heading>
      
      <View style={styles.list}>
        {timelineData.map((item, index) => {
          const isLast = index === timelineData.length - 1;
          const getDotColor = () => {
            if (item.type === 'active') return colors.success;
            if (item.type === 'pending') return colors.borderStrong;
            return colors.primary[500];
          };

          return (
            <View key={item.id} style={styles.item}>
              <View style={styles.timelineGraphic}>
                <View style={[styles.dot, { backgroundColor: getDotColor(), borderRadius: borderRadius.full }]} />
                {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
              </View>
              <View style={[styles.content, { paddingBottom: isLast ? 0 : spacing.lg }]}>
                <AppText size="sm" weight="semibold">{item.time}</AppText>
                <AppText size="xs" color="secondary">{item.event}</AppText>
              </View>
            </View>
          );
        })}
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
    marginBottom: 16,
  },
  list: {
    paddingLeft: 8,
  },
  item: {
    flexDirection: 'row',
  },
  timelineGraphic: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    zIndex: 2,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: -4,
    marginBottom: -4,
    zIndex: 1,
  },
  content: {
    flex: 1,
    paddingLeft: 12,
    marginTop: -2,
  }
});
