import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Search, X, Check, Globe } from 'lucide-react-native';
import { AppText } from './typography/Text';
import { Heading } from './typography/Heading';
import { useTheme } from '../providers/ThemeProvider';
import {
  CountryCode,
  ALL_COUNTRIES,
  POPULAR_COUNTRIES,
  DEFAULT_COUNTRY,
} from '../constants/countryCodes';

interface CountryCodePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryCode) => void;
  selectedDialCode?: string;
  title?: string;
}

export const CountryCodePickerModal: React.FC<CountryCodePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedDialCode = '+91',
  title = 'Select Country Code',
}) => {
  const { colors, borderRadius } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_COUNTRIES;
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (country: CountryCode) => {
    onSelect(country);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalBackdrop}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleClose} />

        <View
          style={[
            styles.modalContent,
            { backgroundColor: colors.surface, borderRadius: borderRadius.xl || 16 },
          ]}
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={[styles.headerIconWrap, { backgroundColor: '#EEF2FF' }]}>
                <Globe size={18} color="#4F46E5" />
              </View>
              <Heading level="h4" style={[styles.modalTitle, { color: colors.text }]}>
                {title}
              </Heading>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceSecondary }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View
            style={[
              styles.searchBox,
              { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
            ]}
          >
            <Search size={16} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search country name or code (+91, +1, UK...)"
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={15} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Popular Countries Quick Chips */}
          {!searchQuery && (
            <View style={styles.popularSection}>
              <AppText size="xs" weight="bold" style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                POPULAR COUNTRIES
              </AppText>
              <View style={styles.chipsRow}>
                {POPULAR_COUNTRIES.slice(0, 6).map((c) => {
                  const isSelected = c.dialCode === selectedDialCode;
                  return (
                    <TouchableOpacity
                      key={c.code}
                      style={[
                        styles.quickChip,
                        {
                          backgroundColor: isSelected ? '#4F46E5' : colors.surfaceSecondary,
                          borderColor: isSelected ? '#4F46E5' : colors.border,
                        },
                      ]}
                      onPress={() => handleSelect(c)}
                    >
                      <AppText size="xs" style={{ marginRight: 4 }}>
                        {c.flag}
                      </AppText>
                      <AppText
                        size="xs"
                        weight="bold"
                        style={{ color: isSelected ? '#FFFFFF' : colors.text }}
                      >
                        {c.dialCode}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Countries List */}
          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => `${item.code}-${item.dialCode}`}
            showsVerticalScrollIndicator={true}
            style={styles.listContainer}
            contentContainerStyle={{ paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <AppText size="sm" style={{ color: colors.textSecondary, textAlign: 'center' }}>
                  No matching countries found for "{searchQuery}"
                </AppText>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = item.dialCode === selectedDialCode;
              return (
                <TouchableOpacity
                  style={[
                    styles.countryRow,
                    {
                      backgroundColor: isSelected ? '#EEF2FF' : 'transparent',
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <AppText size="lg" style={styles.flagEmoji}>
                    {item.flag}
                  </AppText>
                  <View style={styles.countryInfo}>
                    <AppText size="sm" weight={isSelected ? 'bold' : 'medium'} style={{ color: colors.text }}>
                      {item.name}
                    </AppText>
                    <AppText size="xs" style={{ color: colors.textSecondary }}>
                      {item.code}
                    </AppText>
                  </View>
                  <View
                    style={[
                      styles.dialCodeBadge,
                      {
                        backgroundColor: isSelected ? '#4F46E5' : colors.surfaceSecondary,
                      },
                    ]}
                  >
                    <AppText
                      size="xs"
                      weight="bold"
                      style={{ color: isSelected ? '#FFFFFF' : colors.textSecondary }}
                    >
                      {item.dialCode}
                    </AppText>
                  </View>
                  {isSelected && (
                    <View style={styles.checkIconWrap}>
                      <Check size={16} color="#4F46E5" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '82%',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 0,
  },
  popularSection: {
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  listContainer: {
    marginTop: 4,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  flagEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  dialCodeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  checkIconWrap: {
    marginLeft: 4,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
});
