import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

const documents = [
  { id: '1', name: 'ID Card', status: 'Verified' },
  { id: '2', name: 'Driving License', status: 'Verified' },
  { id: '3', name: 'Training Certificates', status: 'Pending' },
  { id: '4', name: 'Employment Contract', status: 'Expired' },
];

export const DocumentsSummaryCard: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return colors.success;
      case 'Pending': return colors.warning;
      case 'Expired': return colors.error;
      default: return colors.primary[500];
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Verified': return colors.successLight;
      case 'Pending': return colors.surfaceSecondary; // Warning bg if available, otherwise surface
      case 'Expired': return colors.errorLight;
      default: return colors.primary[50];
    }
  };

  return (
    <Card variant="elevated" style={styles.card}>
      <Heading level="h4" style={styles.title}>Documents</Heading>
      
      <View style={[styles.list, { marginTop: spacing.sm }]}>
        {documents.map((doc, index) => (
          <View key={doc.id} style={[styles.row, index !== documents.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <AppText size="sm" weight="medium">{doc.name}</AppText>
            <View style={[styles.badge, { backgroundColor: getStatusBgColor(doc.status), borderRadius: borderRadius.full }]}>
              <AppText size="xs" color={getStatusColor(doc.status)} weight="medium">{doc.status}</AppText>
            </View>
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
  list: {
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  }
});
