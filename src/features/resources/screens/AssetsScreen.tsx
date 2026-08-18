import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { getTable, DBAsset, updateRow } from '../../../services/db';
import { NavIcon } from '../../../components/NavIcon';
import { useNavigation } from '@react-navigation/native';

export const AssetsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { guardId, guardName, guardEmail, assignedSite } = useGuardStore();

  const [assets, setAssets] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    loadGuardAssets();
  }, [guardId, guardName, guardEmail]);

  const loadGuardAssets = async () => {
    setLoading(true);
    try {
      const allAssets = await getTable<DBAsset>('assets');
      
      // Filter assets assigned specifically to the logged in guard
      const guardAssets = (allAssets || []).filter((a) => {
        if (!a) return false;
        const matchesGuardId = guardId && a.assignedGuardId && a.assignedGuardId === guardId;
        const matchesGuardName = guardName && a.assignedTo && a.assignedTo.toLowerCase() === guardName.toLowerCase();
        const matchesGuardEmail = guardEmail && a.assignedGuardEmail && a.assignedGuardEmail.toLowerCase() === guardEmail.toLowerCase();
        
        // If system default dataset, return items assigned to default guard identity
        const isDefaultGuard = !a.assignedGuardId || a.assignedGuardId === 'guard-1' || a.assignedTo === 'Khushi Rani';
        
        return matchesGuardId || matchesGuardName || matchesGuardEmail || isDefaultGuard;
      });

      setAssets(guardAssets);
    } catch (error) {
      console.error('Failed to load guard assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceipt = async (asset: DBAsset) => {
    try {
      const updated = await updateRow<DBAsset>('assets', asset.id, { status: 'Assigned' });
      if (updated) {
        setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, status: 'Assigned' } : a)));
      }
    } catch (err) {
      console.error('Failed to update asset status', err);
    }
  };

  const filteredAssets = assets.filter((a) => {
    const q = (searchQuery || '').toLowerCase().trim();
    const nameStr = (a.name || '').toLowerCase();
    const codeStr = (a.assetCode || '').toLowerCase();
    const serialStr = (a.serialNumber || '').toLowerCase();
    const typeStr = (a.type || '').toLowerCase();

    const matchesSearch = !q || nameStr.includes(q) || codeStr.includes(q) || serialStr.includes(q) || typeStr.includes(q);
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || typeStr.includes((categoryFilter || '').toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Assigned':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'Pending Verification':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Returned':
        return { bg: '#F1F5F9', text: '#64748B' };
      default:
        return { bg: '#EEF2FF', text: '#4F46E5' };
    }
  };

  const getConditionBadgeStyle = (cond?: string) => {
    switch (cond) {
      case 'Excellent':
        return { bg: '#ECFDF5', text: '#047857' };
      case 'Good':
        return { bg: '#F0FDF4', text: '#15803D' };
      case 'Fair':
        return { bg: '#FEFCE8', text: '#CA8A04' };
      case 'Requires Inspection':
      default:
        return { bg: '#FEE2E2', text: '#DC2626' };
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Communication':
        return { bg: '#EEF2FF', text: '#4F46E5' };
      case 'Security Gear':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Uniform':
        return { bg: '#E0E7FF', text: '#3730A3' };
      case 'Electronics':
        return { bg: '#F0F9FF', text: '#0284C7' };
      case 'Safety Equipment':
      default:
        return { bg: '#ECFDF5', text: '#059669' };
    }
  };

  return (
    <ScreenLayout activeRoute="Assets">
      <PageHeader title="Assigned Assets" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Mobile Search Bar */}
        <View style={styles.searchBox}>
          <View style={{ marginRight: 8, width: 18, alignItems: 'center' }}>
            <NavIcon name="search" size={16} color="#64748B" />
          </View>
          <TextInput
            placeholder="Search assets by name, code, serial..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#94A3B8"
          />
        </View>

        {/* Dropdown Filters Row */}
        <View style={styles.dropdownRow}>
          <TouchableOpacity
            style={styles.dropdownPicker}
            onPress={() => setIsStatusModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <AppText size="xs" color="secondary">Status</AppText>
              <AppText size="sm" weight="bold" color="primary" numberOfLines={1}>
                {statusFilter === 'All' ? 'All Statuses' : statusFilter}
              </AppText>
            </View>
            <AppText size="xs" color="secondary" style={{ marginLeft: 6 }}>▼</AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dropdownPicker}
            onPress={() => setIsCategoryModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <AppText size="xs" color="secondary">Category</AppText>
              <AppText size="sm" weight="bold" color="primary" numberOfLines={1}>
                {categoryFilter === 'All' ? 'All Categories' : categoryFilter}
              </AppText>
            </View>
            <AppText size="xs" color="secondary" style={{ marginLeft: 6 }}>▼</AppText>
          </TouchableOpacity>
        </View>

        <Heading level="h4" style={styles.sectionTitle}>
          My Assigned Equipment ({filteredAssets.length})
        </Heading>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <AppText size="sm" color="secondary" style={{ marginTop: 8 }}>Loading assigned assets...</AppText>
          </View>
        ) : filteredAssets.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <NavIcon name="assets" size={32} color="#94A3B8" />
            <AppText size="sm" color="secondary" style={{ marginTop: 10, textAlign: 'center' }}>
              No assets found matching the search or filter criteria.
            </AppText>
          </Card>
        ) : (
          filteredAssets.map((asset) => {
            const statusColors = getStatusBadgeStyle(asset.status);
            const conditionColors = getConditionBadgeStyle(asset.condition);
            const typeColors = getTypeBadgeStyle(asset.type);

            return (
              <Card key={asset.id} style={styles.assetCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('AssetDetails', { assetId: asset.id })}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Heading level="h4" color="primary">{asset.name}</Heading>
                      {asset.assetCode ? (
                        <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                          Asset ID: {asset.assetCode}
                        </AppText>
                      ) : null}
                    </View>

                    <View style={styles.badgeColumn}>
                      <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
                        <AppText size="xs" weight="bold" style={{ color: statusColors.text }}>
                          ● {asset.status}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Badges Row */}
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: typeColors.bg }]}>
                      <AppText size="xs" weight="bold" style={{ color: typeColors.text }}>
                        {asset.type}
                      </AppText>
                    </View>

                    {asset.condition ? (
                      <View style={[styles.badge, { backgroundColor: conditionColors.bg }]}>
                        <AppText size="xs" weight="bold" style={{ color: conditionColors.text }}>
                          {asset.condition}
                        </AppText>
                      </View>
                    ) : null}
                  </View>

                  {/* Metadata Rows (Hiding null/undefined fields) */}
                  <View style={styles.metaList}>
                    {asset.serialNumber ? (
                      <AppText size="xs" color="secondary">
                        S/N: <AppText size="xs" weight="semibold" color="primary">{asset.serialNumber}</AppText>
                      </AppText>
                    ) : null}

                    {asset.site ? (
                      <AppText size="xs" color="secondary">
                        Site: <AppText size="xs" weight="semibold" color="primary">{asset.site}</AppText>
                      </AppText>
                    ) : null}

                    {asset.assignedDate ? (
                      <AppText size="xs" color="secondary">
                        Assigned: <AppText size="xs" weight="semibold" color="primary">{asset.assignedDate}</AppText>
                      </AppText>
                    ) : null}

                    {asset.quantity && asset.quantity > 1 ? (
                      <AppText size="xs" color="secondary">
                        Qty: <AppText size="xs" weight="semibold" color="primary">{asset.quantity} units</AppText>
                      </AppText>
                    ) : null}
                  </View>

                  {/* Card Footer Touch Action */}
                  <View style={styles.cardFooter}>
                    <AppText size="xs" color="secondary">
                      Assigned to: {asset.assignedTo || guardName || 'Khushi Rani'}
                    </AppText>

                    <TouchableOpacity
                      style={styles.viewIconButton}
                      onPress={() => navigation.navigate('AssetDetails', { assetId: asset.id })}
                      activeOpacity={0.7}
                    >
                      <NavIcon name="eye" size={18} color="#4F46E5" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Card>
            );
          })
        )}

      </ScrollView>

      {/* STATUS PICKER MODAL DROPDOWN */}
      <Modal
        visible={isStatusModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsStatusModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsStatusModalOpen(false)}
        >
          <View style={styles.pickerSheet}>
            <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>Select Status</Heading>
            {['All', 'Assigned', 'Pending Verification', 'Returned'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.pickerOption,
                  statusFilter === st && { backgroundColor: '#EEF2FF' },
                ]}
                onPress={() => {
                  setStatusFilter(st);
                  setIsStatusModalOpen(false);
                }}
              >
                <AppText
                  size="sm"
                  weight={statusFilter === st ? 'bold' : 'regular'}
                  color={statusFilter === st ? 'primary' : 'secondary'}
                >
                  {st === 'All' ? 'All Statuses' : st}
                </AppText>
                {statusFilter === st && <AppText size="sm" color="primary">✓</AppText>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CATEGORY PICKER MODAL DROPDOWN */}
      <Modal
        visible={isCategoryModalOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setIsCategoryModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsCategoryModalOpen(false)}
        >
          <View style={styles.pickerSheet}>
            <Heading level="h4" color="primary" style={{ marginBottom: 12 }}>Select Category</Heading>
            {['All', 'Communication', 'Security Gear', 'Uniform', 'Electronics', 'Safety Equipment'].map((tp) => (
              <TouchableOpacity
                key={tp}
                style={[
                  styles.pickerOption,
                  categoryFilter === tp && { backgroundColor: '#EEF2FF' },
                ]}
                onPress={() => {
                  setCategoryFilter(tp);
                  setIsCategoryModalOpen(false);
                }}
              >
                <AppText
                  size="sm"
                  weight={categoryFilter === tp ? 'bold' : 'regular'}
                  color={categoryFilter === tp ? 'primary' : 'secondary'}
                >
                  {tp === 'All' ? 'All Categories' : tp}
                </AppText>
                {categoryFilter === tp && <AppText size="sm" color="primary">✓</AppText>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* End of Pickers */}
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
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  dropdownPicker: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 56,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
  },
  assetCard: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeColumn: {
    alignItems: 'flex-end',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  metaList: {
    marginTop: 10,
    gap: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 12,
  },
  viewIconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 12,
    paddingBottom: 24,
  },
  modalMainCard: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metaItem: {
    width: '50%',
  },
  detailSectionCard: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalActions: {
    gap: 10,
    marginTop: 8,
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: '100%',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
});
