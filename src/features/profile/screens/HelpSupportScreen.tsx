import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';
import { NavIcon } from '../../../components/NavIcon';

export const HelpSupportScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    { q: 'How do I clock in for my scheduled shift?', a: 'Navigate to the Home tab and tap the green "Clock In" button. Ensure location services are enabled and complete selfie verification if required.' },
    { q: 'How do I submit an incident report?', a: 'Go to the Duty or Home tab, tap "File Incident", select the category and severity level, add descriptions/attachments, and tap Submit.' },
    { q: 'What happens if I miss a patrol checkpoint?', a: 'Missed checkpoints are logged automatically on the supervisor dashboard. You will receive a prompt to scan or provide a brief reason for skipping.' },
    { q: 'How do Periodic Lone Worker Safety Checks work?', a: 'While clocked in, the app triggers periodic check-in prompts (every 30 mins). Tap "I\'m Safe" within the grace period to confirm your safety status.' },
    { q: 'Why is background location tracking required?', a: 'Location services ensure lone worker safety compliance and verify that duty shifts are conducted within the designated site geofence.' },
    { q: 'How do I apply for annual or sick leave?', a: 'Open the Navigation drawer or Resources section, select Leave Requests, choose leave dates and type, and submit for HR approval.' },
  ];

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const lower = searchQuery.toLowerCase();
    return faqs.filter(f => f.q.toLowerCase().includes(lower) || f.a.toLowerCase().includes(lower));
  }, [searchQuery, faqs]);

  return (
    <ScreenLayout>
      <PageHeader title="Help & Support" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <NavIcon name="search" size={18} color={colors.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search FAQs and help topics..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <AppText size="lg" weight="bold" style={{ marginBottom: spacing.sm, marginTop: spacing.md }}>Frequently Asked Questions</AppText>
        
        {filteredFaqs.length === 0 ? (
          <AppText color="secondary" style={{ textAlign: 'center', marginVertical: 20 }}>No matching help topics found.</AppText>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}
                onPress={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <View style={styles.faqHeader}>
                  <AppText weight="bold" style={{ flex: 1, paddingRight: 8 }}>{faq.q}</AppText>
                  <AppText color="primary" weight="bold">{isExpanded ? '−' : '+'}</AppText>
                </View>
                {isExpanded && (
                  <AppText color="secondary" style={styles.faqAnswer}>{faq.a}</AppText>
                )}
              </TouchableOpacity>
            );
          })
        )}

        <View style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md, marginTop: spacing.lg }]}>
          <AppText size="base" weight="bold" style={{ marginBottom: 4 }}>Still need help?</AppText>
          <AppText size="sm" color="secondary" style={{ marginBottom: 14 }}>
            Our 24/7 Priority One dispatch and technical support team is ready to assist you.
          </AppText>
          <Button title="Contact Support Team" onPress={() => navigation.navigate('ContactSupport')} />
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqAnswer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CBD5E1',
    lineHeight: 20,
  },
  contactCard: {
    padding: 18,
    borderWidth: 1,
  },
});
