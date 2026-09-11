// Priority One Guard Mobile - Holidays Management Screen
import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { NavIcon } from '../../../components/NavIcon';
import { FilterBottomSheet } from '../../../components/FilterBottomSheet';
import { StatusBadge } from '../../../components/StatusBadge';

import { HolidayData, mockHolidays } from '../data/holidaysData';
export type { HolidayData };
export { mockHolidays };

export const HolidaysScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayData | null>(null);

  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Company Holiday', value: 'Company Holiday' },
    { label: 'Festival Holiday', value: 'Festival Holiday' },
    { label: 'National Holiday', value: 'National Holiday' },
    { label: 'Public Holiday', value: 'Public Holiday' },
  ];

  const filteredHolidays = (mockHolidays || []).filter((h) => {
    if (!h) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const nameStr = (h.name || '').toLowerCase();
    const codeStr = (h.holidayCode || '').toLowerCase();
    const typeStr = (h.type || '').toLowerCase();

    const matchesSearch = !q || nameStr.includes(q) || codeStr.includes(q) || typeStr.includes(q);
    const matchesFilter = typeFilter === 'All' || typeStr.includes((typeFilter || '').toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'Company Holiday':
        return { bg: '#EEF2FF', text: '#4F46E5' };
      case 'Festival Holiday':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'National Holiday':
        return { bg: '#E0E7FF', text: '#3730A3' };
      case 'Public':
      case 'Public Holiday':
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  return (
    <ScreenLayout activeRoute="Holidays">
      <PageHeader title="Company Holidays" showBack />
      
      {/* Search Bar & Filter Dropdown matching Patrol Screen */}
      <View style={[styles.searchFilterRow, { paddingHorizontal: 16, paddingTop: 16 }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <View style={{ marginRight: 8, width: 18, alignItems: 'center' }}>
            <NavIcon name="search" size={18} color={colors.textSecondary} />
          </View>
          <TextInput
            placeholder="Search holidays by name, code, category..."
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
        
        <TouchableOpacity
          style={[styles.dropdownTrigger, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.8}
        >
          <AppText size="sm" weight="bold" color="primary" style={{ marginRight: 4 }}>
            {typeFilter === 'All' ? 'Filter: All' : `Filter: ${typeFilter}`}
          </AppText>
          <AppText size="xs" color="secondary">{dropdownOpen ? '▲' : '▼'}</AppText>
        </TouchableOpacity>
      </View>

      <FilterBottomSheet
        visible={dropdownOpen}
        onClose={() => setDropdownOpen(false)}
        title="Select Holiday Type"
        options={filterOptions}
        selectedValue={typeFilter}
        onSelect={(val) => setTypeFilter(val)}
      />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>


        <Heading level="h3" style={styles.sectionTitle}>
          Holidays ({filteredHolidays.length})
        </Heading>

        {filteredHolidays.length === 0 ? (
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <AppText size="base" color="secondary">No holidays match current filter selections.</AppText>
          </Card>
        ) : (
          filteredHolidays.map((holiday) => {
            const typeColors = getTypeBadgeStyle(holiday.type);

            return (
              <Card key={holiday.id} variant="outlined" style={styles.card}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('HolidayDetails', { holidayId: holiday.id })}
                >
                  <View style={styles.headerRow}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Heading level="h3" color="primary">{holiday.name}</Heading>
                    </View>
                    <StatusBadge status={holiday.status} size="md" />
                  </View>

                  <View style={[styles.detailRow, { marginTop: spacing.sm || 10 }]}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>HOLIDAY ID</AppText>
                      <AppText size="base" weight="bold" color="primary" style={styles.metaValueText}>
                        {holiday.holidayCode}
                      </AppText>
                    </View>
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>DATE</AppText>
                      <AppText size="base" weight="bold" color="primary" style={styles.metaValueText}>
                        {holiday.dateStr}
                      </AppText>
                    </View>
                  </View>
                  
                  <View style={{ marginTop: 10 }}>
                      <AppText size="xs" color="secondary" weight="semibold" style={styles.metaLabelText}>TYPE</AppText>
                      <AppText size="base" color="primary" weight="bold" style={styles.metaValueText}>
                        {holiday.type}
                      </AppText>
                  </View>

                  <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
                    <TouchableOpacity
                      style={[styles.iconActionBtnView, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
                      onPress={() => navigation.navigate('HolidayDetails', { holidayId: holiday.id })}
                      activeOpacity={0.7}
                    >
                      <NavIcon name="eye" size={24} color={colors.primary[600]} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Card>
            );
          })
        )}

      </ScrollView>


      {/* HOLIDAY DETAILS MODAL */}
      <Modal
        visible={selectedHoliday !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedHoliday(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            {selectedHoliday && (
              <>
                <View style={styles.modalHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Heading level="h2" color="primary">View Holiday</Heading>
                    <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
                      View the details and configuration of the selected holiday.
                    </AppText>
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedHoliday(null)}
                    style={styles.backButtonBtn}
                  >
                    <AppText size="sm" weight="bold" style={{ color: '#475569' }}>
                      ← Back to Holidays
                    </AppText>
                  </TouchableOpacity>
                </View>

                {/* Main Card: HOLIDAY INFORMATION */}
                <View style={styles.holidayInfoCard}>
                  <AppText size="sm" weight="bold" style={styles.sectionHeading}>
                    HOLIDAY INFORMATION
                  </AppText>

                  <View style={styles.dividerLine} />

                  <View style={styles.infoGrid}>
                    <View style={styles.infoCol}>
                      <AppText size="sm" color="secondary">Holiday Name</AppText>
                      <AppText size="base" weight="bold" color="primary" style={{ marginTop: 2 }}>
                        {selectedHoliday.name}
                      </AppText>
                    </View>

                    <View style={styles.infoCol}>
                      <AppText size="sm" color="secondary">Date</AppText>
                      <AppText size="base" weight="bold" color="primary" style={{ marginTop: 2 }}>
                        {selectedHoliday.dateStr}
                      </AppText>
                    </View>

                    <View style={styles.infoCol}>
                      <AppText size="sm" color="secondary">Type</AppText>
                      <View style={[{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 }, { backgroundColor: getTypeBadgeStyle(selectedHoliday.type).bg }]}>
                        <AppText size="sm" weight="bold" style={{ color: getTypeBadgeStyle(selectedHoliday.type).text }}>
                          {selectedHoliday.type}
                        </AppText>
                      </View>
                    </View>

                    <View style={styles.infoCol}>
                      <AppText size="sm" color="secondary">Status</AppText>
                      <View style={{ marginTop: 4 }}>
                        <StatusBadge status={selectedHoliday.status} size="sm" />
                      </View>
                    </View>

                    <View style={styles.infoCol}>
                      <AppText size="sm" color="secondary">Holiday ID</AppText>
                      <AppText size="base" weight="bold" color="primary" style={{ marginTop: 2 }}>
                        {selectedHoliday.holidayCode}
                      </AppText>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
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
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 56,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 56,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    includeFontPadding: false,
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
  card: {
    marginBottom: 12,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaLabelText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  metaValueText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 3,
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  iconActionBtnView: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
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
    maxHeight: '80%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  backButtonBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  holidayInfoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
  },
  sectionHeading: {
    color: '#64748B',
    letterSpacing: 0.5,
  },
  dividerLine: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
  },
  infoCol: {
    width: '50%',
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
