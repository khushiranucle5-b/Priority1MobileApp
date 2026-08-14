import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const SupervisorCard: React.FC = () => {
  const { spacing, borderRadius, colors } = useTheme();

  const handleCall = () => {
    // Placeholder function
    console.log('Call Supervisor');
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Supervisor</Heading>
      <View style={[styles.row, { marginTop: spacing.sm }]}>
        <Image 
          source={{ uri: 'https://i.pravatar.cc/150?img=12' }} 
          style={[styles.photo, { borderRadius: borderRadius.full, backgroundColor: colors.surfaceSecondary }]} 
        />
        <View style={styles.info}>
          <AppText size="base" weight="semibold">Jane Smith</AppText>
          <AppText size="sm" color="secondary">Field Officer</AppText>
          <AppText size="sm" color="secondary" style={styles.detail}>+1 987-654-3210</AppText>
        </View>
        <TouchableOpacity 
          style={[styles.callBtn, { backgroundColor: colors.primary[50], borderRadius: borderRadius.full }]}
          onPress={handleCall}
        >
          <AppText size="lg">📞</AppText>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: 56,
    height: 56,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  detail: {
    marginTop: 2,
  },
  callBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
