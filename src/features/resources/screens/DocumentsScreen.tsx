import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert, Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, DBEmployeeDocument } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import { FilterBottomSheet } from '../../../components/FilterBottomSheet';

const SAMPLE_PDF_DATA_URL = 'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDAKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPj4KZW5kb2JqCjMgMCBvYmoKPDAKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgNSAwIFIKPj4KPj4KPj4KZW5kb2JqCjQgMCBvYmoKPDAKL0xlbmd0aCA1Ngo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3MDAgVGQKKFByaW9yaXR5MSAtIE9mZmljaWFsIEd1YXJkIERvY3VtZW50KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDAKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwDYTY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyNjEgMDAwMDAgbiAKMDAwMDAwMDM2OCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDYKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQ1NwolJUVPRg==';

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
      uri: SAMPLE_PDF_DATA_URL,
      fileName: 'psara_license.pdf',
      mimeType: 'application/pdf',
    },
    {
      id: 'd-2',
      employeeId: 'emp-1',
      name: 'Government ID',
      type: 'Government ID',
      status: 'Approved',
      uploadedAt: '2025-01-15',
      uri: SAMPLE_PDF_DATA_URL,
      fileName: 'gov_id.pdf',
      mimeType: 'application/pdf',
    },
    {
      id: 'd-3',
      employeeId: 'emp-1',
      name: 'Police Clearance Certificate',
      type: 'Background Check',
      status: 'Approved',
      uploadedAt: '2025-02-10',
      uri: SAMPLE_PDF_DATA_URL,
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

  const handleViewDoc = async (doc: DBEmployeeDocument) => {
    let targetUrl = doc.uri;
    if (!targetUrl || targetUrl.trim() === '' || targetUrl.includes('simulated_document.pdf')) {
      targetUrl = SAMPLE_PDF_DATA_URL;
    }

    const docName = doc.name || doc.fileName || 'Document';

    if (Platform.OS === 'web') {
      const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
      if (globalObj.window && globalObj.window.open) {
        const win = globalObj.window.open('', '_blank');
        if (win) {
          const isImage = targetUrl.startsWith('data:image') || targetUrl.endsWith('.png') || targetUrl.endsWith('.jpg') || targetUrl.endsWith('.jpeg');
          const cleanDocName = docName.replace(/"/g, '&quot;');
          const safeDownloadName = docName.replace(/[^a-zA-Z0-9_-]/g, '_');

          win.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${cleanDocName}</title>
              <style>
                * { box-sizing: border-box; }
                html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #0f172a; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; overflow: hidden; display: flex; flex-direction: column; }
                .top-bar { height: 56px; background: #1e293b; border-bottom: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; color: #ffffff; flex-shrink: 0; z-index: 10; }
                .doc-title { font-size: 16px; font-weight: 600; color: #f8fafc; display: flex; align-items: center; gap: 8px; max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .btn { background: #4f46e5; color: #ffffff; padding: 8px 18px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; border: none; cursor: pointer; transition: background 0.2s; }
                .btn:hover { background: #4338ca; }
                .viewer-body { flex: 1; width: 100%; height: calc(100% - 56px); display: flex; align-items: center; justify-content: center; background: #334155; position: relative; }
                object, embed, iframe { width: 100%; height: 100%; border: none; }
                .img-preview { max-width: 90%; max-height: 85vh; object-fit: contain; border-radius: 8px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
              </style>
            </head>
            <body>
              <div class="top-bar">
                <div class="doc-title">📄 ${cleanDocName}</div>
                <div>
                  <a class="btn" href="${targetUrl}" download="${safeDownloadName}.pdf">⬇ Download Document</a>
                </div>
              </div>
              <div class="viewer-body">
                ${isImage
              ? `<img class="img-preview" src="${targetUrl}" alt="${cleanDocName}" />`
              : `<object data="${targetUrl}" type="application/pdf">
                      <embed src="${targetUrl}" type="application/pdf" />
                      <iframe src="${targetUrl}"></iframe>
                     </object>`
            }
              </div>
            </body>
            </html>
          `);
          win.document.close();
          return;
        }
      }
    }

    try {
      await Linking.openURL(targetUrl);
    } catch (err) {
      console.warn('Could not open document URL:', err);
      Alert.alert('Unable to open document', 'The document link could not be opened.');
    }
  };

  const handleEditDoc = (doc: DBEmployeeDocument) => {
    navigation.navigate('UploadDocument', { documentId: doc.id });
  };

  return (
    <ScreenLayout activeRoute="Documents">
      <PageHeader title="My Documents" showBack />

      <View style={styles.mainWrapper}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

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
              <AppText size="sm" weight="bold" style={{ color: '#475569', marginRight: 4 }}>
                {statusFilter === 'All' ? 'Filter: All' : `Filter: ${statusFilter}`}
              </AppText>
              <AppText size="sm" color="secondary">{dropdownOpen ? '▲' : '▼'}</AppText>
            </TouchableOpacity>
          </View>

          {/* Document Status Filter Bottom Sheet */}
          <FilterBottomSheet
            visible={dropdownOpen}
            onClose={() => setDropdownOpen(false)}
            title="Select Status"
            options={filterOptions.map((opt) => ({
              label: opt,
              value: opt === 'All Statuses' ? 'All' : opt,
            }))}
            selectedValue={statusFilter}
            onSelect={(val) => setStatusFilter(val as any)}
          />

          {/* Document Cards List */}
          {filteredDocuments.length === 0 ? (
            <Card style={{ padding: 28, alignItems: 'center' }}>
              <NavIcon name="document" size={40} color="#94A3B8" />
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
                      <NavIcon name="document" size={24} color="#4F46E5" />
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

                    {/* Styled View (eye) & Edit (pencil) action button boxes */}
                    <View style={styles.iconActionsRow}>
                      <TouchableOpacity
                        onPress={() => handleViewDoc(item)}
                        style={styles.iconActionBtnView}
                        activeOpacity={0.7}
                        accessibilityLabel="View document"
                      >
                        <NavIcon name="eye" size={24} color="#4F46E5" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleEditDoc(item)}
                        style={styles.iconActionBtnEdit}
                        activeOpacity={0.7}
                        accessibilityLabel="Edit document"
                      >
                        <NavIcon name="edit" size={24} color="#4F46E5" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })
          )}

        </ScrollView>

        {/* Floating Action Button (FAB) for UPLOAD DOCUMENT */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('UploadDocument')}
          activeOpacity={0.85}
          accessibilityLabel="Upload document"
          accessibilityRole="button"
        >
          <NavIcon name="document" size={22} color="#FFFFFF" />
          <AppText size="base" weight="bold" style={styles.floatingButtonText}>
            UPLOAD DOCUMENT
          </AppText>
        </TouchableOpacity>
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
    paddingBottom: 100,
  },
  headerBlock: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F172A',
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 56,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    paddingVertical: 0,
    includeFontPadding: false,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 14,
  },
  dropdownMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
    elevation: 3,
  },
  dropdownMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  dropdownMenuItemActive: {
    backgroundColor: '#EEF2FF',
  },
  docCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 6,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  iconActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconActionBtnView: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActionBtnEdit: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 999,
    gap: 8,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
