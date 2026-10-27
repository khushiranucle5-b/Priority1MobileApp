import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { visitorService } from '../services/visitor.service';
import { VisitorRecord, VisitorStatus } from '../types/visitor.types';
import {
  User,
  Building2,
  Phone,
  Mail,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  LogIn,
  QrCode,
  ShieldAlert,
  Tag,
  Home,
  Calendar,
  Hourglass,
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  Car,
  Edit2,
} from 'lucide-react-native';

export const VisitorDetailsScreen: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { visitorId } = route.params || {};
  const { guardName, guardId, assignedSite } = useGuardStore();

  const [visitor, setVisitor] = useState<VisitorRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadVisitor = async () => {
    if (!visitorId) return;
    setLoading(true);
    const data = await visitorService.getVisitorById(visitorId);
    setVisitor(data);
    setLoading(false);
  };

  useEffect(() => {
    loadVisitor();
  }, [visitorId]);

  const handleQuickCheckIn = async () => {
    if (!visitor) return;
    Alert.alert('Grant Entry (Time In)', `Confirm gate entry time-in for ${visitor.visitorName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Time In Now',
        onPress: async () => {
          setActionLoading(true);
          const res = await visitorService.quickCheckIn(visitor.id, {
            guardId: guardId || 'guard-1',
            guardName: guardName || 'Khushi Rani',
          });
          setActionLoading(false);
          if (res.success) {
            Alert.alert('Time-In Recorded', `${visitor.visitorName} is now on-site. Time-in logged.`);
            loadVisitor();
          } else {
            Alert.alert('Error', res.error || 'Failed to record time in.');
          }
        },
      },
    ]);
  };

  const handleSingleTapCheckOut = async () => {
    if (!visitor) return;
    Alert.alert('Record Exit (Time Out)', `Record gate exit time-out for ${visitor.visitorName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Time Out Now',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          const res = await visitorService.singleTapCheckOut(visitor.id, {
            guardId: guardId || 'guard-1',
            guardName: guardName || 'Khushi Rani',
          });
          setActionLoading(false);
          if (res.success) {
            Alert.alert('Time-Out Recorded', `${visitor.visitorName} departure logged successfully.`);
            loadVisitor();
          } else {
            Alert.alert('Error', res.error || 'Failed to record time out.');
          }
        },
      },
    ]);
  };

  const handleCall = (phoneNumber?: string) => {
    if (!phoneNumber) {
      Alert.alert('No Phone', 'No contact phone number is available.');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to initiate call on this device.');
    });
  };

  const formatTimeOnly = (isoString?: string) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFullDate = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const calculateStayDuration = (startIso?: string, endIso?: string) => {
    if (!startIso) return null;
    const start = new Date(startIso).getTime();
    const end = endIso ? new Date(endIso).getTime() : Date.now();
    if (isNaN(start) || isNaN(end) || end < start) return null;

    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours > 0) {
      return `${hours} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  const isOverstay = visitor ? visitorService.isVisitorOverstay(visitor) : false;

  if (loading) {
    return (
      <ScreenLayout activeRoute="VisitorDetailsScreen">
        <PageHeader title="Visitor Details" showBack={true} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      </ScreenLayout>
    );
  }

  if (!visitor) {
    return (
      <ScreenLayout activeRoute="VisitorDetailsScreen">
        <PageHeader title="Visitor Details" showBack={true} />
        <View style={styles.centerContainer}>
          <AppText size="base" style={{ color: colors.textSecondary }}>
            Visitor record not found.
          </AppText>
        </View>
      </ScreenLayout>
    );
  }

  const isOnSite = visitor.status === 'checked_in';
  const isCheckedOut = visitor.status === 'checked_out';
  const isScheduled = visitor.status === 'scheduled' || visitor.status === 'approved';

  return (
    <ScreenLayout activeRoute="VisitorDetailsScreen">
      <PageHeader
        title="Visitor Details"
        showBack={true}
        rightComponent={
          !isCheckedOut ? (
            <TouchableOpacity
              style={[styles.headerEditBtn, { borderColor: colors.primary[600], backgroundColor: colors.primary[50] }]}
              onPress={() => navigation.navigate('RegisterVisitor', { editVisitorId: visitor.id })}
              activeOpacity={0.7}
            >
              <Edit2 size={14} color={colors.primary[600]} />
              <AppText size="xs" weight="bold" style={{ color: colors.primary[600], marginLeft: 4 }}>
                Edit
              </AppText>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Overstay Banner if exceeded authorized hours */}
        {isOverstay && (
          <View style={styles.overstayBanner}>
            <AlertTriangle size={20} color="#DC2626" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppText size="sm" weight="bold" style={{ color: '#DC2626' }}>
                Overstay Alert
              </AppText>
              <AppText size="xs" style={{ color: '#991B1B' }}>
                Expected departure was {formatTimeOnly(visitor.expectedDeparture)}. Visitor has exceeded authorized time.
              </AppText>
            </View>
          </View>
        )}

        {/* Top Summary Card */}
        <Card style={[styles.card, { borderColor: colors.border }]}>
          <View style={styles.summaryTopRow}>
            <View style={{ flex: 1 }}>
              <AppText size="lg" weight="bold" style={{ color: colors.text }}>
                {visitor.visitorName}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
                <View style={[styles.categoryTag, { backgroundColor: colors.surfaceSecondary }]}>
                  <AppText size="xs" weight="bold" style={{ color: colors.primary[700] }}>
                    {visitor.category}
                  </AppText>
                </View>
                {visitor.unitNumber && (
                  <View style={[styles.unitTag, { backgroundColor: '#EEF2FF', marginLeft: 6 }]}>
                    <AppText size="xs" weight="bold" style={{ color: colors.primary[700] }}>
                      Unit {visitor.unitNumber}
                    </AppText>
                  </View>
                )}
                {visitor.vehiclePlateNumber && (
                  <View style={[styles.platePill, { backgroundColor: '#FEF9C3', borderColor: '#FDE047', marginLeft: 6 }]}>
                    <Car size={12} color="#854D0E" />
                    <AppText size="xs" weight="bold" style={{ color: '#854D0E', marginLeft: 4 }}>
                      {visitor.vehiclePlateNumber}
                    </AppText>
                  </View>
                )}
              </View>
            </View>

            
          </View>

          {/* Status Bar & Ref Number Row */}
          <View style={styles.statusRefRow}>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: isOnSite ? '#DCFCE7' : isCheckedOut ? '#F1F5F9' : '#FEF3C7',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isOnSite ? '#16A34A' : isCheckedOut ? '#64748B' : '#D97706',
                  },
                ]}
              />
              <AppText
                size="xs"
                weight="bold"
                style={{
                  color: isOnSite ? '#15803D' : isCheckedOut ? '#475569' : '#B45309',
                  letterSpacing: 0.4,
                  marginLeft: 6,
                }}
              >
                {isOnSite
                  ? 'On-Site'
                  : isCheckedOut
                  ? 'Checked Out'
                  : 'Scheduled'}
              </AppText>
            </View>

            <View style={[styles.refPill, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <AppText size="xs" weight="bold" style={{ color: colors.textSecondary }} numberOfLines={1}>
                Ref #{visitor.referenceNumber}
              </AppText>
            </View>
          </View>

          {/* Quick Action Button */}
          {isScheduled && (
            <View style={{ marginTop: 12 }}>
              <Button
                title={actionLoading ? 'Clocking In...' : 'Grant Entry'}
                onPress={handleQuickCheckIn}
                disabled={actionLoading}
                style={{ backgroundColor: '#16A34A', height: 48, width: '100%' }}
              />
            </View>
          )}

          {isOnSite && (
            <View style={{ marginTop: 12 }}>
              <Button
                title={actionLoading ? 'Clocking Out...' : 'Record Exit'}
                onPress={handleSingleTapCheckOut}
                disabled={actionLoading}
                style={{ backgroundColor: '#DC2626', height: 48, width: '100%' }}
              />
            </View>
          )}
        </Card>

        {/* Dedicated Gate Timing Card */}
        <Card style={[styles.card, { borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Clock size={18} color={colors.primary[600]} />
            <Heading level="h4" style={styles.sectionTitle}>
              Gate Timings
            </Heading>
          </View>

          <View style={styles.timingGrid}>
            {/* Time-In Box */}
            <View style={[styles.timingBox, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <View style={styles.timingBoxHeader}>
                <ArrowDownCircle size={18} color="#16A34A" />
                <AppText size="xs" weight="bold" style={{ color: '#15803D', marginLeft: 6 }}>
                  Entry Time
                </AppText>
              </View>
              <AppText size="base" weight="bold" style={{ color: '#14532D', marginTop: 6 }}>
                {visitor.actualCheckInAt ? formatTimeOnly(visitor.actualCheckInAt) : 'Pending'}
              </AppText>
              <AppText size="xs" style={{ color: '#166534', marginTop: 2 }}>
                {visitor.actualCheckInAt ? formatFullDate(visitor.actualCheckInAt) : 'Not entered'}
              </AppText>
            </View>

            {/* Time-Out Box */}
            <View
              style={[
                styles.timingBox,
                {
                  backgroundColor: isCheckedOut ? '#FEF2F2' : '#F8FAFC',
                  borderColor: isCheckedOut ? '#FECACA' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.timingBoxHeader}>
                <ArrowUpCircle size={18} color={isCheckedOut ? '#DC2626' : '#64748B'} />
                <AppText size="xs" weight="bold" style={{ color: isCheckedOut ? '#B91C1C' : '#475569', marginLeft: 6 }}>
                  Exit Time
                </AppText>
              </View>
              <AppText size="base" weight="bold" style={{ color: isCheckedOut ? '#991B1B' : '#334155', marginTop: 6 }}>
                {visitor.actualCheckOutAt ? formatTimeOnly(visitor.actualCheckOutAt) : isOnSite ? 'Inside' : 'Not Departed'}
              </AppText>
              <AppText size="xs" style={{ color: isCheckedOut ? '#B91C1C' : '#64748B', marginTop: 2 }}>
                {visitor.actualCheckOutAt ? formatFullDate(visitor.actualCheckOutAt) : isOnSite ? 'Active' : 'Pending'}
              </AppText>
            </View>
          </View>

          {/* Duration Bar (Clean - Expected Till removed) */}
          <View style={[styles.durationBar, { backgroundColor: colors.surfaceSecondary, borderRadius: borderRadius.sm }]}>
            <Hourglass size={16} color={colors.primary[600]} />
            <AppText size="xs" style={{ color: colors.textSecondary, marginLeft: 8 }}>
              Total Stay Duration:{' '}
            </AppText>
            <AppText size="xs" weight="bold" style={{ color: colors.text }}>
              {calculateStayDuration(visitor.actualCheckInAt, visitor.actualCheckOutAt) || (isOnSite ? 'Active on site' : '0m')}
            </AppText>
          </View>
        </Card>

        {/* Resident & Destination Unit Information Card */}
        <Card style={[styles.card, { borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Building2 size={18} color={colors.primary[600]} />
            <Heading level="h4" style={styles.sectionTitle}>
              Destination & Host
            </Heading>
          </View>

          <View style={styles.infoRow}>
            <AppText size="xs" style={{ color: colors.textTertiary, width: 110 }}>Unit:</AppText>
            <AppText size="xs" weight="bold" style={{ color: colors.primary[700], flex: 1 }}>
              {visitor.unitNumber ? `Unit ${visitor.unitNumber}` : 'Not Specified'}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText size="xs" style={{ color: colors.textTertiary, width: 110 }}>Host:</AppText>
            <AppText size="xs" weight="bold" style={{ color: colors.text, flex: 1 }}>
              {visitor.hostName}
            </AppText>
          </View>

          {visitor.hostPhone && (
            <View style={styles.infoRow}>
              <AppText size="xs" style={{ color: colors.textTertiary, width: 110 }}>Host Phone:</AppText>
              <AppText size="xs" weight="bold" style={{ color: colors.text, flex: 1 }}>
                {visitor.hostPhone}
              </AppText>
              <TouchableOpacity
                style={styles.callCircleBtn}
                onPress={() => handleCall(visitor.hostPhone)}
                activeOpacity={0.7}
              >
                <Phone size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.infoRow}>
            <AppText size="xs" style={{ color: colors.textTertiary, width: 110 }}>Purpose:</AppText>
            <AppText size="xs" style={{ color: colors.text, flex: 1 }}>
              {visitor.purpose || 'Visit'}
            </AppText>
          </View>

          <View style={styles.infoRow}>
            <AppText size="xs" style={{ color: colors.textTertiary, width: 110 }}>Site:</AppText>
            <AppText size="xs" style={{ color: colors.text, flex: 1 }}>
              {visitor.siteName || 'Security Gate'}
            </AppText>
          </View>
        </Card>

        {/* Vehicle Information Card */}
        <Card style={[styles.card, { borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Car size={18} color={colors.primary[600]} />
            <Heading level="h4" style={styles.sectionTitle}>
              Vehicle Details
            </Heading>
            <View
              style={[
                styles.vehicleStatusBadge,
                {
                  backgroundColor: visitor.hasVehicle ? '#DCFCE7' : colors.surfaceSecondary,
                  borderColor: visitor.hasVehicle ? '#86EFAC' : colors.border,
                },
              ]}
            >
              <AppText
                size="xs"
                weight="bold"
                style={{ color: visitor.hasVehicle ? '#15803D' : colors.textSecondary }}
              >
                {visitor.hasVehicle ? 'Vehicle Logged' : 'No Vehicle'}
              </AppText>
            </View>
          </View>

          {visitor.hasVehicle ? (
            <View>
              <View style={styles.infoRow}>
                <AppText size="xs" style={{ color: colors.textTertiary, width: 110 }}>
                  License Plate:
                </AppText>
                <View style={[styles.detailsPlateBadge, { backgroundColor: '#FEF9C3', borderColor: '#CA8A04' }]}>
                  <View style={styles.detailsPlateCountry}>
                    <AppText size="xs" weight="bold" style={{ color: '#1E3A8A', fontSize: 10 }}>
                      IND
                    </AppText>
                  </View>
                  <AppText size="sm" weight="bold" style={{ color: '#0F172A', letterSpacing: 1.2, marginLeft: 6 }}>
                    {visitor.vehiclePlateNumber || 'Not Specified'}
                  </AppText>
                </View>
              </View>

              <View style={[styles.infoRow, { marginTop: 4 }]}>
                <AppText size="xs" style={{ color: colors.textTertiary, width: 110 }}>
                  Vehicle Type:
                </AppText>
                <AppText size="xs" weight="bold" style={{ color: colors.text, flex: 1 }}>
                  {visitor.vehicleType || 'Car / SUV'}
                </AppText>
              </View>
            </View>
          ) : (
            <View style={styles.noVehicleRow}>
              <AppText size="xs" style={{ color: colors.textSecondary }}>
                Visitor arrived without a vehicle.
              </AppText>
            </View>
          )}
        </Card>

        {/* Visitor Contact & ID Proof Verification */}
        <Card style={[styles.card, { borderColor: colors.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Shield size={18} color={colors.primary[600]} />
            <Heading level="h4" style={styles.sectionTitle}>
              Identity & ID Proof
            </Heading>
          </View>

          <View style={styles.infoRow}>
            <AppText size="xs" style={{ color: colors.textTertiary, width: 110 }}>Mobile:</AppText>
            <AppText size="xs" weight="bold" style={{ color: colors.primary[700], flex: 1 }}>
              {visitor.visitorPhone}
            </AppText>
            <TouchableOpacity
              style={styles.callCircleBtn}
              onPress={() => handleCall(visitor.visitorPhone)}
              activeOpacity={0.7}
            >
              <Phone size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          

          <View style={styles.infoRow}>
            <AppText size="xs" style={{ color: colors.textTertiary, width: 110 }}>ID Type:</AppText>
            <AppText size="xs" weight="semibold" style={{ color: colors.text, flex: 1 }}>
              {visitor.idType === 'AADHAAR' ? 'National ID' : visitor.idType || 'National ID'}
            </AppText>
          </View>

          {visitor.idNumber ? (
            <View style={styles.infoRow}>
              <AppText size="xs" style={{ color: colors.textTertiary, width: 110 }}>ID Number:</AppText>
              <AppText size="xs" weight="bold" style={{ color: colors.text, flex: 1 }}>
                {visitor.idNumber}
              </AppText>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <AppText size="xs" style={{ color: colors.textTertiary, width: 110 }}>Escort:</AppText>
            <AppText
              size="xs"
              weight="bold"
              style={{ color: visitor.escortRequired ? '#DC2626' : '#15803D', flex: 1 }}
            >
              {visitor.escortRequired ? 'Mandatory Escort' : 'Standard Access'}
            </AppText>
          </View>

          {/* Captured ID Photo */}
          {visitor.idPhotoUri ? (
            <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
              <AppText size="xs" weight="bold" style={{ color: colors.text, marginBottom: 8 }}>
                ID Photo:
              </AppText>
              <Image source={{ uri: visitor.idPhotoUri }} style={styles.capturedPhotoLarge} resizeMode="cover" />
            </View>
          ) : null}
        </Card>

        {/* Denial Audit Details if Refused */}
        {visitor.deniedEntryBy && (
          <Card style={[styles.card, { borderColor: '#EF4444', backgroundColor: '#FEF2F2' }]}>
            <View style={styles.sectionHeaderRow}>
              <ShieldAlert size={18} color="#DC2626" />
              <Heading level="h4" style={[styles.sectionTitle, { color: '#DC2626' }]}>
                Entry Denied
              </Heading>
            </View>
            <AppText size="xs" weight="bold" style={{ color: '#B91C1C' }}>
              Reason: {visitor.deniedEntryBy.reason}
            </AppText>
            {visitor.deniedEntryBy.comments && (
              <AppText size="xs" style={{ color: '#7F1D1D', marginTop: 4 }}>
                Remarks: {visitor.deniedEntryBy.comments}
              </AppText>
            )}
            <AppText size="xs" style={{ color: '#991B1B', marginTop: 6 }}>
              Logged by {visitor.deniedEntryBy.guardName} at{' '}
              {new Date(visitor.deniedEntryBy.at).toLocaleString()}
            </AppText>
          </Card>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  overstayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    padding: 14,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  unitTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    flexShrink: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    marginLeft: 8,
    flex: 1,
  },
  timingGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  timingBox: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  timingBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  callCircleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  capturedPhotoLarge: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  platePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  vehicleStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  detailsPlateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  detailsPlateCountry: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  noVehicleRow: {
    paddingVertical: 6,
  },
  headerEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
});
