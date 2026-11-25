import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../../components/typography/Text';
import { useTheme } from '../../../../providers/ThemeProvider';

export const CameraPlaceholder: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary[50], borderRadius: borderRadius.full, borderColor: colors.primary[400] }]}>
      <AppText style={styles.icon}>🤳</AppText>
      <AppText size="sm" weight="semibold" style={{ color: colors.primary[700], textAlign: 'center' }}>
        No Selfie Captured Yet
      </AppText>
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
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
  },
  text: {
    textAlign: 'center',
  }
});
