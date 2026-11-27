import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, Eye, EyeOff, MessageSquareCode } from 'lucide-react-native';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';
import { CountryCodePickerModal } from '../../../components/CountryCodePickerModal';
import { CountryCode, DEFAULT_COUNTRY } from '../../../constants/countryCodes';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  clearPasswordResetOtp,
  completeOtpPasswordReset,
  getStoredPasswordForUser,
  requestPasswordResetOtp,
  updateUserPassword,
  verifyPasswordResetOtp,
} from '../../../services/auth.service';
import { typography } from '../../../theme/tokens/typography';

type VerifyMode = 'password' | 'otp';

export const ChangePasswordScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const [mode, setMode] = useState<VerifyMode>('password');

  // Current password mode state
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState('');

  // Mobile OTP mode state
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpEmployeeId, setOtpEmployeeId] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [demoOtpPreview, setDemoOtpPreview] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  // Shared new password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const switchMode = (nextMode: VerifyMode) => {
    if (nextMode === mode) return;
    if (otpEmployeeId) {
      clearPasswordResetOtp(otpEmployeeId);
    }
    setMode(nextMode);
    setCurrentPasswordError('');
    setPhoneError('');
    setOtpError('');
    setNewPasswordError('');
    setConfirmPasswordError('');
    setOtpEmployeeId(null);
    setOtpVerified(false);
    setOtpInput('');
    setDemoOtpPreview('');
    setResendSeconds(0);
  };

  const handleSendOtp = async (isResend = false) => {
    setPhoneError('');
    setOtpError('');

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (!cleanDigits) {
      setPhoneError('Enter your registered mobile number.');
      return;
    }
    if (cleanDigits.length < 7) {
      setPhoneError('Enter a valid mobile number (at least 7 digits).');
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestPasswordResetOtp(
        cleanDigits,
        country.dialCode,
      );
      if (!result.success) {
        setPhoneError(result.error);
        return;
      }

      if (user?.id && result.employee.id !== user.id) {
        clearPasswordResetOtp(result.employee.id);
        setPhoneError('This mobile number does not belong to your account.');
        return;
      }

      setOtpEmployeeId(result.employee.id);
      setMaskedPhone(result.maskedPhone);
      setDemoOtpPreview(result.otp);
      setOtpInput('');
      setOtpVerified(false);
      setResendSeconds(30);

      Alert.alert(
        isResend ? 'OTP Resent' : 'OTP Sent',
        `A 6-digit verification code has been sent to ${result.maskedPhone}.\n\nVerification OTP: ${result.otp}`,
      );
    } catch {
      Alert.alert('Error', 'Could not send OTP right now.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!otpEmployeeId) return;
    setOtpError('');

    const cleanOtp = otpInput.replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setOtpError('Enter the 6-digit OTP.');
      return;
    }

    const result = verifyPasswordResetOtp(otpEmployeeId, cleanOtp);
    if (!result.success) {
      setOtpError(result.error);
      return;
    }
    setOtpVerified(true);
  };

  const validateNewPasswords = (): boolean => {
    setNewPasswordError('');
    setConfirmPasswordError('');

    let hasError = false;
    if (!newPassword.trim()) {
      setNewPasswordError('Enter new password.');
      hasError = true;
    } else if (newPassword.trim().length < 6) {
      setNewPasswordError('Password must be at least 6 characters.');
      hasError = true;
    } else if (
      mode === 'password' &&
      newPassword.trim() === currentPassword.trim()
    ) {
      setNewPasswordError('Must be different from current password.');
      hasError = true;
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Confirm your new password.');
      hasError = true;
    } else if (newPassword.trim() !== confirmPassword.trim()) {
      setConfirmPasswordError('Passwords do not match.');
      hasError = true;
    }

    return !hasError;
  };

  const handleChangePassword = async () => {
    if (mode === 'password') {
      setCurrentPasswordError('');
      let hasError = false;
      if (!currentPassword.trim()) {
        setCurrentPasswordError('Enter current password.');
        hasError = true;
      }
      if (!validateNewPasswords() || hasError) return;

      setIsLoading(true);
      try {
        const empId = user?.id || 'G-1001';
        const userEmail = user?.email || 'john@priority-one.io';
        const actualCurrentPassword = await getStoredPasswordForUser(
          empId,
          userEmail,
        );

        if (currentPassword.trim() !== actualCurrentPassword) {
          setIsLoading(false);
          setCurrentPasswordError('Incorrect current password.');
          return;
        }

        await updateUserPassword(
          {
            id: empId,
            email: userEmail,
            name: user?.name || 'John Smith',
            role: user?.role || 'guard',
          },
          newPassword.trim(),
        );

        Alert.alert('Success', 'Password changed successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to update password.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Mobile OTP mode
    if (!otpEmployeeId || !otpVerified) {
      setOtpError('Verify your mobile OTP first.');
      return;
    }
    if (!validateNewPasswords()) return;

    setIsLoading(true);
    try {
      await completeOtpPasswordReset(
        otpEmployeeId,
        otpInput,
        newPassword.trim(),
      );
      Alert.alert('Success', 'Password changed via Mobile OTP successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <PageHeader
        title="Change Password"
        showBack
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        {/* Mode Switcher */}
        <View
          style={[
            styles.modeSwitchRow,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
              borderRadius: borderRadius.md,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.modeTab,
              mode === 'password' && {
                backgroundColor: colors.primary[600],
                borderRadius: borderRadius.sm,
              },
            ]}
            onPress={() => switchMode('password')}
            activeOpacity={0.8}
          >
            <AppText
              size="sm"
              weight="semibold"
              style={{
                color:
                  mode === 'password' ? colors.textInverse : colors.textSecondary,
              }}
            >
              Current Password
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTab,
              mode === 'otp' && {
                backgroundColor: colors.primary[600],
                borderRadius: borderRadius.sm,
              },
            ]}
            onPress={() => switchMode('otp')}
            activeOpacity={0.8}
          >
            <AppText
              size="sm"
              weight="semibold"
              style={{
                color: mode === 'otp' ? colors.textInverse : colors.textSecondary,
              }}
            >
              Mobile OTP
            </AppText>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: borderRadius.md,
            },
          ]}
        >
          <AppText style={styles.infoText}>
            {mode === 'password'
              ? 'Password must be at least 6 characters long.'
              : 'Verify your registered mobile number with a 6-digit OTP to change your password.'}
          </AppText>

          {mode === 'password' ? (
            <View style={styles.inputGroup}>
              <AppText style={styles.label}>Current Password</AppText>
              <View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: colors.background,
                    borderColor: currentPasswordError
                      ? '#EF4444'
                      : colors.border,
                    borderRadius: borderRadius.md,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (currentPasswordError) setCurrentPasswordError('');
                  }}
                  placeholder="Current password"
                  placeholderTextColor={colors.secondary}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showCurrentPassword ? (
                    <EyeOff size={22} color={colors.primary[600]} />
                  ) : (
                    <Eye size={22} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
              {!!currentPasswordError && (
                <AppText style={styles.errorText}>{currentPasswordError}</AppText>
              )}
            </View>
          ) : (
            <>
              {/* Mobile Number Input */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Registered Mobile Number</AppText>
                <View
                  style={[
                    styles.phoneWrapper,
                    {
                      backgroundColor: colors.background,
                      borderColor: phoneError ? '#EF4444' : colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setCountryPickerVisible(true)}
                    disabled={otpVerified}
                    style={[
                      styles.countryPickerBtn,
                      { borderRightColor: colors.border },
                    ]}
                  >
                    <AppText style={styles.flagText}>{country.flag}</AppText>
                    <AppText size="sm" weight="semibold" style={{ color: colors.text }}>
                      {country.dialCode}
                    </AppText>
                    <ChevronDown size={14} color={colors.secondary} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, styles.phoneTextInput, { color: colors.text }]}
                    keyboardType="phone-pad"
                    maxLength={15}
                    editable={!otpVerified}
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text.replace(/\D/g, ''));
                      if (phoneError) setPhoneError('');
                    }}
                    placeholder="Enter mobile number"
                    placeholderTextColor={colors.secondary}
                  />
                </View>
                {!!phoneError && (
                  <AppText style={styles.errorText}>{phoneError}</AppText>
                )}

                {!otpVerified && (
                  <View style={styles.otpActionSpacing}>
                    <Button
                      title={
                        otpEmployeeId
                          ? resendSeconds > 0
                            ? `Resend OTP (${resendSeconds}s)`
                            : 'Resend OTP'
                          : 'Send OTP'
                      }
                      variant="outline"
                      size="medium"
                      fullWidth
                      disabled={isLoading || (!!otpEmployeeId && resendSeconds > 0)}
                      onPress={() => handleSendOtp(Boolean(otpEmployeeId))}
                    />
                  </View>
                )}
              </View>

              {!!otpEmployeeId && !otpVerified && (
                <View style={styles.inputGroup}>
                  {!!demoOtpPreview && (
                    <View
                      style={[
                        styles.otpBanner,
                        {
                          backgroundColor: colors.primary[50],
                          borderColor: colors.primary[200],
                          borderRadius: borderRadius.md,
                        },
                      ]}
                    >
                      <View style={styles.otpBannerLeft}>
                        <MessageSquareCode size={18} color={colors.primary[600]} />
                        <AppText size="sm" weight="semibold" color="primary">
                          OTP ({maskedPhone}): {demoOtpPreview}
                        </AppText>
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          setOtpInput(demoOtpPreview);
                          if (otpError) setOtpError('');
                        }}
                      >
                        <AppText size="xs" weight="semibold" color="link">
                          Auto-fill
                        </AppText>
                      </TouchableOpacity>
                    </View>
                  )}

                  <AppText style={styles.label}>Enter 6-Digit OTP</AppText>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: colors.background,
                        borderColor: otpError ? '#EF4444' : colors.border,
                        borderRadius: borderRadius.md,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otpInput}
                      onChangeText={(text) => {
                        setOtpInput(text.replace(/\D/g, '').slice(0, 6));
                        if (otpError) setOtpError('');
                      }}
                      placeholder="6-digit OTP"
                      placeholderTextColor={colors.secondary}
                    />
                  </View>
                  {!!otpError && (
                    <AppText style={styles.errorText}>{otpError}</AppText>
                  )}

                  <View style={styles.otpActionSpacing}>
                    <Button
                      title="Verify OTP"
                      size="medium"
                      fullWidth
                      onPress={handleVerifyOtp}
                    />
                  </View>
                </View>
              )}

              {otpVerified && (
                <View
                  style={[
                    styles.verifiedBanner,
                    {
                      backgroundColor: colors.primary[50],
                      borderColor: colors.primary[200],
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <AppText size="sm" weight="semibold" color="primary">
                    OTP verified for {maskedPhone}
                  </AppText>
                </View>
              )}
            </>
          )}

          {(mode === 'password' || otpVerified) && (
            <>
              {/* New Password Field */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>New Password</AppText>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.background,
                      borderColor: newPasswordError ? '#EF4444' : colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (newPasswordError) setNewPasswordError('');
                    }}
                    placeholder="New password (min 6 chars)"
                    placeholderTextColor={colors.secondary}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showNewPassword ? (
                      <EyeOff size={22} color={colors.primary[600]} />
                    ) : (
                      <Eye size={22} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                {!!newPasswordError && (
                  <AppText style={styles.errorText}>{newPasswordError}</AppText>
                )}
              </View>

              {/* Confirm New Password Field */}
              <View style={styles.inputGroup}>
                <AppText style={styles.label}>Confirm New Password</AppText>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.background,
                      borderColor: confirmPasswordError
                        ? '#EF4444'
                        : colors.border,
                      borderRadius: borderRadius.md,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (confirmPasswordError) setConfirmPasswordError('');
                    }}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.secondary}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={22} color={colors.primary[600]} />
                    ) : (
                      <Eye size={22} color={colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>
                {!!confirmPasswordError && (
                  <AppText style={styles.errorText}>
                    {confirmPasswordError}
                  </AppText>
                )}
              </View>

              <View style={{ marginTop: spacing.lg }}>
                <Button
                  title={isLoading ? 'Updating...' : 'Update Password'}
                  onPress={handleChangePassword}
                  disabled={isLoading}
                  size="large"
                  fullWidth
                  style={styles.updateButton}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <CountryCodePickerModal
        visible={countryPickerVisible}
        onClose={() => setCountryPickerVisible(false)}
        onSelect={(selected) => setCountry(selected)}
        selectedDialCode={country.dialCode}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  modeSwitchRow: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  modeTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
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
  phoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 56,
    paddingRight: 12,
  },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: '100%',
    borderRightWidth: 1,
  },
  flagText: {
    fontSize: 18,
  },
  phoneTextInput: {
    paddingHorizontal: 10,
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
  otpActionSpacing: {
    marginTop: 12,
  },
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  otpBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  verifiedBanner: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  updateButton: {
    minHeight: 60,
  },
});
