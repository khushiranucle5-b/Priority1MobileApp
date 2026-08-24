import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';
import { useAuthStore } from '../../../store/useAuthStore';
import { getTable, updateRow, saveTable, DBUser } from '../../../services/db';
import { NavIcon } from '../../../components/NavIcon';

import { typography } from '../../../theme/tokens/typography';

export const ChangePasswordScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    setCurrentPasswordError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;

    if (!currentPassword.trim()) {
      setCurrentPasswordError('Please enter your current password.');
      hasError = true;
    }

    if (!newPassword.trim()) {
      setNewPasswordError('Please enter a new password.');
      hasError = true;
    } else if (newPassword.trim().length < 6) {
      setNewPasswordError('New password must be at least 6 characters long.');
      hasError = true;
    } else if (newPassword.trim() === currentPassword.trim()) {
      setNewPasswordError('New password must be different from current password.');
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please re-enter your new password.');
      hasError = true;
    } else if (newPassword.trim() !== confirmPassword.trim()) {
      setConfirmPasswordError('New password and confirm password do not match.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsLoading(true);
    try {
      const empId = user?.id || 'G-1001';
      const userEmail = user?.email || 'john@priority-one.io';
      const usersList = (await getTable<DBUser>('users')) || [];
      const userRecord = usersList.find(
        (u) => u.id === empId || u.email?.trim().toLowerCase() === userEmail.trim().toLowerCase()
      );

      const actualCurrentPassword = userRecord?.password || 'demo';

      if (currentPassword.trim() !== actualCurrentPassword) {
        setIsLoading(false);
        setCurrentPasswordError('Incorrect current password. Please try again.');
        return;
      }

      // Update password in users table
      if (userRecord) {
        await updateRow<DBUser>('users', userRecord.id, { password: newPassword.trim() });
      } else {
        const newUser: DBUser = {
          id: empId,
          name: user?.name || 'John Smith',
          email: userEmail,
          role: 'guard',
          companyId: 'c-1',
          password: newPassword.trim(),
        };
        await saveTable('users', [...usersList, newUser]);
      }

      Alert.alert(
        'Success',
        'Your password has been changed successfully. You will need to use your new password for future logins.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <PageHeader title="Change Password" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
          <AppText style={styles.infoText}>
            Ensure your account is using a strong password with a mix of letters, numbers, and symbols.
          </AppText>

          {/* Current Password Field */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Current Password</AppText>
            <View style={[
              styles.inputWrapper, 
              { backgroundColor: colors.background, borderColor: currentPasswordError ? '#EF4444' : colors.border, borderRadius: borderRadius.md }
            ]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  if (currentPasswordError) setCurrentPasswordError('');
                }}
                placeholder="Enter current password"
                placeholderTextColor={colors.secondary}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowCurrentPassword(!showCurrentPassword)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <NavIcon name="eye" size={26} color={showCurrentPassword ? '#2563EB' : '#94A3B8'} />
              </TouchableOpacity>
            </View>
            {!!currentPasswordError && (
              <AppText style={styles.errorText}>{currentPasswordError}</AppText>
            )}
          </View>

          {/* New Password Field */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>New Password</AppText>
            <View style={[
              styles.inputWrapper, 
              { backgroundColor: colors.background, borderColor: newPasswordError ? '#EF4444' : colors.border, borderRadius: borderRadius.md }
            ]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (newPasswordError) setNewPasswordError('');
                }}
                placeholder="Enter new password (min. 6 chars)"
                placeholderTextColor={colors.secondary}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNewPassword(!showNewPassword)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <NavIcon name="eye" size={26} color={showNewPassword ? '#2563EB' : '#94A3B8'} />
              </TouchableOpacity>
            </View>
            {!!newPasswordError && (
              <AppText style={styles.errorText}>{newPasswordError}</AppText>
            )}
          </View>

          {/* Confirm New Password Field */}
          <View style={styles.inputGroup}>
            <AppText style={styles.label}>Confirm New Password</AppText>
            <View style={[
              styles.inputWrapper, 
              { backgroundColor: colors.background, borderColor: confirmPasswordError ? '#EF4444' : colors.border, borderRadius: borderRadius.md }
            ]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                placeholder="Re-enter new password"
                placeholderTextColor={colors.secondary}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirmPassword(!showConfirmPassword)} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <NavIcon name="eye" size={26} color={showConfirmPassword ? '#2563EB' : '#94A3B8'} />
              </TouchableOpacity>
            </View>
            {!!confirmPasswordError && (
              <AppText style={styles.errorText}>{confirmPasswordError}</AppText>
            )}
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <Button 
              title={isLoading ? "Updating..." : "Update Password"} 
              onPress={handleChangePassword} 
              disabled={isLoading}
              size="large" 
              fullWidth
              style={{ minHeight: 60 }}
            />
          </View>
        </View>

      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  card: {
    padding: 18,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 12,
  },
  infoText: {
    marginBottom: 18,
    lineHeight: 24,
    ...typography.presets.helper,
    color: '#475569',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    ...typography.presets.label,
    color: '#334155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    minHeight: 56,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    ...typography.presets.body,
    includeFontPadding: false,
  },
  eyeBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    marginTop: 4,
    ...typography.presets.helper,
  },
});
