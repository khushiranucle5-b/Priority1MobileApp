import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

const equipmentList = [
  "Walkie Talkie",
  "RFID Card",
  "Baton",
  "Torch",
  "Helmet"
];

export const EquipmentCard: React.FC = () => {
  const { spacing, colors, borderRadius } = useTheme();

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Assigned Equipment</Heading>
      
      <View style={[styles.grid, { marginTop: spacing.sm }]}>
        {equipmentList.map((item, index) => (
          <View key={index} style={[styles.item, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.md }]}>
            <AppText size="sm" weight="medium">{item}</AppText>
          </View>
        ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  item: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  }
});
