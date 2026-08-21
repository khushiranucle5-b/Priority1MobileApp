import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { AppText } from '../typography/Text';
import { Button } from '../Button';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  icon = '📋',
  actionLabel,
  onAction,
}) => {
  const { spacing } = useTheme();

  return (
    <View style={[styles.container, { paddingHorizontal: spacing['2xl'], paddingVertical: spacing.xl }]}>
      <AppText style={styles.icon}>{icon}</AppText>
      <AppText size="lg" weight="bold" style={styles.centered}>
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
        <View style={{ marginTop: spacing.xl, width: '100%', maxWidth: 300 }}>
          <Button title={actionLabel} onPress={onAction} variant="primary" size="medium" fullWidth />
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
