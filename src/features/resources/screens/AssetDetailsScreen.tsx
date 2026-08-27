import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useGuardStore } from '../../../store/useGuardStore';
import { useTheme } from '../../../providers/ThemeProvider';
import { getTable, DBAsset, updateRow } from '../../../services/db';
import { NavIcon } from '../../../components/NavIcon';

export const AssetDetailsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { guardName, guardId } = useGuardStore();

  const assetId = route.params?.assetId || 'ast-101';
  const [asset, setAsset] = useState<DBAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAsset();
  }, [assetId]);

  const loadAsset = async () => {
    setLoading(true);
    try {
      const allAssets = await getTable<DBAsset>('assets');
      const found = (allAssets || []).find((a) => a.id === assetId) || allAssets[0] || null;
      setAsset(found);
    } catch (err) {
      console.error('Failed to load asset detail', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!asset) return;
    try {
      const updated = await updateRow<DBAsset>('assets', asset.id, { status: 'Assigned' });
      if (updated) {
        setAsset((prev) => (prev ? { ...prev, status: 'Assigned' } : null));
      }
    } catch (err) {
      console.error('Failed to confirm asset receipt', err);
    }
  };

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

  if (loading || !asset) {
    return (
      <ScreenLayout activeRoute="Assets">
        <PageHeader title="Asset Detail" showBack />
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <AppText size="sm" color="secondary" style={{ marginTop: 10 }}>Loading asset details...</AppText>
        </View>
      </ScreenLayout>
    );
  }

  const statusColors = getStatusBadgeStyle(asset.status);
  const conditionColors = getConditionBadgeStyle(asset.condition);
  const typeColors = getTypeBadgeStyle(asset.type);

  return (
    <ScreenLayout activeRoute="Assets">
      <PageHeader title="Asset Detail" showBack />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Main Asset Header Card */}
        <Card style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
              <AppText size="xs" weight="bold" style={{ color: statusColors.text }}>
                ● {asset.status}
              </AppText>
            </View>

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

          <Heading level="h3" color="primary" style={{ marginTop: 10 }}>
            {asset.name}
          </Heading>

          {asset.assetCode ? (
            <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
              Asset ID: {asset.assetCode}
            </AppText>
          ) : null}
        </Card>

        {/* ASSET INFORMATION CARD */}
        <Card style={styles.infoCard}>
          <AppText size="sm" weight="bold" style={styles.cardSectionHeading}>
            ASSET INFORMATION
          </AppText>

          <View style={styles.dividerLine} />

          <View style={styles.gridContainer}>
            {/* Row 1: Asset Code & Serial Number */}
            <View style={styles.gridRow}>
              {asset.assetCode ? (
                <View style={styles.gridCol}>
                  <AppText size="sm" color="secondary">Asset Code</AppText>
                  <AppText size="base" weight="bold" color="primary" style={{ marginTop: 4 }}>
                    {asset.assetCode}
                  </AppText>
                </View>
              ) : null}

              {asset.serialNumber ? (
                <View style={styles.gridCol}>
                  <AppText size="sm" color="secondary">Serial Number</AppText>
                  <AppText size="base" weight="bold" color="primary" style={{ marginTop: 4 }}>
                    {asset.serialNumber}
                  </AppText>
                </View>
              ) : null}
            </View>

            {/* Row 2: Category & Condition */}
            <View style={styles.gridRow}>
              <View style={styles.gridCol}>
                <AppText size="sm" color="secondary">Category / Type</AppText>
                <AppText size="base" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {asset.type}
                </AppText>
              </View>

              {asset.condition ? (
                <View style={styles.gridCol}>
                  <AppText size="sm" color="secondary">Condition</AppText>
                  <AppText size="base" weight="bold" style={{ color: conditionColors.text, marginTop: 4 }}>
                    {asset.condition}
                  </AppText>
                </View>
              ) : null}
            </View>

            {/* Row 3: Assigned Site & Assigned Date */}
            <View style={styles.gridRow}>
              {asset.site ? (
                <View style={styles.gridCol}>
                  <AppText size="sm" color="secondary">Assigned Site</AppText>
                  <AppText size="base" weight="bold" color="primary" style={{ marginTop: 4 }}>
                    {asset.site}
                  </AppText>
                </View>
              ) : null}

              {asset.assignedDate ? (
                <View style={styles.gridCol}>
                  <AppText size="sm" color="secondary">Assigned Date</AppText>
                  <AppText size="base" weight="bold" color="primary" style={{ marginTop: 4 }}>
                    {asset.assignedDate}
                  </AppText>
                </View>
              ) : null}
            </View>

            {/* Row 4: Quantity & Assigned By */}
            <View style={styles.gridRow}>
              {asset.quantity && asset.quantity > 1 ? (
                <View style={styles.gridCol}>
                  <AppText size="sm" color="secondary">Quantity</AppText>
                  <AppText size="base" weight="bold" color="primary" style={{ marginTop: 4 }}>
                    {asset.quantity} units
                  </AppText>
                </View>
              ) : null}

              <View style={styles.gridCol}>
                <AppText size="sm" color="secondary">Assigned By</AppText>
                <AppText size="base" weight="bold" color="primary" style={{ marginTop: 4 }}>
                  {asset.assignedBy || 'Jane Smith (Supervisor)'}
                </AppText>
              </View>
            </View>
          </View>
        </Card>

        {/* End of Asset Details */}

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBlock: {
    marginBottom: 4,
  },
  mainCard: {
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  infoCard: {
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  notesCard: {
    padding: 20,
  },
  cardSectionHeading: {
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  gridContainer: {
    gap: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridCol: {
    width: '48%',
  },
  actionBlock: {
    gap: 10,
    marginTop: 4,
  },
});
