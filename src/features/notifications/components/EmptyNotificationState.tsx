import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const EmptyNotificationState: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <AppText style={[styles.icon, { fontSize: 40 }]}>📭</AppText>
      <Heading level="h3" style={styles.title}>No Notifications</Heading>
      <AppText color="secondary" style={styles.description}>
        You're all caught up! Check back later for updates.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
  },
});
