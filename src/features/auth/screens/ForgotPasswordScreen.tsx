import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  ChevronDown,
  Eye,
  EyeOff,
  Phone,
} from 'lucide-react-native';
import { AuthLayout } from '../../../layouts/AuthLayout';
import {
  AppText,
  Button,
  CountryCodePickerModal,
  Heading,
  Input,
} from '../../../components';
import { useTheme } from '../../../providers/ThemeProvider';
import { AuthStackParamList } from '../../../types/navigation.types';
import { CountryCode, DEFAULT_COUNTRY } from '../../../constants/countryCodes';
import { DBEmployee } from '../../../services/db';
import {
  clearPasswordResetOtp,
  completeOtpPasswordReset,
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
} from '../../../services/auth.service';
import { a11yButton, a11yInput } from '../../../utils/accessibility';
import { normalize } from '../../../utils/responsive';

type ResetStep = 'phone' | 'otp' | 'reset';

export const ForgotPasswordScreen: React.FC = () => {
  const { colors, spacing, borderRadius, typography } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const [step, setStep] = useState<ResetStep>('phone');
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const [verifiedEmployee, setVerifiedEmployee] = useState<DBEmployee | null>(
    null,
  );
  const [maskedPhone, setMaskedPhone] = useState('');
  const [demoOtpPreview, setDemoOtpPreview] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);

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

  const sendOtpToPhone = async (isResend = false) => {
    setPhoneError('');
    setOtpError('');

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (!cleanDigits) {
      setPhoneError('Enter your mobile number.');
      return;
    }
    if (cleanDigits.length < 7) {
      setPhoneError('Enter a valid mobile number.');
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

      setVerifiedEmployee(result.employee);
      setMaskedPhone(result.maskedPhone);
      setDemoOtpPreview(result.otp);
      setOtpInput('');
      setResendSeconds(30);
      setStep('otp');

      Alert.alert(
        isResend ? 'OTP Resent' : 'OTP Sent',
        `OTP for ${result.maskedPhone}: ${result.otp}`,
      );
    } catch {
      Alert.alert('Error', 'Could not send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = () => {
    if (!verifiedEmployee) return;
    setOtpError('');

    const cleanOtp = otpInput.replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setOtpError('Enter the 6-digit OTP.');
      return;
    }

    const result = verifyPasswordResetOtp(verifiedEmployee.id, cleanOtp);
    if (!result.success) {
      setOtpError(result.error);
      return;
    }

    setStep('reset');
  };

  const handleChangePhone = () => {
    if (verifiedEmployee) {
      clearPasswordResetOtp(verifiedEmployee.id);
    }
    setStep('phone');
    setVerifiedEmployee(null);
    setOtpInput('');
    setOtpError('');
    setDemoOtpPreview('');
    setResendSeconds(0);
    setNewPassword('');
    setConfirmPassword('');
    setNewPasswordError('');
    setConfirmPasswordError('');
  };

  const handleResetPassword = async () => {
    if (!verifiedEmployee) return;

    setNewPasswordError('');
    setConfirmPasswordError('');

    let valid = true;
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedNew) {
      setNewPasswordError('Enter a new password.');
      valid = false;
    } else if (trimmedNew.length < 6) {
      setNewPasswordError('Minimum 6 characters required.');
      valid = false;
    }

    if (!trimmedConfirm) {
      setConfirmPasswordError('Confirm your new password.');
      valid = false;
    } else if (trimmedNew !== trimmedConfirm) {
      setConfirmPasswordError('Passwords do not match.');
      valid = false;
    }

    if (!valid) return;

    setIsLoading(true);
    try {
      await completeOtpPasswordReset(
        verifiedEmployee.id,
        otpInput,
        trimmedNew,
      );

      Alert.alert('Password Changed', 'Sign in with your new password.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (step === 'otp') return 'Verify OTP';
    if (step === 'reset') return 'New Password';
    return 'Forgot Password';
  };

  const topBar = (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.backRow}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      {...a11yButton('Back to Sign In', 'Returns to the login screen')}
    >
      <ArrowLeft size={20} color={colors.primary[600]} strokeWidth={2.2} />
      <AppText size="sm" weight="semibold" color="link" style={styles.backText}>
        Back to Sign In
      </AppText>
    </TouchableOpacity>
  );

  return (
    <AuthLayout header={topBar}>
      <View style={styles.container}>
        <View style={styles.stepIndicatorRow}>
          {(['phone', 'otp', 'reset'] as ResetStep[]).map((item, idx) => {
            const currentIdx = ['phone', 'otp', 'reset'].indexOf(step);
            const active = idx <= currentIdx;
            return (
              <View
                key={item}
                style={[
                  styles.stepBar,
                  {
                    backgroundColor: active
                      ? colors.primary[600]
                      : colors.border,
                  },
                ]}
              />
            );
          })}
        </View>

        <Heading level="h2" style={[styles.title, { marginBottom: spacing.lg }]}>
          {getTitle()}
        </Heading>

        {step === 'phone' && (
          <View style={styles.formContainer}>
            <AppText
              size="sm"
              weight="medium"
              style={[styles.fieldLabel, { color: colors.text }]}
            >
              Mobile Number
            </AppText>

            <View
              style={[
                styles.phoneInputWrap,
                {
                  backgroundColor: colors.surface,
                  borderColor: phoneError ? colors.error : colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setCountryPickerVisible(true)}
                style={[
                  styles.countryPickerBtn,
                  { borderRightColor: colors.border },
                ]}
                {...a11yButton('Select Country Code')}
              >
                <AppText style={styles.flagText}>{country.flag}</AppText>
                <AppText
                  size="base"
                  weight="semibold"
                  style={{ color: colors.text }}
                >
                  {country.dialCode}
                </AppText>
                <ChevronDown size={14} color={colors.textSecondary} />
              </TouchableOpacity>

              <TextInput
                style={[
                  styles.phoneInput,
                  {
                    color: colors.text,
                    fontSize: typography.fontSize.base,
                  },
                ]}
                placeholder="Enter mobile number"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
                maxLength={15}
                value={phoneNumber}
                onChangeText={(text) => {
                  setPhoneNumber(text.replace(/\D/g, ''));
                  if (phoneError) setPhoneError('');
                }}
                {...a11yInput('Mobile Number', 'Enter your mobile number')}
              />

              <Phone size={18} color={colors.textTertiary} />
            </View>

            {!!phoneError && (
              <AppText
                size="xs"
                style={[styles.errorText, { color: colors.error }]}
              >
                {phoneError}
              </AppText>
            )}

            <Button
              title="Send OTP"
              variant="primary"
              size="large"
              fullWidth
              onPress={() => sendOtpToPhone(false)}
              isLoading={isLoading}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        )}

        {step === 'otp' && verifiedEmployee && (
          <View style={styles.formContainer}>
            <View style={styles.otpMetaRow}>
              <AppText size="sm" color="secondary">
                {maskedPhone}
              </AppText>
              <TouchableOpacity onPress={handleChangePhone} activeOpacity={0.7}>
                <AppText size="xs" weight="semibold" color="link">
                  Change
                </AppText>
              </TouchableOpacity>
            </View>

            {!!demoOtpPreview && (
              <View
                style={[
                  styles.otpBanner,
                  {
                    backgroundColor: colors.primary[50],
                    borderColor: colors.primary[200],
                    borderRadius: borderRadius.md,
                    marginBottom: spacing.base,
                  },
                ]}
              >
                <AppText size="sm" weight="bold" color="primary">
                  OTP: {demoOtpPreview}
                </AppText>
                <TouchableOpacity
                  onPress={() => {
                    setOtpInput(demoOtpPreview);
                    if (otpError) setOtpError('');
                  }}
                  activeOpacity={0.7}
                >
                  <AppText size="xs" weight="semibold" color="link">
                    Auto-fill
                  </AppText>
                </TouchableOpacity>
              </View>
            )}

            <Input
              label="OTP"
              placeholder="Enter 6-digit OTP"
              keyboardType="number-pad"
              maxLength={6}
              returnKeyType="done"
              value={otpInput}
              onChangeText={(text) => {
                setOtpInput(text.replace(/\D/g, '').slice(0, 6));
                if (otpError) setOtpError('');
              }}
              error={otpError}
              {...a11yInput('OTP', 'Enter 6-digit OTP')}
            />

            <View style={styles.resendRow}>
              {resendSeconds > 0 ? (
                <AppText size="xs" color="tertiary">
                  Resend in {resendSeconds}s
                </AppText>
              ) : (
                <TouchableOpacity
                  onPress={() => sendOtpToPhone(true)}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <AppText size="xs" weight="semibold" color="link">
                    Resend OTP
                  </AppText>
                </TouchableOpacity>
              )}
            </View>

            <Button
              title="Verify OTP"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleVerifyOtp}
              isLoading={isLoading}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

        {step === 'reset' && verifiedEmployee && (
          <View style={styles.formContainer}>
            <Input
              label="New Password"
              placeholder="Minimum 6 characters"
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                if (newPasswordError) setNewPasswordError('');
              }}
              error={newPasswordError}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowNewPassword((prev) => !prev)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                  {...a11yButton(
                    showNewPassword ? 'Hide new password' : 'Show new password',
                  )}
                >
                  {showNewPassword ? (
                    <EyeOff size={20} color={colors.primary[600]} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              }
            />

            <Input
              label="Confirm Password"
              placeholder="Re-enter new password"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              error={confirmPasswordError}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                  {...a11yButton(
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password',
                  )}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.primary[600]} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              }
            />

            <Button
              title="Change Password"
              variant="primary"
              size="large"
              fullWidth
              onPress={handleResetPassword}
              isLoading={isLoading}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}
      </View>

      <CountryCodePickerModal
        visible={countryPickerVisible}
        onClose={() => setCountryPickerVisible(false)}
        onSelect={(selected) => setCountry(selected)}
        selectedDialCode={country.dialCode}
      />
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'stretch',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: normalize(4),
  },
  backText: {
    marginLeft: 6,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    gap: normalize(8),
    marginBottom: normalize(16),
  },
  stepBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  title: {
    textAlign: 'left',
  },
  formContainer: {
    width: '100%',
  },
  fieldLabel: {
    marginBottom: normalize(6),
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    minHeight: 56,
    paddingRight: normalize(14),
  },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: normalize(12),
    height: '100%',
    borderRightWidth: 1,
  },
  flagText: {
    fontSize: 18,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: normalize(12),
    paddingVertical: 14,
    includeFontPadding: false,
  },
  errorText: {
    marginTop: 4,
  },
  otpMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(12),
  },
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(10),
  },
  resendRow: {
    alignItems: 'flex-end',
    marginTop: normalize(-4),
    marginBottom: normalize(8),
  },
  eyeButton: {
    padding: normalize(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
