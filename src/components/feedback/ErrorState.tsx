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
  message = 'Something went wrong.',
  onRetry,
}) => {
  const { spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing['2xl'] }]}>
      <AppText size="md" weight="semibold" color="error" style={styles.centered}>
        Error
      </AppText>
      <AppText
        size="base"
        color="secondary"
        style={[styles.centered, { marginTop: spacing.xs }]}
      >
        {message}
      </AppText>
      {onRetry && (
        <View style={{ marginTop: spacing.lg }}>
          <Button title="Try Again" onPress={onRetry} variant="outline" size="small" />
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
  },
  centered: {
    textAlign: 'center',
  },
});
