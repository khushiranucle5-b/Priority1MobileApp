import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../types/navigation.types';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { NotificationCard, EmptyNotificationState, NotificationListSkeleton } from '../components';
import { NavIcon } from '../../../components/NavIcon';

type Props = NativeStackScreenProps<HomeStackParamList, 'Notifications'>;

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const { notifications, markAllNotificationsRead, deleteAllNotifications } = useGuardStore();
  const {
    notificationsEnabled,
    shiftRemindersEnabled,
    incidentAlertsEnabled,
    loneWorkerAlertsEnabled,
    leaveStatusAlertsEnabled,
    companyNoticesEnabled,
    loadSettings,
  } = useSettingsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isLoading = false;

  const filterOptions = [
    { label: 'All Notifications', value: 'All' },
    { label: 'Attendance', value: 'Attendance' },
    { label: 'Leave', value: 'Leave' },
    { label: 'Incident', value: 'Incident' },
    { label: 'Company', value: 'Company' },
    { label: 'Holiday', value: 'Holiday' },
    { label: 'System', value: 'System' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  // Filter notifications dynamically based on both user settings and screen dropdown filter
  const filteredNotifications = useMemo(() => {
    if (!notificationsEnabled) {
      return [];
    }

    let result = notifications;

    // Filter out categories if disabled in Notification Settings
    if (!shiftRemindersEnabled) {
      result = result.filter(n => (n.type || '').toLowerCase() !== 'attendance');
    }
    if (!incidentAlertsEnabled) {
      result = result.filter(n => (n.type || '').toLowerCase() !== 'incident');
    }
    if (!loneWorkerAlertsEnabled) {
      result = result.filter(n => (n.type || '').toLowerCase() !== 'system');
    }
    if (!leaveStatusAlertsEnabled) {
      result = result.filter(n => (n.type || '').toLowerCase() !== 'leave');
    }
    if (!companyNoticesEnabled) {
      result = result.filter(n => {
        const t = (n.type || '').toLowerCase();
        return t !== 'company' && t !== 'holiday';
      });
    }

    // Robust category filter matching
    if (activeCategory !== 'All') {
      const cat = activeCategory.toLowerCase();
      result = result.filter(n => {
        const typeLower = (n.type || '').toLowerCase();
        const titleLower = (n.title || '').toLowerCase();

        if (cat === 'attendance') {
          return typeLower === 'attendance' || titleLower.includes('clock') || titleLower.includes('shift');
        }
        if (cat === 'leave') {
          return typeLower === 'leave' || titleLower.includes('leave');
        }
        if (cat === 'incident') {
          return typeLower === 'incident' || titleLower.includes('incident') || titleLower.includes('emergency');
        }
        if (cat === 'company') {
          return typeLower === 'company' || titleLower.includes('notice') || titleLower.includes('broadcast');
        }
        if (cat === 'holiday') {
          return typeLower === 'holiday' || titleLower.includes('holiday');
        }
        if (cat === 'system') {
          return (
            typeLower === 'system' ||
            typeLower === 'patrol' ||
            titleLower.includes('patrol') ||
            titleLower.includes('checkpoint') ||
            titleLower.includes('safety') ||
            titleLower.includes('system')
          );
        }
        return typeLower === cat;
      });
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(n => 
        (n.title || '').toLowerCase().includes(lowerQuery) || 
        (n.description || '').toLowerCase().includes(lowerQuery) ||
        (n.type || '').toLowerCase().includes(lowerQuery)
      );
    }

    // Safe timestamp extractor to prevent NaN crashes on Android Hermes JS engine
    const safeGetTimestamp = (notif: typeof notifications[0]): number => {
      try {
        if ((notif as any).createdAt) {
          const t = new Date((notif as any).createdAt).getTime();
          if (!isNaN(t)) return t;
        }
        if (notif.date && notif.time) {
          const t = new Date(`${notif.date} ${notif.time}`).getTime();
          if (!isNaN(t)) return t;
        }
        if (notif.date) {
          const t = new Date(notif.date).getTime();
          if (!isNaN(t)) return t;
        }
        if (notif.time && notif.time.includes('T')) {
          const t = new Date(notif.time).getTime();
          if (!isNaN(t)) return t;
        }
      } catch (e) {
        // Fallback gracefully
      }
      return 0;
    };

    // Sort newest first safely
    return [...result].sort((a, b) => safeGetTimestamp(b) - safeGetTimestamp(a));
  }, [notifications, activeCategory, searchQuery, notificationsEnabled, shiftRemindersEnabled, incidentAlertsEnabled, loneWorkerAlertsEnabled, leaveStatusAlertsEnabled, companyNoticesEnabled]);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  const handleDeleteAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to delete all notifications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete All", style: "destructive", onPress: () => deleteAllNotifications() }
      ]
    );
  };

  const handleOpenSettings = () => {
    navigation.navigate('Profile' as any, { screen: 'NotificationSettings' } as any);
  };

  return (
    <ScreenLayout>
      <PageHeader 
        title="Notifications" 
        showBack 
        onBack={() => navigation.goBack()} 
        rightComponent={
          <TouchableOpacity 
            onPress={handleOpenSettings}
            style={styles.settingsHeaderBtn}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <NavIcon name="settings" size={22} color="#2563EB" />
          </TouchableOpacity>
        }
      />
      
      {/* Banner if notifications are globally disabled in settings */}
      {!notificationsEnabled && (
        <TouchableOpacity 
          style={styles.disabledBanner} 
          onPress={handleOpenSettings}
          activeOpacity={0.8}
        >
          <AppText style={styles.disabledBannerText}>
            ⚠️ Push Notifications are disabled in Settings. Tap here to manage notification settings.
          </AppText>
        </TouchableOpacity>
      )}

      {/* Search & Dropdown Filter Row (Identical to Patrol Screen) */}
      <View style={[styles.searchFilterRow, { paddingHorizontal: spacing.base }]}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <View style={{ marginRight: 8 }}>
            <NavIcon name="search" size={18} color="#64748B" />
          </View>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by title, description..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn} activeOpacity={0.7}>
              <AppText style={styles.clearSearchText}>✕</AppText>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Dropdown Filter Trigger */}
        <TouchableOpacity
          style={[styles.dropdownTrigger, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.8}
        >
          <AppText style={styles.dropdownTriggerText}>
            {activeCategory === 'All' ? 'Filter: All' : `Filter: ${activeCategory}`}
          </AppText>
          <AppText style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</AppText>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu Options */}
      {dropdownOpen && (
        <View style={[styles.dropdownMenuContainer, { marginHorizontal: spacing.base }]}>
          {filterOptions.map((opt) => {
            const isSel = activeCategory === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.dropdownMenuItem, isSel && styles.dropdownMenuItemActive]}
                onPress={() => {
                  setActiveCategory(opt.value);
                  setDropdownOpen(false);
                }}
              >
                <AppText style={[styles.dropdownMenuItemText, { color: isSel ? '#2563EB' : '#334155', fontWeight: isSel ? '700' : '500' }]}>
                  {isSel ? `✓ ${opt.label}` : opt.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Action Bar with Item Count & Bulk Buttons */}
      <View style={[styles.actionBar, { paddingHorizontal: spacing.base }]}>
        <AppText style={styles.countText}>
          {filteredNotifications.length} {filteredNotifications.length === 1 ? 'Notification' : 'Notifications'}
        </AppText>
        
        <View style={styles.actionButtonsRight}>
          <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7} style={styles.actionBtn}>
            <AppText style={styles.actionTextPrimary}>Mark All Read</AppText>
          </TouchableOpacity>
          
          <AppText style={styles.actionDivider}>•</AppText>

          <TouchableOpacity onPress={handleDeleteAll} activeOpacity={0.7} style={styles.actionBtn}>
            <AppText style={styles.actionTextError}>Clear All</AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Notifications List */}
      <View style={[styles.listContainer, { paddingHorizontal: spacing.base }]}>
        {isLoading ? (
          <NotificationListSkeleton />
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item, index) => (item && item.id ? String(item.id) : `notif-${index}`)}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <NotificationCard 
                notification={item} 
                onPress={() => navigation.navigate('NotificationDetails', { notificationId: item.id })} 
              />
            )}
            contentContainerStyle={filteredNotifications.length === 0 ? styles.emptyContainer : styles.flatListContent}
            ListEmptyComponent={EmptyNotificationState}
          />
        )}
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  settingsHeaderBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1.5,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    borderRadius: 12,
  },
  disabledBannerText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 20,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
  },
  dropdownTriggerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginRight: 6,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#64748B',
  },
  dropdownMenuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    marginBottom: 14,
    paddingVertical: 4,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  dropdownMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownMenuItemActive: {
    backgroundColor: '#EFF6FF',
  },
  dropdownMenuItemText: {
    fontSize: 15,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  countText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#64748B',
  },
  actionButtonsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  actionTextPrimary: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  actionTextError: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  actionDivider: {
    marginHorizontal: 6,
    color: '#CBD5E1',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
  }
});
