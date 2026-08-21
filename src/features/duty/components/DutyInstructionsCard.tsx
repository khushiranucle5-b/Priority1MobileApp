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
  const { borderRadius, colors } = useTheme();

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
      <Heading level="h3" color="primary" style={styles.title}>DUTY INSTRUCTIONS</Heading>
      
      <View style={styles.divider} />

      <View style={styles.list}>
        {instructions.map((instruction, index) => (
          <View key={index} style={styles.listItem}>
            <AppText style={[styles.bullet, { color: colors.primary[600] || '#2563EB' }]}>•</AppText>
            <AppText size="base" style={styles.text}>{instruction}</AppText>
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
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  list: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    marginRight: 10,
    fontSize: 20,
    lineHeight: 22,
  },
  text: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 22,
  }
});
