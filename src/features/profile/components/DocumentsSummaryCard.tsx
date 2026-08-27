import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { NavIcon } from '../../../components/NavIcon';

export const DocumentsSummaryCard: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
      <TouchableOpacity
        style={styles.cardRow}
        onPress={() => navigation.navigate('Documents')}
        activeOpacity={0.7}
      >
        <View style={styles.leftRow}>
          <NavIcon name="document" size={22} color="#0F172A" />
          <Heading level="h3" color="primary" style={styles.title}>
            MY DOCUMENTS
          </Heading>
        </View>

        <AppText style={styles.chevron}>›</AppText>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#0F172A',
  },
  chevron: {
    fontSize: 24,
    fontWeight: '400',
    color: '#64748B',
  },
});
