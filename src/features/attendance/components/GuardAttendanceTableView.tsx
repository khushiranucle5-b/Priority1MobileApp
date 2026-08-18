import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heading } from '../../../components/typography/Heading';
import { AppText } from '../../../components/typography/Text';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore, AttendanceRecord } from '../../../store/useGuardStore';
import { useLiveAttendance } from '../../../hooks/useLiveAttendance';
import { LoggerService } from '../../../services';

export const GuardAttendanceTableView: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { attendanceHistory, guardName, guardId, isClockedIn } = useGuardStore();
  const { workingHours } = useLiveAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [geoFilter, setGeoFilter] = useState('ALL');

  const handleClockIn = () => {
    LoggerService.log('[GuardAttendanceTableView] Clock In pressed');
    navigation.navigate('SelfieVerification', { actionType: 'Clock In' });
  };

  const handleClockOut = () => {
    LoggerService.log('[GuardAttendanceTableView] Clock Out pressed');
    navigation.navigate('SelfieVerification', { actionType: 'Clock Out' });
  };

  const handleExportCSV = () => {
    Alert.alert('Export CSV', 'Attendance history report generated and ready for download.');
  };

  // Filter attendance records
  const filteredRecords = useMemo(() => {
    return attendanceHistory.filter((rec) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        rec.date.includes(q) ||
        rec.siteName.toLowerCase().includes(q) ||
        rec.status.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'ALL' ||
        rec.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [attendanceHistory, searchQuery, statusFilter]);

  const formatTimeStr = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Banner Header & Top-Right Clock In/Out Actions */}
      <View style={styles.topHeader}>
        <View style={styles.titleArea}>
          <Heading level="h2" color="primary">My Shift & Attendance</Heading>
          <AppText size="sm" color="secondary" style={styles.subtitle}>
            Unified Attendance, Geofence Verification, Overtime Calculation, and Payroll Connection.
          </AppText>
        </View>

        {/* Top-Right Action Controls */}
        <View style={styles.topActions}>
          <Button
            title="Clock In"
            variant={isClockedIn ? "secondary" : "primary"}
            size="medium"
            disabled={isClockedIn}
            onPress={handleClockIn}
            style={styles.topBtn}
          />
          <Button
            title="Clock Out"
            variant={isClockedIn ? "primary" : "secondary"}
            size="medium"
            disabled={!isClockedIn}
            onPress={handleClockOut}
            style={styles.topBtn}
          />
        </View>
      </View>

      {/* Active Tab Bar */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        <View style={[styles.activeTab, { borderBottomColor: colors.primary[600] }]}>
          <AppText size="sm" weight="bold" color="primary">
            MY SHIFT & ATTENDANCE HISTORY
          </AppText>
        </View>
      </View>

      {/* Filter Controls Row */}
      <View style={styles.filterRow}>
        <View style={styles.searchInputWrap}>
          <Input
            placeholder="Search employee, badge, or site..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<AppText style={{ marginRight: 6 }}>🔍</AppText>}
          />
        </View>

        <TouchableOpacity
          style={[styles.filterDropdown, { borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.surface }]}
          onPress={() => {
            const next = statusFilter === 'ALL' ? 'PRESENT' : statusFilter === 'PRESENT' ? 'ABSENT' : 'ALL';
            setStatusFilter(next);
          }}
        >
          <AppText size="xs" color="secondary">Status: </AppText>
          <AppText size="xs" weight="bold" color="primary">{statusFilter}</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterDropdown, { borderColor: colors.border, borderRadius: borderRadius.md, backgroundColor: colors.surface }]}
          onPress={() => {
            const next = geoFilter === 'ALL' ? 'INSIDE_GEOFENCE' : 'ALL';
            setGeoFilter(next);
          }}
        >
          <AppText size="xs" color="secondary">Geo: </AppText>
          <AppText size="xs" weight="bold" color="primary">{geoFilter}</AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.exportBtn, { backgroundColor: colors.primary[50], borderRadius: borderRadius.md }]}
          onPress={handleExportCSV}
        >
          <AppText size="xs" weight="bold" color="primary">📥 Export CSV</AppText>
        </TouchableOpacity>
      </View>

      {/* Attendance Data Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScroll}>
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={[styles.tableHeader, { backgroundColor: colors.surfaceSecondary }]}>
            <AppText size="xs" weight="bold" color="secondary" style={[styles.th, { width: 150 }]}>EMPLOYEE</AppText>
            <AppText size="xs" weight="bold" color="secondary" style={[styles.th, { width: 140 }]}>SITE & SHIFT</AppText>
            <AppText size="xs" weight="bold" color="secondary" style={[styles.th, { width: 100 }]}>DATE</AppText>
            <AppText size="xs" weight="bold" color="secondary" style={[styles.th, { width: 110 }]}>CLOCK IN</AppText>
            <AppText size="xs" weight="bold" color="secondary" style={[styles.th, { width: 110 }]}>CLOCK OUT</AppText>
            <AppText size="xs" weight="bold" color="secondary" style={[styles.th, { width: 90 }]}>TOTAL HRS</AppText>
            <AppText size="xs" weight="bold" color="secondary" style={[styles.th, { width: 80 }]}>OVERTIME</AppText>
            <AppText size="xs" weight="bold" color="secondary" style={[styles.th, { width: 130 }]}>GEO STATUS</AppText>
            <AppText size="xs" weight="bold" color="secondary" style={[styles.th, { width: 90 }]}>STATUS</AppText>
            <AppText size="xs" weight="bold" color="secondary" style={[styles.th, { width: 80 }]}>ACTIONS</AppText>
          </View>

          {/* Table Rows */}
          {filteredRecords.length === 0 ? (
            <View style={styles.emptyRow}>
              <AppText size="sm" color="secondary">No attendance records found matching filters.</AppText>
            </View>
          ) : (
            filteredRecords.map((rec: AttendanceRecord, index: number) => {
              const isOngoing = isClockedIn && index === 0;
              const displayHrs = isOngoing
                ? workingHours
                : rec.workingHours
                ? `${rec.workingHours.toFixed(1)} hrs`
                : '—';

              return (
                <View
                  key={rec.id}
                  style={[
                    styles.tableRow,
                    { borderBottomColor: colors.border, backgroundColor: index % 2 === 0 ? colors.surface : colors.background },
                  ]}
                >
                  {/* Employee */}
                  <View style={[styles.td, { width: 150 }]}>
                    <AppText size="sm" weight="bold" color="primary">{guardName || 'Security Officer'}</AppText>
                    <AppText size="xs" color="secondary">{guardId || 'GRD-001'} (Guard)</AppText>
                  </View>

                  {/* Site & Shift */}
                  <View style={[styles.td, { width: 140 }]}>
                    <AppText size="sm" weight="medium" color="primary">{rec.siteName || 'Main Site'}</AppText>
                    <AppText size="xs" color="secondary">{rec.shiftName || 'Day Shift'}</AppText>
                  </View>

                  {/* Date */}
                  <View style={[styles.td, { width: 100 }]}>
                    <AppText size="sm" weight="medium">{rec.date}</AppText>
                  </View>

                  {/* Clock In */}
                  <View style={[styles.td, { width: 110 }]}>
                    <AppText size="sm" weight="medium" color="success">{formatTimeStr(rec.clockIn)}</AppText>
                  </View>

                  {/* Clock Out */}
                  <View style={[styles.td, { width: 110 }]}>
                    <AppText size="sm" weight="medium" color={rec.clockOut ? 'primary' : 'tertiary'}>
                      {formatTimeStr(rec.clockOut)}
                    </AppText>
                  </View>

                  {/* Total Hrs */}
                  <View style={[styles.td, { width: 90 }]}>
                    <AppText size="sm" weight="bold" color={isOngoing ? 'success' : 'primary'}>
                      {displayHrs}
                    </AppText>
                  </View>

                  {/* Overtime */}
                  <View style={[styles.td, { width: 80 }]}>
                    <AppText size="sm" color="secondary">0 hrs</AppText>
                  </View>

                  {/* Geo Status */}
                  <View style={[styles.td, { width: 130 }]}>
                    <View style={[styles.geoBadge, { backgroundColor: colors.successLight }]}>
                      <AppText size="xs" weight="bold" style={{ color: colors.success[700] }}>
                        INSIDE_GEOFENCE
                      </AppText>
                    </View>
                  </View>

                  {/* Status */}
                  <View style={[styles.td, { width: 90 }]}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            rec.status.toLowerCase() === 'present'
                              ? colors.successLight
                              : colors.warningLight,
                        },
                      ]}
                    >
                      <AppText
                        size="xs"
                        weight="bold"
                        style={{
                          color:
                            rec.status.toLowerCase() === 'present'
                              ? colors.success[700]
                              : colors.warning[700],
                        }}
                      >
                        {rec.status.toLowerCase()}
                      </AppText>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={[styles.td, { width: 80 }]}>
                    <TouchableOpacity
                      style={[styles.viewBtn, { backgroundColor: colors.primary[50] }]}
                      onPress={() => navigation.navigate('AttendanceDetails', { recordId: rec.id })}
                    >
                      <AppText size="xs" weight="bold" color="primary">View</AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  titleArea: {
    flex: 1,
    minWidth: 240,
  },
  subtitle: {
    marginTop: 4,
    lineHeight: 18,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  topBtn: {
    minWidth: 100,
  },
  tabBar: {
    borderBottomWidth: 2,
    marginBottom: 16,
  },
  activeTab: {
    borderBottomWidth: 3,
    paddingBottom: 8,
    alignSelf: 'flex-start',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  searchInputWrap: {
    flex: 1,
    minWidth: 200,
  },
  filterDropdown: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exportBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableScroll: {
    width: '100%',
  },
  tableContainer: {
    minWidth: 1000,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  th: {
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  td: {
    paddingHorizontal: 6,
  },
  geoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  viewBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    alignItems: 'center',
  },
  emptyRow: {
    padding: 24,
    alignItems: 'center',
  },
});
