import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { AppText } from '../typography/Text';
import { Button } from '../Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Unable to complete action. Please check your connection and try again.',
  onRetry,
}) => {
  const { spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing['2xl'], paddingVertical: spacing.xl }]}>
      <AppText style={styles.icon}>⚠️</AppText>
      <AppText size="lg" weight="bold" color="error" style={styles.centered}>
        Something Went Wrong
      </AppText>
      <AppText
        size="base"
        color="secondary"
        style={[styles.centered, { marginTop: spacing.xs }]}
      >
        {message}
      </AppText>
      {onRetry && (
        <View style={{ marginTop: spacing.xl, width: '100%', maxWidth: 280 }}>
          <Button title="TRY AGAIN" onPress={onRetry} variant="outline" size="medium" fullWidth />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 220,
  },
  icon: {
    fontSize: 48,
    lineHeight: 56,
    marginBottom: 12,
  },
  centered: {
    textAlign: 'center',
  },
});
