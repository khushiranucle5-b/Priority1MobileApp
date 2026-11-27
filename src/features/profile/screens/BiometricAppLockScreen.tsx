import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { useAuthStore } from '../../../store/useAuthStore';
import {
  BIOMETRIC_TEST_SERVICE,
  BiometricRegistrationMeta,
  clearBiometricRegistration,
  getBiometricLabel,
  getBiometricRegistration,
  getSupportedBiometryType,
  registerBiometric,
} from '../../../services/biometric.service';
import { typography } from '../../../theme/tokens/typography';

export const BiometricAppLockScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  const { biometricLockEnabled, setBiometricLockEnabled } = useSettingsStore();
  const user = useAuthStore((state) => state.user);

  const [biometryType, setBiometryType] =
    useState<Keychain.BIOMETRY_TYPE | null>(null);
  const [biometricMeta, setBiometricMeta] =
    useState<BiometricRegistrationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadBiometricStatus = useCallback(async () => {
    try {
      const [type, meta] = await Promise.all([
        getSupportedBiometryType(),
        getBiometricRegistration(),
      ]);
      setBiometryType(type);
      setBiometricMeta(meta);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBiometricStatus();
  }, [loadBiometricStatus]);

  const biometricName = getBiometricLabel(biometryType);

  const handleRegisterForCurrentUser = async () => {
    if (!user) {
      Alert.alert('Error', 'No active user session found.');
      return;
    }
    setActionLoading(true);
    try {
      const meta = await registerBiometric(user);
      setBiometricMeta(meta);
      Alert.alert(
        'Biometric Registered',
        `${biometricName} sign-in is now registered for ${meta.name} (${meta.employeeId}). You can use Quick Biometric Sign-In on the login screen.`,
      );
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error?.message || 'Could not register biometric sign-in.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveRegistration = () => {
    Alert.alert(
      'Remove Biometric Sign-In',
      'Remove saved biometric credentials from this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await clearBiometricRegistration();
              setBiometricMeta(null);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleTestBiometrics = async () => {
    try {
      await Keychain.setGenericPassword('verify', 'verify', {
        service: BIOMETRIC_TEST_SERVICE,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        authenticationPrompt: { title: 'Verify Identity', cancel: 'Cancel' },
      });
      const result = await Keychain.getGenericPassword({
        service: BIOMETRIC_TEST_SERVICE,
        authenticationPrompt: { title: 'Verify Identity', cancel: 'Cancel' },
      });
      await Keychain.resetGenericPassword({ service: BIOMETRIC_TEST_SERVICE });
      if (result) {
        Alert.alert('Verified', `${biometricName} verification succeeded.`);
      }
    } catch {
      await Keychain.resetGenericPassword({
        service: BIOMETRIC_TEST_SERVICE,
      }).catch(() => {});
    }
  };

  return (
    <ScreenLayout>
      <PageHeader
        title="Biometric / App Lock"
        showBack
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary[500]}
            style={styles.loader}
          />
        ) : (
          <>
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
              <AppText style={styles.icon}>
                {biometryType ? '🛡️' : '⚠️'}
              </AppText>

              <AppText style={[styles.title, { color: colors.text }]}>
                {biometryType
                  ? `${biometricName} Hardware Detected`
                  : 'Biometrics Not Available'}
              </AppText>

              <AppText style={[styles.description, { color: colors.textSecondary }]}>
                {biometryType
                  ? `Your device supports ${biometricName}. Register your biometrics below to sign in quickly without entering your password.`
                  : 'No biometric hardware was detected or biometrics are not enrolled in device settings.'}
              </AppText>

              {biometryType && (
                <View style={styles.actionsWrapper}>
                  <View
                    style={[
                      styles.statusBox,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        borderColor: colors.border,
                        borderRadius: borderRadius.md,
                      },
                    ]}
                  >
                    <AppText size="sm" weight="semibold" color="primary">
                      {biometricMeta
                        ? `Registered: ${biometricMeta.name} (${biometricMeta.employeeId})`
                        : 'Biometric Sign-In Not Registered'}
                    </AppText>
                    <AppText size="xs" color="secondary" style={styles.statusSubtext}>
                      {biometricMeta
                        ? `Linked email: ${biometricMeta.email}`
                        : 'Register your current account to enable Quick Biometric Sign-In.'}
                    </AppText>
                  </View>

                  <Button
                    title={
                      biometricMeta
                        ? `Re-register ${biometricName} Sign-In`
                        : `Register ${biometricName} Sign-In`
                    }
                    size="large"
                    fullWidth
                    isLoading={actionLoading}
                    style={styles.registerBtn}
                    onPress={handleRegisterForCurrentUser}
                  />

                  {biometricMeta && (
                    <Button
                      title="Remove Biometric Registration"
                      variant="outline"
                      size="medium"
                      fullWidth
                      disabled={actionLoading}
                      onPress={handleRemoveRegistration}
                    />
                  )}

                  <Button
                    title="Test Biometric Verification"
                    variant="secondary"
                    size="medium"
                    fullWidth
                    onPress={handleTestBiometrics}
                  />
                </View>
              )}
            </View>

            <View
              style={[
                styles.toggleRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md,
                },
              ]}
            >
              <View style={styles.toggleTextWrapper}>
                <AppText style={[styles.toggleTitle, { color: colors.text }]}>
                  Require Biometric Lock
                </AppText>
                <AppText style={[styles.toggleSub, { color: colors.textSecondary }]}>
                  Prompt for biometric authentication when resuming active session.
                </AppText>
              </View>
              <Switch
                value={biometricLockEnabled}
                onValueChange={setBiometricLockEnabled}
                trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
                thumbColor="#FFFFFF"
                style={{ transform: [{ scaleX: 1.25 }, { scaleY: 1.25 }] }}
              />
            </View>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  loader: {
    marginTop: 40,
  },
  actionsWrapper: {
    marginTop: 18,
    width: '100%',
    gap: 12,
  },
  statusSubtext: {
    marginTop: 4,
  },
  registerBtn: {
    minHeight: 56,
  },
  toggleTextWrapper: {
    flex: 1,
    paddingRight: 16,
  },
  card: {
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    marginTop: 14,
  },
  statusBox: {
    width: '100%',
    borderWidth: 1,
    padding: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    marginTop: 16,
    minHeight: 60,
  },
  toggleTitle: {
    ...typography.presets.body,
    fontWeight: '600',
  },
  toggleSub: {
    ...typography.presets.helper,
    lineHeight: 22,
    marginTop: 4,
  },
  icon: {
    fontSize: 54,
    marginBottom: 16,
  },
  title: {
    ...typography.presets.cardTitle,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    ...typography.presets.label,
    lineHeight: 24,
    textAlign: 'center',
  },
});
