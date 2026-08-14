import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const ApplicationInformationCard: React.FC = () => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing.lg }]}>
      <AppText size="sm" color="secondary" style={styles.text}>App Version 1.0.0 (Build 42)</AppText>
      <AppText size="sm" color="secondary" style={styles.text}>Environment: Production</AppText>
      <AppText size="sm" color="secondary" style={styles.text}>Device: iPhone 13 Pro (Mock)</AppText>
      <AppText size="sm" color="secondary" style={styles.text}>Support: support@priorityone.com</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  text: {
    textAlign: 'center',
  }
});
