import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const AttendanceInfoCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary[50], borderRadius: borderRadius.md, padding: spacing.md }]}>
      <AppText size="sm" color={colors.primary[900]} style={styles.text}>
        ℹ️ Your attendance will be verified using your assigned work location once GPS integration is enabled.
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
