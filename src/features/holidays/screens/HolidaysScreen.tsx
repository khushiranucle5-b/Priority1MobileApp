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

import { HolidayData, mockHolidays } from '../data/holidaysData';
export type { HolidayData };
export { mockHolidays };

export const HolidaysScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation<any>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayData | null>(null);

  const filteredHolidays = (mockHolidays || []).filter((h) => {
    if (!h) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const nameStr = (h.name || '').toLowerCase();
    const codeStr = (h.holidayCode || '').toLowerCase();
    const typeStr = (h.type || '').toLowerCase();

    return !q || nameStr.includes(q) || codeStr.includes(q) || typeStr.includes(q);
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

  const getStatusBadgeStyle = (status: string) => {
    return status === 'Past'
      ? { bg: '#F1F5F9', text: '#64748B' }
      : { bg: '#D1FAE5', text: '#059669' };
  };

  return (
    <ScreenLayout activeRoute="Holidays">
      <PageHeader title="Company Holidays" showBack />
      
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Search Bar matching Reference Screenshot */}
        <View style={styles.searchBox}>
          <View style={{ marginRight: 8, width: 18, alignItems: 'center' }}>
            <NavIcon name="search" size={18} color="#64748B" />
          </View>
          <TextInput
            placeholder="Search holidays by name, code, category..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            placeholderTextColor="#94A3B8"
          />
        </View>


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
            const statusColors = getStatusBadgeStyle(holiday.status);

            return (
              <Card key={holiday.id} style={styles.holidayCard}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('HolidayDetails', { holidayId: holiday.id })}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Heading level="h3" color="primary">{holiday.name}</Heading>
                      <AppText size="sm" color="secondary" style={{ marginTop: 2 }}>
                        Holiday ID: {holiday.holidayCode} • {holiday.dateStr}
                      </AppText>
                    </View>

                    <View style={styles.badgeColumn}>
                      <View style={[styles.badge, { backgroundColor: statusColors.bg }]}>
                        <AppText size="sm" weight="bold" style={{ color: statusColors.text }}>
                          {holiday.status}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={[styles.badge, { backgroundColor: typeColors.bg }]}>
                      <AppText size="sm" weight="bold" style={{ color: typeColors.text }}>
                        {holiday.type}
                      </AppText>
                    </View>

                    <TouchableOpacity
                      style={styles.viewIconButton}
                      onPress={() => navigation.navigate('HolidayDetails', { holidayId: holiday.id })}
                      activeOpacity={0.7}
                    >
                      <NavIcon name="eye" size={20} color="#4F46E5" />
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
                      <View style={[styles.badgeInline, { backgroundColor: getTypeBadgeStyle(selectedHoliday.type).bg }]}>
                        <AppText size="sm" weight="bold" style={{ color: getTypeBadgeStyle(selectedHoliday.type).text }}>
                          {selectedHoliday.type}
                        </AppText>
                      </View>
                    </View>

                    <View style={styles.infoCol}>
                      <AppText size="sm" color="secondary">Status</AppText>
                      <View style={[styles.badgeInline, { backgroundColor: getStatusBadgeStyle(selectedHoliday.status).bg }]}>
                        <AppText size="sm" weight="bold" style={{ color: getStatusBadgeStyle(selectedHoliday.status).text }}>
                          {selectedHoliday.status}
                        </AppText>
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
    padding: 16,
    paddingBottom: 40,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 56,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
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
  sectionTitle: {
    marginBottom: 12,
  },
  holidayCard: {
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
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeInline: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
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
