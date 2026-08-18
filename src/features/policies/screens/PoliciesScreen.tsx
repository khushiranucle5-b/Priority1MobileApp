import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Input } from '../../../components/Input';
import { useTheme } from '../../../providers/ThemeProvider';
import { useNavigation } from '@react-navigation/native';

export interface PolicyItem {
  id: string;
  title: string;
  category: string;
  updatedDate: string;
  summary: string;
  content: string[];
}

export const mockPolicies: PolicyItem[] = [
  {
    id: 'p-1',
    title: 'Guard Attendance & Punctuality Policy',
    category: 'Operations',
    updatedDate: 'Aug 01, 2026',
    summary: 'Rules regarding mandatory shift clock in/out, geofence check-ins, and late arrival notifications.',
    content: [
      '1. Guards must clock in using selfie verification upon arriving within the 50m site geofence radius.',
      '2. In case of unexpected delay, guards must inform their supervisor at least 30 minutes prior to shift start.',
      '3. Clocking out before shift completion requires explicit supervisor authorization.',
      '4. Overtime must be logged and verified via shift reports.',
    ],
  },
  {
    id: 'p-2',
    title: 'Uniform & Grooming Standards Policy',
    category: 'Compliance',
    updatedDate: 'Jul 15, 2026',
    summary: 'Guidelines for mandatory Security Officer uniform, duty badge, and professional attire.',
    content: [
      '1. Officers must wear official Priority One Security uniform shirts, trousers, and polished black boots during shift hours.',
      '2. Guard badge (GRD-001) and photo ID badge must remain clearly visible at all times on the left chest.',
      '3. High-visibility reflective vests are mandatory during night shifts and patrol operations.',
    ],
  },
  {
    id: 'p-3',
    title: 'Patrol & Lone Worker Safety Policy',
    category: 'Safety',
    updatedDate: 'Jul 10, 2026',
    summary: 'Protocol for QR code checkpoint scanning, lone worker heartbeats, and emergency SOS escalation.',
    content: [
      '1. Scheduled patrol rounds must scan all assigned QR checkpoints within the 15-minute grace window.',
      '2. Lone Workers must respond to automated safety check-in prompts every 60 minutes.',
      '3. If a safety prompt is missed, automated alert level 1 triggers to the Control Room.',
      '4. Emergency SOS button should be pressed immediately in case of active security or physical threats.',
    ],
  },
  {
    id: 'p-4',
    title: 'Code of Conduct & Ethics Policy',
    category: 'General',
    updatedDate: 'Jun 20, 2026',
    summary: 'Standards of ethical behavior, visitor interaction, asset handling, and confidentiality.',
    content: [
      '1. Treat all site visitors, staff, and contractors with utmost courtesy and professional respect.',
      '2. Never share sensitive site access codes or security logs with unauthorized personnel.',
      '3. Possession or use of alcohol/substances during shift hours results in immediate termination.',
    ],
  },
];

export const PoliciesScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPolicies = mockPolicies.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenLayout activeRoute="Policies">
      <PageHeader title="Policy Manual" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.searchRow}>
          <Input
            placeholder="Search policies..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<AppText style={{ marginRight: 6 }}>🔍</AppText>}
          />
        </View>

        <Heading level="h4" style={styles.sectionTitle}>Guard Security Policies</Heading>

        {filteredPolicies.length === 0 ? (
          <AppText size="sm" color="secondary" style={{ textAlign: 'center', marginTop: 24 }}>
            No policies found matching search query.
          </AppText>
        ) : (
          filteredPolicies.map((policy) => (
            <TouchableOpacity
              key={policy.id}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('PolicyDetails', { policyId: policy.id })}
            >
              <Card style={styles.policyCard}>
                <View style={styles.cardHeader}>
                  <Heading level="h4" color="primary" style={{ flex: 1 }}>{policy.title}</Heading>
                  <AppText size="xs" weight="bold" style={styles.categoryBadge}>
                    {policy.category}
                  </AppText>
                </View>
                <AppText size="xs" color="secondary" style={styles.updatedText}>
                  Updated: {policy.updatedDate}
                </AppText>
                <AppText size="sm" color="secondary" numberOfLines={2} style={styles.summary}>
                  {policy.summary}
                </AppText>
                <View style={styles.viewRow}>
                  <AppText size="sm" weight="bold" color="primary">View Policy</AppText>
                  <AppText size="sm" color="primary"> ›</AppText>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  searchRow: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  policyCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: 'hidden',
  },
  updatedText: {
    marginTop: 4,
    marginBottom: 8,
  },
  summary: {
    lineHeight: 18,
    marginBottom: 12,
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
});
