import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const ClientInformationCard: React.FC = () => {
  const { spacing, borderRadius, colors } = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Client Information</Heading>
      <View style={[styles.row, { marginTop: spacing.sm }]}>
        <Image 
          source={{ uri: 'https://placehold.co/100x100/3b82f6/white?text=ABC' }} 
          style={[styles.logo, { borderRadius: borderRadius.md, backgroundColor: colors.surfaceSecondary }]} 
        />
        <View style={styles.info}>
          <AppText size="base" weight="semibold">ABC Industries</AppText>
          <AppText size="sm" color="secondary" style={styles.detail}>123 Business Park, Sector 45</AppText>
          <AppText size="sm" color="secondary" style={styles.detail}>+1 234-567-8900</AppText>
        </View>
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
  logo: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  info: {
    flex: 1,
  },
  detail: {
    marginTop: 2,
  }
});
