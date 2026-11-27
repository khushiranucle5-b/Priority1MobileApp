import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  InteractionManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Keychain from 'react-native-keychain';
import { Eye, EyeOff, X } from 'lucide-react-native';
import { AuthLayout } from '../../../layouts/AuthLayout';
import {
  AppText,
  BiometricsButton,
  Button,
  CompanyLogo,
  Heading,
  Input,
} from '../../../components';
import { useTheme } from '../../../providers/ThemeProvider';
import { CONFIG } from '../../../constants/config';
import { a11yButton, a11yHidden, a11yInput } from '../../../utils/accessibility';
import { normalize } from '../../../utils/responsive';
import { useAuthStore } from '../../../store/useAuthStore';
import { AuthStackParamList } from '../../../types/navigation.types';
import { authenticateWithPassword } from '../../../services/auth.service';
import {
  BiometricRegistrationMeta,
  clearBiometricRegistration,
  fetchBiometricUser,
  getBiometricLabel,
  getBiometricRegistration,
  getSupportedBiometryType,
  registerBiometric,
} from '../../../services/biometric.service';

export const LoginScreen: React.FC = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const login = useAuthStore((state) => state.login);
  const isMountedRef = useRef(true);
  const autoPromptStartedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Biometric state
  const [biometryType, setBiometryType] =
    useState<Keychain.BIOMETRY_TYPE | null>(null);
  const [biometricMeta, setBiometricMeta] =
    useState<BiometricRegistrationMeta | null>(null);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  // Biometric registration modal state
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regEmailError, setRegEmailError] = useState('');
  const [regPasswordError, setRegPasswordError] = useState('');
  const [isRegisteringBiometric, setIsRegisteringBiometric] = useState(false);

  const refreshBiometricState = useCallback(async () => {
    const [type, meta] = await Promise.all([
      getSupportedBiometryType(),
      getBiometricRegistration(),
    ]);
    if (isMountedRef.current) {
      setBiometryType(type);
      setBiometricMeta(meta);
    }
    return { type, meta };
  }, []);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(async () => {
      const { type, meta } = await refreshBiometricState();
      const { shouldAutoPromptBiometric, consumeAutoBiometricPrompt } =
        useAuthStore.getState();

      if (
        !isMountedRef.current ||
        autoPromptStartedRef.current ||
        !shouldAutoPromptBiometric ||
        !type ||
        !meta
      ) {
        return;
      }

      autoPromptStartedRef.current = true;
      consumeAutoBiometricPrompt();
      setIsBiometricLoading(true);
      try {
        const user = await fetchBiometricUser();
        if (isMountedRef.current) {
          await login(user, 'mock-access-token', 'mock-refresh-token');
        }
      } catch {
        // User cancelled or dismissed startup biometric prompt; keep LoginScreen interactive
      } finally {
        if (isMountedRef.current) {
          setIsBiometricLoading(false);
        }
      }
    });

    return () => {
      task.cancel();
    };
  }, [login, refreshBiometricState]);

  useFocusEffect(
    useCallback(() => {
      refreshBiometricState();
    }, [refreshBiometricState]),
  );

  const biometryLabel = getBiometricLabel(biometryType);

  const handleSignIn = async () => {
    setEmailError('');
    setPasswordError('');

    let valid = true;
    if (!email.trim()) {
      setEmailError('Employee ID or Email is required');
      valid = false;
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      valid = false;
    }
    if (!valid) return;

    setIsLoading(true);
    try {
      const result = await authenticateWithPassword(email, password);
      if (!result.success) {
        Alert.alert('Login Failed', result.error);
        return;
      }

      await login(result.user, 'mock-access-token', 'mock-refresh-token');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An error occurred during sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword', {
      identifier: email.trim() || undefined,
    });
  };

  const openBiometricRegisterModal = () => {
    setRegEmail(email.trim());
    setRegPassword(password);
    setRegEmailError('');
    setRegPasswordError('');
    setShowRegPassword(false);
    setRegisterModalVisible(true);
  };

  const handleRegisterBiometricSubmit = async () => {
    setRegEmailError('');
    setRegPasswordError('');

    let valid = true;
    if (!regEmail.trim()) {
      setRegEmailError('Employee ID or Email is required');
      valid = false;
    }
    if (!regPassword.trim()) {
      setRegPasswordError('Password is required');
      valid = false;
    }
    if (!valid) return;

    setIsRegisteringBiometric(true);
    try {
      const authResult = await authenticateWithPassword(regEmail, regPassword);
      if (!authResult.success) {
        Alert.alert('Verification Failed', authResult.error);
        return;
      }

      const meta = await registerBiometric(authResult.user);
      setBiometricMeta(meta);
      setRegisterModalVisible(false);

      Alert.alert(
        'Biometric Registered',
        `${biometryLabel} sign-in is now registered for ${meta.name} (${meta.employeeId}). Tap "Quick Biometric Sign-In" to fetch your credentials and sign in.`,
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error?.message ||
          'Biometric registration was cancelled or could not be completed.',
      );
    } finally {
      setIsRegisteringBiometric(false);
    }
  };

  const handleBiometricSignIn = async () => {
    if (isBiometricLoading) return;

    if (!biometryType) {
      Alert.alert(
        'Biometrics Unavailable',
        'No Fingerprint or Face ID hardware is enrolled on this device. Please enable biometrics in your device settings.',
      );
      return;
    }

    if (!biometricMeta) {
      openBiometricRegisterModal();
      return;
    }

    setIsBiometricLoading(true);
    try {
      const user = await fetchBiometricUser();
      await login(user, 'mock-access-token', 'mock-refresh-token');
    } catch (error: any) {
      const message = error?.message || 'Biometric sign-in failed.';
      Alert.alert('Biometric Sign-In', message);
      await refreshBiometricState();
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleRemoveBiometric = () => {
    Alert.alert(
      'Remove Biometric Sign-In',
      `Remove registered ${biometryLabel} credentials for ${biometricMeta?.name || 'this account'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await clearBiometricRegistration();
            setBiometricMeta(null);
          },
        },
      ],
    );
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const renderEyeIcon = (visible: boolean) =>
    visible ? (
      <EyeOff size={20} color={colors.primary[600]} />
    ) : (
      <Eye size={20} color={colors.textSecondary} />
    );

  const biometricButtonTitle = biometricMeta
    ? 'Quick Biometric Sign-In'
    : `Register ${biometryLabel} Sign-In`;

  const biometricButtonSubtitle = !biometryType
    ? 'Biometrics not available or not enrolled on device'
    : biometricMeta
      ? `Registered: ${biometricMeta.name} (${biometricMeta.employeeId}) • Tap to login`
      : `First-time setup: verify credentials & save ${biometryLabel}`;

  return (
    <AuthLayout>
      <View style={styles.container}>
        {/* Top Header / Branding */}
        <CompanyLogo />

        {/* Welcome Text */}
        {/* <View style={[styles.welcomeSection, { marginBottom: spacing.xl }]}>
          <Heading level="h2" style={styles.title}>
            Welcome Back
          </Heading>
          <AppText size="md" color="secondary" style={styles.subtitle}>
            Sign in to continue to your workspace
          </AppText>
        </View> */}

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Employee ID / Email Input */}
          <Input
            label="Employee ID or Email"
            placeholder="e.g. G-1001 or john@priority-one.io"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            error={emailError}
            {...a11yInput(
              'Employee ID or Email',
              'Enter your employee identification number or email address',
            )}
          />

          {/* Password Input with Show/Hide Toggle */}
          <Input
            label="Password"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (passwordError) setPasswordError('');
            }}
            error={passwordError}
            rightIcon={
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={styles.eyeButton}
                activeOpacity={0.7}
                {...a11yButton(
                  showPassword ? 'Hide password' : 'Show password',
                  'Toggles password text visibility',
                )}
              >
                {renderEyeIcon(showPassword)}
              </TouchableOpacity>
            }
            {...a11yInput('Password', 'Enter your account password')}
          />

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={handleForgotPassword}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              {...a11yButton(
                'Forgot Password',
                'Navigates to password recovery and change password screen',
              )}
            >
              <AppText size="sm" weight="semibold" color="link">
                Forgot Password?
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Primary Sign In Button */}
          <Button
            title="Sign In"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleSignIn}
            isLoading={isLoading}
            style={styles.signInButton}
          />
        </View>

        {/* Divider */}
        <View
          style={[styles.dividerRow, { marginVertical: spacing.xl }]}
          {...a11yHidden()}
        >
          <View
            style={[styles.dividerLine, { backgroundColor: colors.border }]}
          />
          <AppText size="xs" color="tertiary" style={styles.dividerText}>
            OR
          </AppText>
          <View
            style={[styles.dividerLine, { backgroundColor: colors.border }]}
          />
        </View>

        {/* Biometric Register / Sign-In Section */}
        <View style={styles.biometricsSection}>
          <BiometricsButton
            onPress={handleBiometricSignIn}
            title={biometricButtonTitle}
            subtitle={biometricButtonSubtitle}
            isRegistered={!!biometricMeta}
            isLoading={isBiometricLoading}
          />

          {biometricMeta && (
            <View style={styles.biometricActionsRow}>
              <TouchableOpacity
                onPress={openBiometricRegisterModal}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <AppText size="xs" weight="semibold" color="link">
                  Re-register Account
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRemoveBiometric}
                activeOpacity={0.7}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <AppText size="xs" weight="semibold" color="error">
                  Remove Biometric
                </AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer / App Version */}
        <View style={[styles.footer, { marginTop: spacing['2xl'] }]}>
          <AppText size="xs" color="tertiary" style={styles.versionText}>
            App Version v{CONFIG.APP_VERSION}
          </AppText>
        </View>
      </View>

      {/* First-Time Biometric Registration Modal */}
      <Modal
        visible={registerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRegisterModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: borderRadius.lg,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Heading level="h3">Register {biometryLabel}</Heading>
                <AppText size="xs" color="secondary" style={styles.modalSubtext}>
                  Verify your account credentials first to register{' '}
                  {biometryLabel.toLowerCase()} for future sign-in.
                </AppText>
              </View>
              <TouchableOpacity
                onPress={() => setRegisterModalVisible(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Input
              label="Employee ID or Email"
              placeholder="e.g. G-1001 or john@priority-one.io"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={regEmail}
              onChangeText={(text) => {
                setRegEmail(text);
                if (regEmailError) setRegEmailError('');
              }}
              error={regEmailError}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={!showRegPassword}
              autoCapitalize="none"
              autoCorrect={false}
              value={regPassword}
              onChangeText={(text) => {
                setRegPassword(text);
                if (regPasswordError) setRegPasswordError('');
              }}
              error={regPasswordError}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowRegPassword((prev) => !prev)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  {renderEyeIcon(showRegPassword)}
                </TouchableOpacity>
              }
            />

            <Button
              title={`Verify & Register ${biometryLabel}`}
              variant="primary"
              size="large"
              fullWidth
              isLoading={isRegisteringBiometric}
              onPress={handleRegisterBiometricSubmit}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'stretch',
  },
  welcomeSection: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: normalize(4),
  },
  subtitle: {
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  eyeButton: {
    padding: normalize(4),
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: normalize(20),
    marginTop: normalize(-4),
  },
  signInButton: {
    marginTop: normalize(4),
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: normalize(12),
    letterSpacing: 1,
  },
  biometricsSection: {
    width: '100%',
  },
  biometricActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(10),
    paddingHorizontal: normalize(4),
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: normalize(20),
  },
  modalCard: {
    borderWidth: 1,
    padding: normalize(20),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: normalize(16),
  },
  modalHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  modalSubtext: {
    marginTop: 4,
  },
  closeBtn: {
    padding: normalize(4),
  },
});
