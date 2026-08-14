import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

const instructions = [
  "Report 15 minutes before shift starts.",
  "Wear complete uniform and ID card.",
  "Patrol all assigned checkpoints.",
  "Report incidents immediately.",
  "Follow client safety protocols."
];

export const DutyInstructionsCard: React.FC = () => {
  const { spacing, colors } = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Duty Instructions</Heading>
      
      <View style={[styles.list, { marginTop: spacing.sm }]}>
        {instructions.map((instruction, index) => (
          <View key={index} style={styles.listItem}>
            <AppText color="primary" style={styles.bullet}>•</AppText>
            <AppText size="sm" color="secondary" style={styles.text}>{instruction}</AppText>
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
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    marginRight: 8,
    marginTop: -2,
    fontSize: 16,
  },
  text: {
    flex: 1,
    lineHeight: 20,
  }
});
