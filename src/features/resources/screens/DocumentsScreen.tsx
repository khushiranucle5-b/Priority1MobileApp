import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, DBEmployeeDocument } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';

export const DocumentsScreen: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { documents, guardName } = useGuardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending Verification' | 'Action Required'>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const defaultDocs: DBEmployeeDocument[] = [
    {
      id: 'd-1',
      employeeId: 'emp-1',
      name: 'PSARA Security Guard License',
      type: 'Licensing',
      status: 'Approved',
      uploadedAt: '2025-01-15',
      uri: '',
      fileName: 'psara_license.pdf',
      mimeType: 'application/pdf',
    },
    {
      id: 'd-2',
      employeeId: 'emp-1',
      name: 'Aadhaar Card / Government ID',
      type: 'Government ID',
      status: 'Approved',
      uploadedAt: '2025-01-15',
      uri: '',
      fileName: 'aadhaar_card.pdf',
      mimeType: 'application/pdf',
    },
    {
      id: 'd-3',
      employeeId: 'emp-1',
      name: 'Police Clearance Certificate',
      type: 'Background Check',
      status: 'Approved',
      uploadedAt: '2025-02-10',
      uri: '',
      fileName: 'police_clearance.pdf',
      mimeType: 'application/pdf',
    },
  ];

  const allDocumentsList = useMemo(() => {
    return documents && documents.length > 0 ? [...documents, ...defaultDocs] : defaultDocs;
  }, [documents]);

  const filterOptions = ['All Statuses', 'Approved', 'Pending Verification', 'Action Required'] as const;

  const filteredDocuments = allDocumentsList.filter((doc: DBEmployeeDocument) => {
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (doc.name || '').toLowerCase().includes(q);
    const typeMatch = (doc.type || '').toLowerCase().includes(q);
    const fileMatch = (doc.fileName || '').toLowerCase().includes(q);

    const matchesSearch = !q || nameMatch || typeMatch || fileMatch;

    let matchesStatus = true;
    const st = (doc.status || '').toLowerCase();
    if (statusFilter === 'Approved') {
      matchesStatus = st.includes('approved') || st.includes('verified') || st.includes('active');
    } else if (statusFilter === 'Pending Verification') {
      matchesStatus = st.includes('pending') || st.includes('review');
    } else if (statusFilter === 'Action Required') {
      matchesStatus = st.includes('action') || st.includes('re-upload') || st.includes('rejected');
    }

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeStyle = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('approved') || s.includes('verified') || s.includes('active')) {
      return { bg: '#ECFDF5', text: '#059669', label: 'Active' };
    }
    if (s.includes('pending') || s.includes('review')) {
      return { bg: '#FEF3C7', text: '#D97706', label: 'Pending' };
    }
    return { bg: '#EEF2FF', text: '#4F46E5', label: 'Action Required' };
  };

  const handleViewDoc = (doc: DBEmployeeDocument) => {
    Alert.alert('View Document', `Opening document "${doc.name}" (${doc.fileName || 'document.pdf'})...`);
  };

  const handleEditDoc = (doc: DBEmployeeDocument) => {
    navigation.navigate('UploadDocument', { documentId: doc.id });
  };

  return (
    <ScreenLayout activeRoute="Documents">
      <PageHeader title="Guard Documents" showBack />

      <View style={styles.mainWrapper}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

          {/* Header Block */}
          <View style={styles.headerBlock}>
            <Heading level="h2" color="primary" style={styles.headerTitle}>Guard Documents</Heading>
            <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
              Official compliance licenses, IDs, and HR approval records for {guardName || 'Khushi Rani'}.
            </AppText>
          </View>

          {/* Search & Dropdown Filter Row */}
          <View style={styles.searchFilterRow}>
            <View style={styles.searchInputWrapper}>
              <View style={{ marginRight: 8 }}>
                <NavIcon name="search" size={18} color="#64748B" />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by document name, type..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                  <AppText size="xs" weight="bold" style={{ color: '#64748B' }}>✕</AppText>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Dropdown Filter Trigger */}
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setDropdownOpen(!dropdownOpen)}
              activeOpacity={0.8}
            >
              <AppText size="xs" weight="bold" style={{ color: '#475569', marginRight: 4 }}>
                {statusFilter === 'All' ? 'All Statuses' : statusFilter}
              </AppText>
              <AppText size="xs" color="secondary">{dropdownOpen ? '▲' : '▼'}</AppText>
            </TouchableOpacity>
          </View>

          {/* Dropdown Menu Options */}
          {dropdownOpen && (
            <View style={styles.dropdownMenuContainer}>
              {filterOptions.map((opt) => {
                const valueKey = opt === 'All Statuses' ? 'All' : opt;
                const isSel = statusFilter === valueKey;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.dropdownMenuItem, isSel && styles.dropdownMenuItemActive]}
                    onPress={() => {
                      setStatusFilter(valueKey as any);
                      setDropdownOpen(false);
                    }}
                  >
                    <AppText
                      size="sm"
                      weight={isSel ? 'bold' : 'medium'}
                      style={{ color: isSel ? '#4F46E5' : '#334155' }}
                    >
                      {isSel ? `✓ ${opt}` : opt}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Document Cards List */}
          {filteredDocuments.length === 0 ? (
            <Card style={{ padding: 28, alignItems: 'center' }}>
              <NavIcon name="policies" size={40} color="#94A3B8" />
              <Heading level="h3" color="primary" style={{ marginTop: 12, fontSize: 18 }}>
                No Documents Found
              </Heading>
              <AppText size="sm" color="secondary" style={{ marginTop: 6, textAlign: 'center' }}>
                No documents match your search or filter options.
              </AppText>
            </Card>
          ) : (
            filteredDocuments.map((item: DBEmployeeDocument) => {
              const badgeStyle = getStatusBadgeStyle(item.status);

              return (
                <Card key={item.id} style={styles.docCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.iconBox}>
                      <NavIcon name="policies" size={24} color="#4F46E5" />
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Heading level="h3" color="primary" style={styles.docTitle}>
                        {item.name}
                      </Heading>
                      <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                        Category: <AppText size="xs" weight="bold" color="primary">{item.type || 'Verification'}</AppText>
                      </AppText>
                    </View>

                    {/* Status Badge */}
                    <View style={[styles.badge, { backgroundColor: badgeStyle.bg }]}>
                      <AppText size="xs" weight="bold" style={{ color: badgeStyle.text }}>
                        {badgeStyle.label}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.cardFooterRow}>
                    <AppText size="xs" color="secondary">
                      Uploaded: {item.uploadedAt || '2026-08-21'}
                    </AppText>

                    {/* Enlarged View (eye) & Edit (pencil) action icons (No delete button for guard upload section) */}
                    <View style={styles.iconActionsRow}>
                      <TouchableOpacity
                        onPress={() => handleViewDoc(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.actionIconBtn}
                      >
                        <NavIcon name="eye" size={26} color="#334155" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleEditDoc(item)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.actionIconBtn}
                      >
                        <NavIcon name="edit" size={26} color="#334155" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })
          )}

        </ScrollView>

        {/* Fixed Bottom Primary Button in #4F46E5 purple/indigo */}
        <View style={styles.bottomBar}>
          <Button
            title="+ UPLOAD NEW DOCUMENT"
            variant="primary"
            size="large"
            fullWidth
            onPress={() => navigation.navigate('UploadDocument')}
            style={{ height: 54, backgroundColor: '#4F46E5', borderRadius: 10 }}
          />
        </View>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 94,
  },
  headerBlock: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
  },
  dropdownMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 4,
    marginBottom: 14,
    elevation: 3,
  },
  dropdownMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  dropdownMenuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  docCard: {
    padding: 18,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 6,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  iconActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  actionIconBtn: {
    padding: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    elevation: 8,
  },
});
