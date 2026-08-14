import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const EmptyDutyState: React.FC = () => {
  const { spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing['4xl'] }]}>
      <AppText style={styles.icon}>📭</AppText>
      <AppText size="base" weight="semibold" style={styles.title}>
        No duty assigned for today.
      </AppText>
      <AppText size="sm" color="secondary" style={styles.subtitle}>
        Please contact your supervisor if you think this is a mistake.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 20,
  }
});
