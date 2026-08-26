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
        <View style={styles.searchBox}>
          <View style={{ marginRight: 8, width: 18, alignItems: 'center' }}>
            <NavIcon name="search" size={16} color="#64748B" />
          </View>
          <TextInput
            placeholder="Search payslips..."
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

        {/* 2 Pickers Row: Month & Year */}
        <View style={styles.filterRow}>
          {/* Month Picker */}
          <TouchableOpacity
            style={[styles.pickerButton, activeDropdown === 'month' && styles.pickerButtonActive]}
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
            style={[styles.pickerButton, activeDropdown === 'year' && styles.pickerButtonActive]}
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

        {/* Inline Month Dropdown */}
        {activeDropdown === 'month' && (
          <ScrollView
            style={styles.dropdownMenuContainer}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
          >
            {monthsList.map((m) => {
              const isSel = selectedMonth === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.dropdownMenuItem, isSel && styles.dropdownMenuItemActive]}
                  onPress={() => {
                    setSelectedMonth(m);
                    setActiveDropdown(null);
                  }}
                >
                  <AppText
                    size="sm"
                    weight={isSel ? 'bold' : 'medium'}
                    style={{ color: isSel ? '#4F46E5' : '#334155' }}
                  >
                    {isSel ? `✓ ${m === 'All' ? 'All Months' : m}` : (m === 'All' ? 'All Months' : m)}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Inline Year Dropdown */}
        {activeDropdown === 'year' && (
          <ScrollView
            style={styles.dropdownMenuContainer}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
          >
            {yearsList.map((y) => {
              const isSel = selectedYear === y;
              return (
                <TouchableOpacity
                  key={y}
                  style={[styles.dropdownMenuItem, isSel && styles.dropdownMenuItemActive]}
                  onPress={() => {
                    setSelectedYear(y);
                    setActiveDropdown(null);
                  }}
                >
                  <AppText
                    size="sm"
                    weight={isSel ? 'bold' : 'medium'}
                    style={{ color: isSel ? '#4F46E5' : '#334155' }}
                  >
                    {isSel ? `✓ ${y === 'All' ? 'All Years' : y}` : (y === 'All' ? 'All Years' : y)}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        <Heading level="h3" style={styles.sectionTitle}>Pay Statements ({filteredPayslips.length})</Heading>

        {filteredPayslips.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <NavIcon name="payslips" size={32} color="#94A3B8" />
            <AppText size="sm" color="secondary" style={{ marginTop: 10, textAlign: 'center' }}>
              No payslips found matching the search or filter criteria.
            </AppText>
          </Card>
        ) : (
          filteredPayslips.map((slip) => (
            <Card key={slip.id} style={styles.payslipCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PayslipDetails', { payslipId: slip.id })}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Heading level="h2" color="primary">{slip.monthYear}</Heading>
                    <AppText size="sm" color="secondary" style={{ marginTop: 3 }}>
                      ID: {slip.payslipId} • {slip.cyclePeriod}
                    </AppText>
                  </View>

                  <View style={styles.paidTag}>
                    <AppText size="sm" weight="bold" style={{ color: '#059669' }}>
                      ● {slip.status}
                    </AppText>
                  </View>
                </View>

                <View style={styles.payGrid}>
                  <View style={styles.payBox}>
                    <AppText size="sm" color="secondary">Basic Wages</AppText>
                    <AppText size="base" weight="bold" color="primary" style={{ marginTop: 2 }}>{slip.basicRosterWages}</AppText>
                  </View>

                  <View style={styles.payBox}>
                    <AppText size="sm" color="secondary">Overtime (1.5x)</AppText>
                    <AppText size="base" weight="bold" color="primary" style={{ marginTop: 2 }}>{slip.overtimeWages}</AppText>
                  </View>

                  <View style={styles.payBox}>
                    <AppText size="sm" color="secondary">Net Disbursed</AppText>
                    <AppText size="md" weight="bold" style={{ color: '#4F46E5', marginTop: 2 }}>{slip.netDisbursedWages}</AppText>
                  </View>
                </View>
              </TouchableOpacity>

              <View style={styles.viewRow}>
                <TouchableOpacity
                  style={styles.iconActionBtnView}
                  onPress={() => navigation.navigate('PayslipDetails', { payslipId: slip.id })}
                  activeOpacity={0.7}
                  accessibilityLabel="View payslip details"
                >
                  <NavIcon name="eye" size={24} color="#4F46E5" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickDownloadBtn}
                  onPress={() => handleDownloadPdf(slip)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Download payslip PDF"
                >
                  <NavIcon name="download" size={22} color="#4F46E5" />
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
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  pickerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 48,
  },
  pickerButtonActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  dropdownMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 6,
    marginBottom: 16,
    maxHeight: 240,
    elevation: 3,
    shadowColor: '#000',
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
    backgroundColor: '#EEF2FF',
  },
  sectionTitle: {
    marginBottom: 12,
  },
  payslipCard: {
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  paidTag: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  payGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  payBox: {
    alignItems: 'flex-start',
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
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickDownloadBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
