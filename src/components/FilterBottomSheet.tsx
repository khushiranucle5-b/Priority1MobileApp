import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  BackHandler,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { AppText } from './typography/Text';
import { Heading } from './typography/Heading';
import { NavIcon } from './NavIcon';
import { Button } from './Button';
import { useTheme } from '../providers/ThemeProvider';

export interface FilterOption {
  label: string;
  value: string;
  icon?: string;
  disabled?: boolean;
  subtitle?: string;
}

export interface FilterBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: (FilterOption | string)[];
  selectedValue?: string | string[];
  onSelect: (value: any) => void;
  multiSelect?: boolean;
  showApplyButton?: boolean;
  applyButtonText?: string;
  enableSearch?: boolean;
  searchPlaceholder?: string;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  multiSelect = false,
  showApplyButton = false,
  applyButtonText = 'Apply Filter',
  enableSearch = false,
  searchPlaceholder = 'Search options...',
}) => {
  const { colors, borderRadius } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  // Convert array of options to normalized FilterOption object structure
  const normalizedOptions: FilterOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt };
    }
    return opt;
  });

  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      if (multiSelect) {
        if (Array.isArray(selectedValue)) {
          setTempSelected(selectedValue);
        } else if (selectedValue) {
          setTempSelected([selectedValue]);
        } else {
          setTempSelected([]);
        }
      }
    }
  }, [visible, selectedValue, multiSelect]);

  // Intercept Android hardware Back button
  useEffect(() => {
    if (!visible) return;

    const onBackPress = () => {
      onClose();
      return true; // prevent default back navigation
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [visible, onClose]);

  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      opt.label.toLowerCase().includes(q) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(q))
    );
  });

  const isSelected = (val: string): boolean => {
    if (multiSelect) {
      return tempSelected.includes(val);
    }
    if (Array.isArray(selectedValue)) {
      return selectedValue.includes(val);
    }
    return selectedValue === val;
  };

  const handleOptionPress = (opt: FilterOption) => {
    if (opt.disabled) return;

    if (multiSelect) {
      const isAlready = tempSelected.includes(opt.value);
      let updated: string[];
      if (isAlready) {
        updated = tempSelected.filter((v) => v !== opt.value);
      } else {
        updated = [...tempSelected, opt.value];
      }
      setTempSelected(updated);
      if (!showApplyButton) {
        onSelect(updated);
      }
    } else {
      onSelect(opt.value);
      onClose();
    }
  };

  const handleApplyMultiSelect = () => {
    onSelect(tempSelected);
    onClose();
  };

  const shouldShowSearch = enableSearch || normalizedOptions.length > 8;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.sheetContainer, { backgroundColor: colors.surface }]}>
              <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

              {/* Sheet Header */}
              <View style={styles.headerRow}>
                <Heading level="h3" color="primary" style={styles.titleText}>
                  {title}
                </Heading>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <AppText size="sm" weight="bold" color="secondary">
                    ✕
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Optional Search Bar */}
              {shouldShowSearch && (
                <View style={[styles.searchBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                  <View style={{ marginRight: 8, width: 18, alignItems: 'center' }}>
                    <NavIcon name="search" size={16} color={colors.textTertiary} />
                  </View>
                  <TextInput
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholderTextColor={colors.textTertiary}
                    clearButtonMode="while-editing"
                  />
                </View>
              )}

              {/* Options List */}
              <ScrollView
                style={styles.optionsScrollView}
                contentContainerStyle={styles.optionsList}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                {filteredOptions.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <AppText size="sm" color="secondary">
                      No matching options found.
                    </AppText>
                  </View>
                ) : (
                  filteredOptions.map((opt) => {
                    const active = isSelected(opt.value);
                    const disabled = opt.disabled;

                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.optionItem,
                          { borderRadius: borderRadius.md },
                          active && [styles.optionItemActive, { backgroundColor: colors.primary[50] }],
                          disabled && styles.optionItemDisabled,
                        ]}
                        onPress={() => handleOptionPress(opt)}
                        disabled={disabled}
                        activeOpacity={0.7}
                      >
                        <View style={styles.optionContent}>
                          {opt.icon ? (
                            <View style={styles.iconContainer}>
                              <NavIcon name={opt.icon as any} size={18} color={active ? colors.primary[600] : colors.textTertiary} />
                            </View>
                          ) : null}
                          <View style={{ flex: 1 }}>
                            <AppText
                              size="base"
                              weight={active ? 'bold' : 'regular'}
                              style={{ color: active ? colors.primary[600] : disabled ? colors.textDisabled : colors.text }}
                            >
                              {opt.label}
                            </AppText>
                            {opt.subtitle ? (
                              <AppText size="xs" color="secondary" style={{ marginTop: 2 }}>
                                {opt.subtitle}
                              </AppText>
                            ) : null}
                          </View>
                        </View>

                        {/* Checkmark aligned right */}
                        {active && (
                          <View style={styles.checkmarkContainer}>
                            <AppText size="base" weight="bold" style={{ color: colors.primary[600] }}>
                              ✓
                            </AppText>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>

              {/* Apply / Done Button for Multi-Select or custom Apply requirement */}
              {(multiSelect || showApplyButton) && (
                <View style={[styles.footerContainer, { borderTopColor: colors.border }]}>
                  <Button
                    title={applyButtonText}
                    onPress={handleApplyMultiSelect}
                    fullWidth
                    variant="primary"
                  />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF', // Need to make this dynamic
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: SCREEN_HEIGHT * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontSize: 18,
    lineHeight: 24,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  optionsScrollView: {
    maxHeight: 380,
  },
  optionsList: {
    paddingBottom: 8,
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 4,
    minHeight: 52,
  },
  optionItemActive: {},
  optionItemDisabled: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
  footerContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
});
