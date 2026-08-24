import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../../components/Card';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { getTable, DBAsset } from '../../../services/db';

export const EquipmentCard: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { guardId, guardName, guardEmail } = useGuardStore();

  const [assets, setAssets] = useState<DBAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignedAssets();
  }, [guardId, guardName, guardEmail]);

  const loadAssignedAssets = async () => {
    try {
      const allAssets = await getTable<DBAsset>('assets');
      const guardAssets = (allAssets || []).filter((a) => {
        if (!a) return false;
        const matchesGuardId = guardId && a.assignedGuardId && a.assignedGuardId === guardId;
        const matchesGuardName = guardName && a.assignedTo && a.assignedTo.toLowerCase() === guardName.toLowerCase();
        const matchesGuardEmail = guardEmail && a.assignedGuardEmail && a.assignedGuardEmail.toLowerCase() === guardEmail.toLowerCase();
        const isDefaultGuard = !a.assignedGuardId || a.assignedGuardId === 'guard-1' || a.assignedTo === 'Khushi Rani';
        return matchesGuardId || matchesGuardName || matchesGuardEmail || isDefaultGuard;
      });

      setAssets(guardAssets);
    } catch (err) {
      console.error('Failed to load assets for equipment card:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fallback defaults if DB load is empty
  const defaultEquipment = ['Walkie Talkie', 'RFID Card', 'Baton', 'Torch', 'Helmet'];
  const displayItems = assets.length > 0 ? assets.map(a => a.name) : defaultEquipment;

  return (
    <Card variant="outlined" style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.lg }]}>
      <View style={styles.headerRow}>
        <Heading level="h3" color="primary" style={styles.title}>ASSIGNED EQUIPMENT</Heading>
        
      </View>
      
      <View style={styles.divider} />

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      ) : (
        <View style={styles.grid}>
          {displayItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Home', { screen: 'Assets' })}
              style={[styles.item, { backgroundColor: '#F1F5F9', borderRadius: borderRadius.md }]}
            >
              <AppText style={styles.itemText}>{item}</AppText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  viewAssetsLink: {
    color: '#2563EB',
    fontSize: 15.5,
    fontWeight: '700',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#E2E8F0',
    marginVertical: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  loadingBox: {
    padding: 12,
    alignItems: 'center',
  },
});
