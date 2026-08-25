import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking, Platform, Modal, Alert } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useRoute } from '@react-navigation/native';
import { mockPolicies } from './PoliciesScreen';
import { NavIcon } from '../../../components/NavIcon';

export const PolicyDetailsScreen: React.FC = () => {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const route = useRoute<any>();
  const policyId = route.params?.policyId || 'p-1';
  const policy = mockPolicies.find(p => p.id === policyId) || mockPolicies[0];

  const [isDocModalVisible, setIsDocModalVisible] = useState(false);

  const doc = policy.attachedDocument || {
    name: `${policy.title.replace(/\s+/g, '_')}.pdf`,
    size: '1.2 MB',
    type: 'PDF Document',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  };

  const handleOpenDocument = async (inNewTab = false) => {
    const url = doc.url;
    if (Platform.OS === 'web') {
      const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
      if (globalObj.window && globalObj.window.open) {
        globalObj.window.open(url, inNewTab ? '_blank' : '_blank');
        return;
      }
    }

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        setIsDocModalVisible(true);
      }
    } catch (error) {
      setIsDocModalVisible(true);
    }
  };

  const handleDownloadDocument = async () => {
    const url = doc.url;
    const filename = doc.name || `Policy_${policy.id}.pdf`;

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

  return (
    <ScreenLayout activeRoute="Policies">
      <PageHeader title="Policy Detail" showBack />
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Main Header & Overview Card */}
        <Card style={styles.card}>
          <View style={styles.headerBadgeRow}>
            <View style={styles.statusBadge}>
              <AppText size="xs" weight="bold" style={{ color: '#059669' }}>
                ● {policy.status || 'Published'}
              </AppText>
            </View>

            <View style={styles.categoryBadge}>
              <AppText size="xs" weight="bold" style={{ color: '#4F46E5' }}>
                {policy.category}
              </AppText>
            </View>

            <View style={styles.versionBadge}>
              <AppText size="xs" weight="bold" style={{ color: '#475569' }}>
                {policy.version || 'v1.0'}
              </AppText>
            </View>
          </View>

          <Heading level="h3" color="primary" style={styles.title}>
            {policy.title}
          </Heading>

          {/* Target / Assigned Roles */}
          <View style={styles.rolesSection}>
            <AppText size="xs" color="secondary" weight="bold" style={styles.rolesLabel}>
              ASSIGNED ROLES:
            </AppText>
            <View style={styles.rolesRow}>
              {(policy.targetRoles || ['Security Guards', 'Supervisors']).map((role, idx) => (
                <View key={idx} style={styles.roleChip}>
                  <AppText size="xs" weight="medium" style={{ color: '#334155' }}>
                    {role}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Metadata Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <AppText size="xs" color="secondary">Effective Date</AppText>
              <AppText size="sm" weight="bold" color="primary">
                {policy.effectiveDate || 'Jan 01, 2026'}
              </AppText>
            </View>

            <View style={styles.metaItem}>
              <AppText size="xs" color="secondary">Last Revised</AppText>
              <AppText size="sm" weight="bold" color="primary">
                {policy.updatedDate}
              </AppText>
            </View>

            <View style={styles.metaItem}>
              <AppText size="xs" color="secondary">Department / Author</AppText>
              <AppText size="sm" weight="bold" color="primary">
                {policy.author || 'Operations Desk'}
              </AppText>
            </View>

            <View style={styles.metaItem}>
              <AppText size="xs" color="secondary">Policy ID</AppText>
              <AppText size="sm" weight="bold" color="primary">
                {policy.id.toUpperCase()}
              </AppText>
            </View>
          </View>
        </Card>

        {/* Policy Summary & Scope Card */}
        <Card style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ marginRight: 8 }}>
              <NavIcon name="policies" size={18} color="#4F46E5" />
            </View>
            <Heading level="h4" color="primary">Policy Description & Scope</Heading>
          </View>

          <AppText size="sm" color="primary" style={styles.summaryText}>
            {policy.summary}
          </AppText>
        </Card>

        {/* Targeted Roles & Applicability Card */}
        <Card style={styles.card}>
          <Heading level="h4" color="primary" style={{ marginBottom: 10 }}>Target Roles & Applicability</Heading>
          <View style={styles.rolesRow}>
            {(policy.targetRoles || ['Security Guards', 'Supervisors']).map((role, idx) => (
              <View key={idx} style={styles.roleChip}>
                <AppText size="xs" weight="bold" style={{ color: '#1E293B' }}>{role}</AppText>
              </View>
            ))}
          </View>
        </Card>

        {/* Detailed Policy Operational Clauses Card */}
        <Card style={styles.card}>
          <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>Operational Directives & Clauses</Heading>
          <View style={styles.directivesList}>
            {policy.content.map((clause, idx) => (
              <View key={idx} style={styles.directiveCard}>
                <View style={styles.directiveHeader}>
                  <View style={styles.directiveNumberBadge}>
                    <AppText size="xs" weight="bold" style={{ color: '#4F46E5' }}>#{idx + 1}</AppText>
                  </View>
                </View>
                <AppText size="sm" color="text" style={styles.directiveText}>
                  {clause}
                </AppText>
              </View>
            ))}
          </View>
        </Card>

        {/* Attached Policy Document Card */}
        <Card style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ marginRight: 8 }}>
              <NavIcon name="payslips" size={18} color="#4F46E5" />
            </View>
            <Heading level="h4" color="primary">Attached Policy Document</Heading>
          </View>

          <View style={styles.docBox}>
            <View style={styles.docIconWrap}>
              <NavIcon name="policies" size={24} color="#4F46E5" />
            </View>

            <View style={{ flex: 1 }}>
              <AppText size="sm" weight="bold" color="primary" numberOfLines={1}>
                {doc.name}
              </AppText>
              <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                {doc.size} • {doc.type}
              </AppText>
            </View>
          </View>

          {/* Glove-friendly Touch Action Buttons: View & Download */}
          <View style={styles.buttonGroup}>
            
            <Button
              title="Download"
              variant="outline"
              size="large"
              leftIcon={<NavIcon name="download" size={20} color="#4F46E5" />}
              onPress={handleDownloadDocument}
              style={[styles.actionBtn, { borderColor: '#4F46E5' }]}
            />
          </View>
        </Card>

      </ScrollView>

      {/* In-App Document Viewer Modal */}
      <Modal visible={isDocModalVisible} animationType="slide" transparent onRequestClose={() => setIsDocModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginRight: 8 }}>
                  <NavIcon name="policies" size={20} color="#4F46E5" />
                </View>
                <Heading level="h3" color="primary">Document Viewer</Heading>
              </View>

              <TouchableOpacity onPress={() => setIsDocModalVisible(false)}>
                <AppText size="lg" color="secondary" weight="bold">✕</AppText>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.docModalInfo}>
                <Heading level="h4" color="primary">{doc.name}</Heading>
                <AppText size="xs" color="secondary" style={{ marginTop: 4 }}>
                  Size: {doc.size} • Type: {doc.type} • Status: Certified PDF
                </AppText>
              </View>

              <View style={styles.docPreviewCard}>
                <NavIcon name="policies" size={36} color="#4F46E5" />
                <AppText size="base" weight="bold" color="primary" style={{ marginTop: 12 }}>
                  Official Policy Document Attachment
                </AppText>
                <AppText size="sm" color="secondary" style={{ textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
                  This document contains official Priority One Security operational guidelines and regulatory compliance procedures for {policy.title}.
                </AppText>
              </View>

              <View style={styles.modalActions}>
                <Button
                  title="Launch in New Window"
                  variant="primary"
                  size="large"
                  fullWidth
                  onPress={() => {
                    setIsDocModalVisible(false);
                    const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
                    if (globalObj.window && globalObj.window.open) {
                      globalObj.window.open(doc.url, '_blank');
                    } else {
                      Linking.openURL(doc.url);
                    }
                  }}
                  style={{ height: 52, backgroundColor: '#4F46E5' }}
                />
                <Button
                  title="Close Viewer"
                  variant="outline"
                  size="large"
                  fullWidth
                  onPress={() => setIsDocModalVisible(false)}
                  style={{ height: 52 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    padding: 18,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  versionBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  title: {
    marginBottom: 14,
    lineHeight: 26,
  },
  rolesSection: {
    marginBottom: 12,
  },
  rolesLabel: {
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
  },
  metaItem: {
    width: '50%',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryText: {
    lineHeight: 22,
  },
  directivesList: {
    gap: 10,
  },
  directiveCard: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  directiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  directiveNumberBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  directiveText: {
    lineHeight: 20,
  },
  docBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  docIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 52,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalContent: {
    gap: 16,
    paddingBottom: 24,
  },
  docModalInfo: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docPreviewCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  modalActions: {
    gap: 10,
    marginTop: 8,
  },
});
