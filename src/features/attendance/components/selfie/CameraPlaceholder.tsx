import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../../components/typography/Text';
import { useTheme } from '../../../../providers/ThemeProvider';

export const CameraPlaceholder: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.full }]}>
      <AppText style={styles.icon}>📷</AppText>
      <AppText size="sm" color="secondary" style={styles.text}>No Photo Captured</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1', // Slate 300
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
  }
});
