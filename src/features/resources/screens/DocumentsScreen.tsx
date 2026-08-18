import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';

export const DocumentsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();

  const documents = [
    { id: '1', name: 'Code of Conduct Policy', version: 'v1.2', category: 'Ethics & Compliance' },
    { id: '2', name: 'Attendance & Shift Protocol', version: 'v2.0', category: 'Workforce & Conduct' },
    { id: '3', name: 'Incident Escalation Manual', version: 'v1.1', category: 'Safety & Emergency' },
    { id: '4', name: 'Use of Force Guidelines', version: 'v1.0', category: 'Compliance' },
  ];

  return (
    <ScreenLayout>
      <PageHeader title="Important Documents" showBack />
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>
        <Heading level="h4" style={{ marginBottom: spacing.sm }}>Compliance Documents & Manuals</Heading>
        {documents.map(doc => (
          <Card key={doc.id} variant="elevated" style={styles.card}>
            <View style={styles.row}>
              <View>
                <Heading level="h4">{doc.name}</Heading>
                <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>Category: {doc.category}</AppText>
              </View>
              <AppText size="sm" weight="semibold" color="primary">{doc.version}</AppText>
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
  }
});
