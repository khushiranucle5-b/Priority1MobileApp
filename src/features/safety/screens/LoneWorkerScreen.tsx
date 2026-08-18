import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { LoneWorkerCard } from '../../home/components/LoneWorkerCard';

export const LoneWorkerScreen: React.FC = () => {
  const { spacing } = useTheme();

  return (
    <ScreenLayout>
      <PageHeader title="Lone Worker Check" showBack />
      <View style={[styles.container, { padding: spacing.base }]}>
        <LoneWorkerCard />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
