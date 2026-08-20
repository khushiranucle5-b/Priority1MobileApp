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

interface SettingItem {
  id: string;
  icon: string;
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
        { text: "Log Out", style: "destructive", onPress: async () => {
          await logout();
        }}
      ]
    );
  };

  const allSettings: SettingItem[] = [
    { id: 'profile', icon: '⚙️', title: 'Profile Settings', section: 'Account', onPress: () => navigation.navigate('ProfileSettings') },
    { id: 'password', icon: '🔑', title: 'Change Password', section: 'Account', onPress: () => navigation.navigate('ChangePassword') },
    { id: 'notification', icon: '🔔', title: 'Notification Settings', section: 'Account', onPress: () => navigation.navigate('NotificationSettings') },
    
    { id: 'privacy', icon: '🛡️', title: 'Privacy & Security', section: 'Privacy & Security', onPress: () => navigation.navigate('PrivacySecurity') },
    { id: 'biometric', icon: '👆', title: 'Biometric / App Lock', section: 'Privacy & Security', onPress: () => navigation.navigate('BiometricAppLock') },
    { id: 'policy', icon: '🔒', title: 'Privacy Policy', section: 'Privacy & Security', onPress: () => navigation.navigate('PrivacyPolicy') },
    { id: 'terms', icon: '📜', title: 'Terms & Conditions', section: 'Privacy & Security', onPress: () => navigation.navigate('TermsConditions') },
    
    { id: 'location', icon: '📍', title: 'Location & GPS', section: 'Attendance & Location', onPress: () => navigation.navigate('LocationGPS') },
    { id: 'attendance_settings', icon: '🕒', title: 'Attendance Settings', section: 'Attendance & Location', onPress: () => navigation.navigate('AttendanceSettings') },
    
    { id: 'appearance', icon: '🎨', title: 'Appearance', section: 'App Preferences', onPress: () => navigation.navigate('Appearance') },
    
    { id: 'support', icon: '❓', title: 'Help & Support', section: 'Support', onPress: () => navigation.navigate('HelpSupport') },
    { id: 'contact', icon: '✉️', title: 'Contact Support', section: 'Support', onPress: () => navigation.navigate('ContactSupport') },
    
    { id: 'permissions', icon: '🔐', title: 'App Permissions', section: 'Application', onPress: () => navigation.navigate('AppPermissions') },
    { id: 'storage', icon: '💾', title: 'Data & Storage', section: 'Application', onPress: () => navigation.navigate('DataStorage') },
    { id: 'about', icon: '📱', title: 'About Application', section: 'Application', onPress: () => navigation.navigate('AboutApplication') },
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
        <AppText style={styles.searchIcon} color="secondary">🔍</AppText>
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
            <AppText color="secondary" size="lg">No settings found</AppText>
          </View>
        ) : (
          Object.keys(groupedSettings).map(sectionTitle => (
            <View key={sectionTitle} style={{ marginTop: spacing.lg }}>
              <Heading level="h4" color="secondary" style={styles.sectionTitle}>{sectionTitle}</Heading>
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
                    >
                      <View style={styles.left}>
                        <AppText style={styles.icon}>{setting.icon}</AppText>
                        <AppText size="base" weight="medium">{setting.title}</AppText>
                      </View>
                      
                      <AppText size="base" color="secondary">→</AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}

        {/* Log Out Section */}
        <View style={{ marginTop: spacing.xl }}>
           <View style={[styles.sectionCard, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}>
              <TouchableOpacity 
                style={styles.row} 
                onPress={handleLogout}
              >
                <View style={styles.left}>
                  <AppText style={styles.icon}>🚪</AppText>
                  <AppText size="base" weight="bold" color="error">Log Out</AppText>
                </View>
              </TouchableOpacity>
           </View>
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCard: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 20,
    width: 24,
    textAlign: 'center',
  }
});
