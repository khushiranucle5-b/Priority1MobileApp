import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';

export const PostOrdersScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const { assignedSite } = useGuardStore();

  const instructions = [
    { id: '1', title: 'Access Control', detail: 'Verify employee credentials and badges at main gates. Escort unregistered visitors.' },
    { id: '2', title: 'Patrol Frequencies', detail: 'Perform perimeter patrols once every 2 hours. Scan all RFID/NFC tags.' },
    { id: '3', title: 'Emergency Protocols', detail: 'In case of fire, evacuate building per block instructions and contact Elena Ruiz (Supervisor).' },
    { id: '4', title: 'Asset Signout', detail: 'Log and verify radios, body-cams and flashlights at shift handover.' },
  ];

  return (
    <ScreenLayout>
      <PageHeader title="Post Orders" showBack />
      <ScrollView contentContainerStyle={{ padding: spacing.base }}>
        <Card variant="flat" style={{ marginBottom: spacing.md }}>
          <Heading level="h4">Location Site</Heading>
          <AppText size="sm" color="secondary" style={{ marginTop: 4 }}>{assignedSite}</AppText>
        </Card>

        <Heading level="h4" style={{ marginBottom: spacing.sm }}>Standard Operating Procedures</Heading>
        {instructions.map(item => (
          <Card key={item.id} variant="elevated" style={styles.card}>
            <Heading level="h4">{item.title}</Heading>
            <AppText size="sm" color="secondary" style={{ marginTop: spacing.xs }}>{item.detail}</AppText>
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
});
