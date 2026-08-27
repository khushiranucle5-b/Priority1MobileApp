import React, { useState, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { useTheme } from '../../../providers/ThemeProvider';
import { useAuthStore } from '../../../store/useAuthStore';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { NavIcon, NavIconName } from '../../../components/NavIcon';
import { Button } from '../../../components/Button';

import { typography } from '../../../theme/tokens/typography';

interface SettingItem {
  id: string;
  icon: NavIconName;
  title: string;
  section: string;
  onPress?: () => void;
}

export const SettingsScreen: React.FC = () => {
  const { spacing, colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  const logout = useAuthStore(state => state.logout);
  const setThemeMode = useSettingsStore(state => state.setThemeMode);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out", style: "destructive", onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const allSettings: SettingItem[] = [
    { id: 'profile', icon: 'profile', title: 'Profile Settings', section: 'Account', onPress: () => navigation.navigate('ProfileSettings') },
    { id: 'password', icon: 'lock', title: 'Change Password', section: 'Account', onPress: () => navigation.navigate('ChangePassword') },
    { id: 'notification', icon: 'bell', title: 'Notification Settings', section: 'Account', onPress: () => navigation.navigate('NotificationSettings') },

    { id: 'support', icon: 'help', title: 'Help & Support', section: 'Support', onPress: () => navigation.navigate('HelpSupport') },
    { id: 'contact', icon: 'phone', title: 'Contact Support', section: 'Support', onPress: () => navigation.navigate('ContactSupport') },
    { id: 'policy', icon: 'security', title: 'Privacy Policy', section: 'Support', onPress: () => navigation.navigate('PrivacyPolicy') },
    { id: 'terms', icon: 'policies', title: 'Terms & Conditions', section: 'Support', onPress: () => navigation.navigate('TermsConditions') },

    { id: 'about', icon: 'info', title: 'About Application', section: 'Application', onPress: () => navigation.navigate('AboutApplication') },
  ];

  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSettings;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return allSettings.filter(setting => setting.title.toLowerCase().includes(lowerQuery));
  }, [searchQuery, allSettings]);

  const groupedSettings = useMemo(() => {
    const groups: { [key: string]: SettingItem[] } = {};
    filteredSettings.forEach(setting => {
      if (!groups[setting.section]) {
        groups[setting.section] = [];
      }
      groups[setting.section].push(setting);
    });
    return groups;
  }, [filteredSettings]);

  return (
    <ScreenLayout>
      <PageHeader title="Settings" showBack onBack={() => navigation.goBack()} />

      <View style={[styles.searchContainer, { backgroundColor: colors.card, marginHorizontal: spacing.base, borderRadius: borderRadius.md, marginTop: spacing.md }]}>
        <View style={styles.searchIcon}>
          <NavIcon name="search" size={24} color="#64748B" />
        </View>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for a setting..."
          placeholderTextColor={colors.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.base }]}>
        {filteredSettings.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText color="secondary" size="xl">No settings found</AppText>
          </View>
        ) : (
          Object.keys(groupedSettings).map(sectionTitle => (
            <View key={sectionTitle} style={{ marginTop: spacing.lg }}>
              <AppText style={styles.sectionTitle}>{sectionTitle}</AppText>
              <View style={[styles.sectionCard, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}>
                {groupedSettings[sectionTitle].map((setting, index) => {
                  const isLast = index === groupedSettings[sectionTitle].length - 1;
                  return (
                    <TouchableOpacity
                      key={setting.id}
                      style={[
                        styles.row,
                        !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border }
                      ]}
                      onPress={setting.onPress}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <View style={styles.left}>
                        <NavIcon name={setting.icon} size={28} color={colors.primary[600] || '#2563eb'} />
                        <AppText style={styles.settingItemTitle}>{setting.title}</AppText>
                      </View>

                      <NavIcon name="chevron-right" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}

        {/* Log Out Section */}
        <View style={{ marginTop: spacing.xl, marginBottom: spacing.md }}>
          <Button
            title="Logout"
            variant="danger"
            size="large"
            fullWidth
            style={{ minHeight: 64 }}
            onPress={handleLogout}
          />
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    ...typography.presets.body,
    includeFontPadding: false,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 10,
    marginLeft: 4,
    ...typography.presets.sectionHeading,
    color: '#475569',
  },
  sectionCard: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    minHeight: 60,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  settingItemTitle: {
    ...typography.presets.body,
    fontWeight: '600',
    color: '#0F172A',
  },
  arrowText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#94A3B8',
  }
});
