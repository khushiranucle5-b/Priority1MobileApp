import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { AppText } from '../typography/Text';
import { Button } from '../Button';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  const { spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing['2xl'] }]}>
      <AppText size="md" weight="semibold" style={styles.centered}>
        {title}
      </AppText>
      {subtitle && (
        <AppText
          size="base"
          color="secondary"
          style={[styles.centered, { marginTop: spacing.xs }]}
        >
          {subtitle}
        </AppText>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing.lg }}>
          <Button title={actionLabel} onPress={onAction} variant="outline" size="small" />
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
