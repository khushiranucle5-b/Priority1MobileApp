import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const EmptyAttendanceState: React.FC = () => {
  const { spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing['3xl'] }]}>
      <AppText style={styles.icon}>📅</AppText>
      <AppText size="base" color="secondary" weight="medium" style={styles.text}>
        No attendance recorded today.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  text: {
    textAlign: 'center',
  }
});
