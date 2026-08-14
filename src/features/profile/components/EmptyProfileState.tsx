import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const EmptyProfileState: React.FC = () => {
  const { spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingVertical: spacing['4xl'] }]}>
      <AppText style={styles.icon}>👤</AppText>
      <AppText size="base" weight="semibold" style={styles.title}>
        Profile information is currently unavailable.
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
  }
});
