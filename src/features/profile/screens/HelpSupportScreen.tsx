import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';

export const HelpSupportScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();

  const faqs = [
    { q: 'How do I submit an incident?', a: 'Go to the Home tab and tap the large "File Incident" button.' },
    { q: 'What happens if I miss a patrol checkpoint?', a: 'Missed checkpoints are logged automatically. You must file a brief note explaining the omission.' },
    { q: 'Why is my location required?', a: 'Location services ensure safety checks can verify you are within the assigned geofence while on duty.' },
  ];

  return (
    <ScreenLayout>
      <PageHeader title="Help & Support" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        <AppText size="lg" weight="bold" style={{ marginBottom: spacing.md }}>Frequently Asked Questions</AppText>
        
        {faqs.map((faq, index) => (
          <View key={index} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <AppText weight="bold" style={{ marginBottom: 8 }}>{faq.q}</AppText>
            <AppText color="secondary">{faq.a}</AppText>
          </View>
        ))}

        <AppText size="sm" color="secondary" style={styles.footer}>
          For issues not listed here, please use the Contact Support option or speak with your Site Supervisor.
        </AppText>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 20,
  }
});
