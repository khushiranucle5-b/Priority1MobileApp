import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';
import { NavIcon } from '../../../components/NavIcon';

import { typography } from '../../../theme/tokens/typography';

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
          <NavIcon name="search" size={22} color={colors.secondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search FAQs and help topics..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <AppText style={styles.sectionHeader}>Frequently Asked Questions</AppText>
        
        {filteredFaqs.length === 0 ? (
          <AppText color="secondary" style={styles.noResultsText}>No matching help topics found.</AppText>
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
                  <AppText style={styles.questionText}>{faq.q}</AppText>
                  <AppText style={styles.toggleIcon}>{isExpanded ? '−' : '+'}</AppText>
                </View>
                {isExpanded && (
                  <AppText style={styles.faqAnswer}>{faq.a}</AppText>
                )}
              </TouchableOpacity>
            );
          })
        )}

        <View style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md, marginTop: spacing.lg }]}>
          <AppText style={styles.contactTitle}>Still need help?</AppText>
          <AppText style={styles.contactSub}>
            Our 24/7 Priority One dispatch and technical support team is ready to assist you.
          </AppText>
          <Button title="Contact Support Team" size="large" fullWidth style={{ minHeight: 60 }} onPress={() => navigation.navigate('ContactSupport')} />
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
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    ...typography.presets.body,
    includeFontPadding: false,
  },
  sectionHeader: {
    ...typography.presets.sectionHeading,
    color: '#0F172A',
    marginBottom: 14,
    marginTop: 14,
  },
  noResultsText: {
    textAlign: 'center',
    ...typography.presets.label,
    marginVertical: 20,
  },
  card: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    flex: 1,
    paddingRight: 10,
    ...typography.presets.body,
    fontWeight: '600',
    color: '#0F172A',
  },
  toggleIcon: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2563EB',
  },
  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...typography.presets.body,
    lineHeight: 26,
    color: '#334155',
  },
  contactCard: {
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  contactTitle: {
    ...typography.presets.cardTitle,
    color: '#0F172A',
    marginBottom: 8,
  },
  contactSub: {
    ...typography.presets.helper,
    lineHeight: 22,
    color: '#64748B',
    marginBottom: 18,
  }
});
