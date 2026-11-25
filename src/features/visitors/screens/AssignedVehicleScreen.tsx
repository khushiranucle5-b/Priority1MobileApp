import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { visitorService } from '../services/visitor.service';
import { AssignedGuardVehicle } from '../types/visitor.types';
import {
  Car,
  Shield,
  Gauge,
  Fuel,
  Info,
  Plus,
  Receipt,
  AlertCircle,
} from 'lucide-react-native';

export const AssignedVehicleScreen: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { guardId } = useGuardStore();

  const [vehicle, setVehicle] = useState<AssignedGuardVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const veh = await visitorService.getAssignedVehicle(guardId || 'guard-1');
      setVehicle(veh);
    } catch (e) {
      console.error('Failed to load assigned vehicle', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [guardId]);

  useEffect(() => {
    if (isFocused) {
      loadData();
    }
  }, [isFocused, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <ScreenLayout activeRoute="AssignedVehicleScreen">
        <PageHeader title="Assigned Vehicle" showBack={true} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout activeRoute="AssignedVehicleScreen">
      <PageHeader
        title="Assigned Vehicle"
        showBack={true}
      />

      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary[600]]} />}
        >
          {/* Role Scope Notice */}
          <View style={[styles.scopeNoticeBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
            <Info size={16} color="#2563EB" />
            <AppText size="xs" style={{ color: '#1E40AF', marginLeft: 8, flex: 1 }}>
              Assigned operational vehicle. Fleet allocations are managed by supervisors.
            </AppText>
          </View>

          {/* Assigned Vehicle Card */}
          {vehicle ? (
            <Card style={[styles.vehicleCard, { borderColor: colors.border }]}>
              {/* Header Plate & Status */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.plateBadge}>
                  <Car size={16} color="#1E293B" />
                  <AppText size="sm" weight="bold" style={styles.plateText}>
                    {vehicle.plateNumber}
                  </AppText>
                </View>

                <View style={styles.activeStatusTag}>
                  <View style={styles.pulsingDot} />
                  <AppText size="xs" weight="bold" style={{ color: '#15803D', marginLeft: 4 }}>
                    {vehicle.status.toUpperCase()}
                  </AppText>
                </View>
              </View>

              <Heading level="h3" style={styles.vehicleTitle}>
                {vehicle.vehicleName}
              </Heading>
              <AppText size="xs" weight="semibold" style={{ color: colors.textSecondary, marginTop: 2 }}>
                {vehicle.vehicleType} • Assigned to {vehicle.assignedGuardName}
              </AppText>

              {/* Quick Metrics Strip */}
              <View style={[styles.metricsStrip, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.sm }]}>
                <View style={styles.metricItem}>
                  <Gauge size={16} color={colors.primary[600]} />
                  <AppText size="xs" style={{ color: colors.textTertiary, marginTop: 4 }}>Odometer</AppText>
                  <AppText size="sm" weight="bold" style={{ color: colors.text }}>
                    {vehicle.currentOdometer.toLocaleString()} km
                  </AppText>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Fuel size={16} color="#D97706" />
                  <AppText size="xs" style={{ color: colors.textTertiary, marginTop: 4 }}>Fuel Level</AppText>
                  <AppText size="sm" weight="bold" style={{ color: '#D97706' }}>
                    {vehicle.fuelLevel} ({vehicle.fuelType})
                  </AppText>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Shield size={16} color="#16A34A" />
                  <AppText size="xs" style={{ color: colors.textTertiary, marginTop: 4 }}>Insurance</AppText>
                  <AppText size="sm" weight="bold" style={{ color: '#16A34A' }}>
                    {vehicle.insuranceExpiry}
                  </AppText>
                </View>
              </View>

              {/* Detail Rows */}
              <View style={styles.infoRow}>
                <AppText size="xs" style={{ color: colors.textTertiary, width: 100 }}>Site:</AppText>
                <AppText size="xs" weight="semibold" style={{ color: colors.text, flex: 1 }}>{vehicle.siteName}</AppText>
              </View>

              <View style={styles.infoRow}>
                <AppText size="xs" style={{ color: colors.textTertiary, width: 100 }}>PUC Expiry:</AppText>
                <AppText size="xs" style={{ color: colors.text, flex: 1 }}>{vehicle.pucExpiry}</AppText>
              </View>

              <View style={styles.infoRow}>
                <AppText size="xs" style={{ color: colors.textTertiary, width: 100 }}>Last Service:</AppText>
                <AppText size="xs" style={{ color: colors.text, flex: 1 }}>{vehicle.lastServiceDate || 'Recent'}</AppText>
              </View>
            </Card>
          ) : (
            <View style={styles.emptyWrap}>
              <AlertCircle size={40} color={colors.textTertiary} />
              <AppText size="base" weight="semibold" style={{ color: colors.text, marginTop: 10 }}>
                No Vehicle Assigned
              </AppText>
              <AppText size="xs" style={{ color: colors.textSecondary, marginTop: 4, textAlign: 'center' }}>
                No vehicle is currently assigned to you. Contact your supervisor for assignment.
              </AppText>
            </View>
          )}

          {/* Operational Expenses Quick Card */}
          <Card style={[styles.expenseInfoCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <View style={styles.expenseInfoRow}>
              <View style={[styles.expenseIconWrap, { backgroundColor: '#FEF3C7' }]}>
                <Receipt size={22} color="#B45309" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Heading level="h4" style={{ color: colors.text }}>
                  Vehicle Expenses
                </Heading>
                <AppText size="xs" style={{ color: colors.textSecondary, marginTop: 4, lineHeight: 18 }}>
                  Submit claims for fuel, toll charges, parking, or maintenance.
                </AppText>
              </View>
            </View>
          </Card>
        </ScrollView>

        {/* Floating Action Button (FAB) for CLAIM EXPENSE */}
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: colors.primary[600] }]}
          onPress={() =>
            navigation.navigate('ExpenseClaimForm', {
              preselectedVehicleId: vehicle?.id,
              preselectedVehicleName: vehicle?.vehicleName,
              preselectedPlate: vehicle?.plateNumber,
              preselectedCategory: 'Fuel and Mileage',
            })
          }
          activeOpacity={0.85}
          accessibilityLabel="Submit Expense Claim"
          accessibilityRole="button"
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          <AppText size="sm" weight="bold" style={styles.floatingButtonText}>
            Claim Expense
          </AppText>
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 95,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 54,
    borderRadius: 27,
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
  scopeNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  vehicleCard: {
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF08A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CA8A04',
    gap: 6,
  },
  plateText: {
    color: '#1E293B',
    letterSpacing: 1,
  },
  activeStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  vehicleTitle: {
    marginTop: 10,
    letterSpacing: 0.3,
  },
  metricsStrip: {
    flexDirection: 'row',
    padding: 12,
    marginTop: 12,
    marginBottom: 10,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  emptyWrap: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseInfoCard: {
    padding: 16,
    borderWidth: 1.5,
    marginTop: 2,
    marginBottom: 16,
  },
  expenseInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  expenseIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
