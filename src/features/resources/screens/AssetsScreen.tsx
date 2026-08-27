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
import { FilterBottomSheet } from '../../../components/FilterBottomSheet';
import { useNavigation } from '@react-navigation/native';

export const AssetsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { guardId, guardName, guardEmail, assignedSite } = useGuardStore();

  const [assets, setAssets] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    loadGuardAssets();
  }, [guardId, guardName, guardEmail]);

  const loadGuardAssets = async () => {
    setLoading(true);
    try {
      const allAssets = await getTable<DBAsset>('assets');
      
      // Filter assets assigned specifically to the logged in guard
      const guardAssets = (allAssets || []).filter((a) => {
        const gId = (guardId || '').toLowerCase().trim();
        const gName = (guardName || '').toLowerCase().trim();
        const gEmail = (guardEmail || '').toLowerCase().trim();

        const aGuardId = (a.assignedGuardId || '').toLowerCase().trim();
        const aTo = (a.assignedTo || '').toLowerCase().trim();
        const aEmail = (a.assignedGuardEmail || '').toLowerCase().trim();

        const matchesGuardId = !!(gId && aGuardId && (gId === aGuardId || (gId.includes('john') && (aGuardId === 'g-1001' || aGuardId === 'guard-2'))));
        const matchesGuardName = !!(gName && aTo && (gName === aTo || aTo.includes(gName) || gName.includes(aTo)));
        const matchesGuardEmail = !!(gEmail && aEmail && gEmail === aEmail);

        if (matchesGuardId || matchesGuardName || matchesGuardEmail) {
          return true;
        }

        // If current logged-in user is default guard (Khushi Rani / guard-1 or unset), show default assets
        const isCurrentDefaultGuard = !guardId || guardId === 'guard-1' || gName === 'khushi rani';
        const isAssetDefaultGuard = !a.assignedGuardId || a.assignedGuardId === 'guard-1' || aTo === 'khushi rani';

        return isCurrentDefaultGuard && isAssetDefaultGuard;
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
    const matchesCategory = categoryFilter === 'All' || typeStr.includes((categoryFilter || '').toLowerCase());

    return matchesSearch && matchesCategory;
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
        
        {/* Top Search & Filter Row */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchBox}>
            <View style={{ marginRight: 8 }}>
              <NavIcon name="search" size={18} color="#64748B" />
            </View>
            <TextInput
              placeholder="Search assets by name, code, serial..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <AppText size="xs" weight="bold" style={{ color: '#64748B' }}>✕</AppText>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Inline Dropdown Trigger Button */}
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setDropdownOpen(!dropdownOpen)}
            activeOpacity={0.8}
          >
            <AppText size="sm" weight="bold" style={{ color: '#475569', marginRight: 4 }}>
              {categoryFilter === 'All' ? 'Filter: All' : `Filter: ${categoryFilter}`}
            </AppText>
            <AppText size="xs" color="secondary">{dropdownOpen ? '▲' : '▼'}</AppText>
          </TouchableOpacity>
        </View>

        {/* Category Filter Bottom Sheet */}
        <FilterBottomSheet
          visible={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
          title="Select Category"
          options={[
            { label: 'All Categories', value: 'All' },
            { label: 'Communication', value: 'Communication' },
            { label: 'Security Gear', value: 'Security Gear' },
            { label: 'Uniform', value: 'Uniform' },
            { label: 'Electronics', value: 'Electronics' },
            { label: 'Safety Equipment', value: 'Safety Equipment' },
          ]}
          selectedValue={categoryFilter}
          onSelect={(val) => setCategoryFilter(val)}
        />

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
                      <Heading level="h3" color="primary">{asset.name}</Heading>
                      {asset.assetCode ? (
                        <AppText size="xs" color="secondary" weight="semibold" style={{ marginTop: 2 }}>
                          ASSET ID: {asset.assetCode}
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

                  {/* Card Footer Touch Action */}
                  <View style={styles.cardFooter}>
                    <AppText size="sm" color="secondary">
                      Assigned by: <AppText size="sm" weight="semibold" color="primary">{asset.assignedBy || 'Jane Smith (Supervisor)'}</AppText>
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
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  searchBox: {
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
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 6,
    marginBottom: 16,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  dropdownMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 6,
    minHeight: 44,
    justifyContent: 'center',
  },
  dropdownMenuItemActive: {
    backgroundColor: '#EEF2FF',
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
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
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
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
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
});
