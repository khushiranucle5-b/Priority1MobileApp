import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Alert, Linking, Platform } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { useTheme } from '../../../providers/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { useGuardStore } from '../../../store/useGuardStore';
import { NavIcon } from '../../../components/NavIcon';
import { FilterBottomSheet } from '../../../components/FilterBottomSheet';

import { getPayslipList, ExtendedPayslipItem } from '../services/payslipService';
import { downloadPayslipPdf } from '../services/payslipPdfGenerator';

export type PayslipItem = ExtendedPayslipItem;
export const mockPayslips = getPayslipList();

export const PayslipsScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { guardName, guardId, assignedSite } = useGuardStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [activeDropdown, setActiveDropdown] = useState<'month' | 'year' | null>(null);

  const payslips = getPayslipList({ guardName, guardId });

  const monthsList = [
    'All',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const yearsList = ['All', '2026', '2025', '2024'];

  const handleDownloadPdf = async (slip: ExtendedPayslipItem) => {
    await downloadPayslipPdf(slip);
  };

  const filteredPayslips = payslips.filter((slip) => {
    const q = (searchQuery || '').toLowerCase().trim();
    const monthYearStr = (slip.monthYear || '').toLowerCase();
    const payslipIdStr = (slip.payslipId || '').toLowerCase();
    const cycleStr = (slip.cyclePeriod || '').toLowerCase();

    const matchesSearch = !q || monthYearStr.includes(q) || payslipIdStr.includes(q) || cycleStr.includes(q);

    const matchesMonth = selectedMonth === 'All' || monthYearStr.includes(selectedMonth.toLowerCase());
    const matchesYear = selectedYear === 'All' || monthYearStr.includes(selectedYear.toLowerCase());

    return matchesSearch && matchesMonth && matchesYear;
  });

  return (
    <ScreenLayout activeRoute="Payslips">
      <PageHeader title="My Payslips" showBack />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Search Bar */}
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ marginRight: 8 }}>
            <NavIcon name="search" size={18} color={colors.textSecondary} />
          </View>
          <TextInput
            placeholder="Search payslips..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <AppText size="xs" weight="bold" style={{ color: colors.textSecondary }}>✕</AppText>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* 2 Pickers Row: Month & Year */}
        <View style={styles.filterRow}>
          {/* Month Picker */}
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }, activeDropdown === 'month' && { borderColor: colors.primary[600], backgroundColor: colors.primary[50] }]}
            onPress={() => setActiveDropdown(activeDropdown === 'month' ? null : 'month')}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <AppText size="xs" color="secondary">Month</AppText>
              <AppText size="sm" weight="bold" color="primary" numberOfLines={1}>
                {selectedMonth === 'All' ? 'All Months' : selectedMonth}
              </AppText>
            </View>
            <AppText size="xs" color="secondary" style={{ marginLeft: 4 }}>
              {activeDropdown === 'month' ? '▲' : '▼'}
            </AppText>
          </TouchableOpacity>

          {/* Year Picker */}
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }, activeDropdown === 'year' && { borderColor: colors.primary[600], backgroundColor: colors.primary[50] }]}
            onPress={() => setActiveDropdown(activeDropdown === 'year' ? null : 'year')}
            activeOpacity={0.8}
          >
            <View style={{ flex: 1 }}>
              <AppText size="xs" color="secondary">Year</AppText>
              <AppText size="sm" weight="bold" color="primary" numberOfLines={1}>
                {selectedYear === 'All' ? 'All Years' : selectedYear}
              </AppText>
            </View>
            <AppText size="xs" color="secondary" style={{ marginLeft: 4 }}>
              {activeDropdown === 'year' ? '▲' : '▼'}
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Month Filter Bottom Sheet */}
        <FilterBottomSheet
          visible={activeDropdown === 'month'}
          onClose={() => setActiveDropdown(null)}
          title="Select Month"
          options={monthsList.map((m) => ({
            label: m === 'All' ? 'All Months' : m,
            value: m,
          }))}
          selectedValue={selectedMonth}
          onSelect={(m) => setSelectedMonth(m)}
        />

        {/* Year Filter Bottom Sheet */}
        <FilterBottomSheet
          visible={activeDropdown === 'year'}
          onClose={() => setActiveDropdown(null)}
          title="Select Year"
          options={yearsList.map((y) => ({
            label: y === 'All' ? 'All Years' : y,
            value: y,
          }))}
          selectedValue={selectedYear}
          onSelect={(y) => setSelectedYear(y)}
        />

        <Heading level="h3" style={styles.sectionTitle}>Pay Statements ({filteredPayslips.length})</Heading>

        {filteredPayslips.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <NavIcon name="payslips" size={32} color={colors.textSecondary} />
            <AppText size="sm" color="secondary" style={{ marginTop: 10, textAlign: 'center' }}>
              No payslips found matching the search or filter criteria.
            </AppText>
          </Card>
        ) : (
          filteredPayslips.map((slip) => (
            <Card key={slip.id} style={[styles.payslipCard, { borderColor: colors.border }]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PayslipDetails', { payslipId: slip.id })}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Heading level="h3" color="primary">{slip.monthYear}</Heading>
                    <AppText size="xs" color="secondary" weight="semibold" style={{ marginTop: 3 }}>
                      {slip.cyclePeriod}
                    </AppText>
                  </View>
                </View>

                <View style={[styles.payGrid, { borderColor: colors.border }]}>
                  <View style={styles.payRow}>
                    <AppText size="xs" color="secondary" weight="semibold" style={{ textTransform: 'uppercase' }}>BASIC WAGES</AppText>
                    <AppText size="sm" weight="bold" color="primary">{slip.basicRosterWages}</AppText>
                  </View>

                  <View style={styles.payRow}>
                    <AppText size="xs" color="secondary" weight="semibold" style={{ textTransform: 'uppercase' }}>OVERTIME (1.5X)</AppText>
                    <AppText size="sm" weight="bold" color="primary">{slip.overtimeWages}</AppText>
                  </View>

                  <View style={styles.payRow}>
                    <AppText size="xs" color="secondary" weight="semibold" style={{ textTransform: 'uppercase' }}>NET DISBURSED</AppText>
                    <AppText size="base" weight="bold" style={{ color: colors.primary[600] }}>{slip.netDisbursedWages}</AppText>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.viewRow}>
                <TouchableOpacity
                  style={[styles.iconActionBtnView, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => navigation.navigate('PayslipDetails', { payslipId: slip.id })}
                  activeOpacity={0.7}
                  accessibilityLabel="View payslip details"
                >
                  <NavIcon name="eye" size={24} color={colors.primary[600]} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.quickDownloadBtn, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                  onPress={() => handleDownloadPdf(slip)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Download payslip PDF"
                >
                  <NavIcon name="download" size={24} color={colors.primary[600]} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 56,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 56,
  },
  pickerButtonActive: {
  },
  dropdownMenuContainer: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 6,
    marginBottom: 16,
    maxHeight: 240,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  dropdownMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
    minHeight: 42,
    justifyContent: 'center',
  },
  dropdownMenuItemActive: {
  },
  sectionTitle: {
    marginBottom: 12,
  },
  payslipCard: {
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  paidTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  payGrid: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingTop: 4,
  },
  iconActionBtnView: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickDownloadBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
