import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { AppText } from '../typography/Text';

interface LoadingStateProps {
  size?: 'small' | 'large';
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'large',
  message,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.xl }]}>
      <ActivityIndicator size={size} color={colors.primary[600]} />
      {message && (
        <AppText
          size="base"
          weight="semibold"
          color="primary"
          style={{ marginTop: spacing.md, textAlign: 'center' }}
        >
          {message}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
