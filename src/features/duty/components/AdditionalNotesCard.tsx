import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const AdditionalNotesCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Additional Notes</Heading>
      
      <View style={[styles.content, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.sm }]}>
        <AppText size="sm" color="secondary" style={styles.text}>
          "VIP visitor expected between 2 PM and 4 PM. Increase patrol frequency around the reception area."
        </AppText>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    marginBottom: 24, // Extra padding at bottom
  },
  title: {
    marginBottom: 4,
  },
  content: {},
  text: {
    fontStyle: 'italic',
    lineHeight: 20,
  }
});
