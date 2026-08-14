import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../../components/typography/Text';
import { useTheme } from '../../../../providers/ThemeProvider';

interface InstructionCardProps {
  message: string;
}

export const InstructionCard: React.FC<InstructionCardProps> = ({ message }) => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary[50], borderRadius: borderRadius.md, padding: spacing.md }]}>
      <AppText size="sm" color={colors.primary[900]} style={styles.text}>
        {message}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  text: {
    textAlign: 'center',
    lineHeight: 20,
  }
});
