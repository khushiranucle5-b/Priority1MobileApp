import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert, Linking, Platform } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../providers/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { NavIcon } from '../../../components/NavIcon';

export interface PolicyDocument {
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface PolicyItem {
  id: string;
  title: string;
  category: string;
  updatedDate: string;
  effectiveDate?: string;
  version?: string;
  status?: string;
  author?: string;
  targetRoles?: string[];
  summary: string;
  content: string[];
  attachedDocument?: PolicyDocument;
}

export const mockPolicies: PolicyItem[] = [
  {
    id: 'p-1',
    title: 'Guard Attendance & Punctuality Policy',
    category: 'Operations',
    updatedDate: 'Aug 01, 2026',
    effectiveDate: 'Jan 01, 2026',
    version: 'v2.1',
    status: 'Published',
    author: 'Operations & Compliance Desk',
    targetRoles: ['Security Guards', 'Supervisors', 'Field Officers'],
    summary: 'Mandatory guidelines for shift clock-in/out protocols, geofence verification radius, late arrival notifications, and overtime logging.',
    content: [
      '1. Guards must clock in using selfie verification upon arriving within the 50m site geofence radius.',
      '2. In case of unexpected delay, guards must inform their supervisor at least 30 minutes prior to shift start.',
      '3. Clocking out before shift completion requires explicit supervisor authorization.',
      '4. Overtime must be logged and verified via shift reports.',
      '5. Consecutive unexcused absences trigger immediate HR escalation and supervisor review.',
    ],
    attachedDocument: {
      name: 'Guard_Attendance_Punctuality_Policy_v2.1.pdf',
      size: '1.4 MB',
      type: 'PDF Document',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  },
  {
    id: 'p-2',
    title: 'Uniform & Grooming Standards Policy',
    category: 'Compliance',
    updatedDate: 'Jul 15, 2026',
    effectiveDate: 'Feb 01, 2026',
    version: 'v1.8',
    status: 'Published',
    author: 'HR & Quality Assurance Team',
    targetRoles: ['All Guard Staff', 'Shift Leads', 'Event Security Officers'],
    summary: 'Guidelines for mandatory Security Officer uniform, duty badge placement, grooming standards, and safety equipment attire.',
    content: [
      '1. Officers must wear official Priority One Security uniform shirts, trousers, and polished black boots during shift hours.',
      '2. Guard badge (GRD-001) and photo ID badge must remain clearly visible at all times on the left chest.',
      '3. High-visibility reflective vests are mandatory during night shifts and patrol operations.',
      '4. Outerwear during winter shifts must strictly adhere to company-issued thermal jackets.',
    ],
    attachedDocument: {
      name: 'Uniform_Grooming_Standards_v1.8.pdf',
      size: '920 KB',
      type: 'PDF Document',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  },
  {
    id: 'p-3',
    title: 'Patrol & Lone Worker Safety Policy',
    category: 'Safety',
    updatedDate: 'Jul 10, 2026',
    effectiveDate: 'Mar 01, 2026',
    version: 'v3.0',
    status: 'Published',
    author: 'HSE & Control Room Desk',
    targetRoles: ['Patrol Officers', 'Lone Workers', 'Control Room Dispatchers'],
    summary: 'Operational protocols for QR code checkpoint scanning schedules, lone worker 30-minute safety check-ins, and emergency SOS escalation.',
    content: [
      '1. Scheduled patrol rounds must scan all assigned QR checkpoints within the 15-minute grace window.',
      '2. Lone Workers must respond to automated safety check-in prompts every 30 minutes.',
      '3. If a safety prompt is missed, automated alert level 1 triggers to the Control Room.',
      '4. Emergency SOS button should be pressed immediately in case of active security or physical threats.',
      '5. Officers operating in high-risk zones must carry active GPS beacon trackers.',
    ],
    attachedDocument: {
      name: 'Patrol_Lone_Worker_Safety_Policy_v3.0.pdf',
      size: '2.1 MB',
      type: 'PDF Document',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  },
  {
    id: 'p-4',
    title: 'Code of Conduct & Ethics Policy',
    category: 'General',
    updatedDate: 'Jun 20, 2026',
    effectiveDate: 'Jan 01, 2026',
    version: 'v1.0',
    status: 'Published',
    author: 'Corporate Ethics & Legal Counsel',
    targetRoles: ['All Priority One Personnel'],
    summary: 'Standards of ethical behavior, visitor interaction, asset handling, non-disclosure compliance, and conflict resolution.',
    content: [
      '1. Treat all site visitors, staff, and contractors with utmost courtesy and professional respect.',
      '2. Never share sensitive site access codes or security logs with unauthorized personnel.',
      '3. Possession or use of alcohol/substances during shift hours results in immediate termination.',
      '4. Report all suspected asset damage, theft, or security breaches immediately to site supervisors.',
    ],
    attachedDocument: {
      name: 'Code_of_Conduct_Ethics_v1.0.pdf',
      size: '1.1 MB',
      type: 'PDF Document',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
  },
];

export const PoliciesScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDownloadDocument = async (policy: PolicyItem) => {
    const doc = policy.attachedDocument;
    const url = doc?.url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const filename = doc?.name || `Policy_${policy.id}.pdf`;

    if (Platform.OS === 'web') {
      const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
      if (globalObj.document) {
        const link = globalObj.document.createElement('a');
        link.href = url;
        link.download = filename;
        globalObj.document.body.appendChild(link);
        link.click();
        globalObj.document.body.removeChild(link);
      }
    } else {
      try {
        await Linking.openURL(url);
      } catch (err) {
        console.warn('File download error:', err);
      }
    }

    Alert.alert(
      'Download Complete',
      `Policy document (${filename}) has been downloaded & saved to mobile storage (Downloads).`,
      [{ text: 'OK' }]
    );
  };

  const filteredPolicies = mockPolicies.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenLayout activeRoute="Policies">
      <PageHeader title="Policy Manual" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBox}>
          <View style={{ marginRight: 8, width: 18, alignItems: 'center' }}>
            <NavIcon name="search" size={16} color="#64748B" />
          </View>
          <TextInput
            placeholder="Search policies by name, category..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <Heading level="h4" style={styles.sectionTitle}>Guard Security Policies</Heading>

        {filteredPolicies.length === 0 ? (
          <AppText size="sm" color="secondary" style={{ textAlign: 'center', marginTop: 24 }}>
            No policies found matching search query.
          </AppText>
        ) : (
          filteredPolicies.map((policy) => (
            <Card key={policy.id} style={styles.policyCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PolicyDetails', { policyId: policy.id })}
              >
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
              </TouchableOpacity>

              <View style={styles.viewRow}>
                <TouchableOpacity
                  style={styles.iconActionBtnView}
                  onPress={() => navigation.navigate('PolicyDetails', { policyId: policy.id })}
                  activeOpacity={0.7}
                  accessibilityLabel="View policy details"
                >
                  <NavIcon name="eye" size={24} color="#4F46E5" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickDownloadBtn}
                  onPress={() => handleDownloadDocument(policy)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Download policy document"
                >
                  <NavIcon name="download" size={22} color="#4F46E5" />
                </TouchableOpacity>
              </View>
            </Card>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
    color: '#64748B',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
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
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    marginTop: 4,
  },
  iconActionBtnView: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickDownloadBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
