import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const PatrolInformationCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary[50], borderRadius: borderRadius.md, padding: spacing.md }]}>
      <AppText size="sm" color={colors.primary[900]} style={styles.text}>
        ℹ️ Complete all assigned checkpoints in order. Tap "QR Scan" to scan checkpoint QR codes (CP-01 to CP-05) using the emulator scanning panel.
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
    lineHeight: 20,
  }
});
