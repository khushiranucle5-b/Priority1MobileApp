import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const AssetsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  const assets = [
    { id: '1', name: 'Patrol Radio Unit (R-014)', type: 'Equipment', status: 'Assigned' },
    { id: '2', name: 'Security Guard Uniform (L/XL)', type: 'Uniform', status: 'Assigned' },
    { id: '3', name: 'Tactical Flashlight LED', type: 'Equipment', status: 'Assigned' },
    { id: '4', name: 'Body-cam Transmitted Unit', type: 'Equipment', status: 'Pending Verification' },
  ];

  return (
    <ScreenLayout>
      <PageHeader title="Assigned Assets" showBack />
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>
        <Heading level="h4" style={{ marginBottom: spacing.sm }}>My Uniform & Equipment</Heading>
        {assets.map(asset => (
          <Card key={asset.id} variant="elevated" style={styles.card}>
            <View style={styles.row}>
              <View>
                <Heading level="h4">{asset.name}</Heading>
                <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>Type: {asset.type}</AppText>
              </View>
              <View style={[styles.badge, { backgroundColor: asset.status === 'Assigned' ? colors.successLight : colors.surfaceSecondary, borderRadius: borderRadius.full }]}>
                <AppText size="xs" color={asset.status === 'Assigned' ? 'success' : 'secondary'} weight="bold">{asset.status}</AppText>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  }
});
