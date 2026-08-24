import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
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

import { getTable, DBEmployee, DBUser } from '../../../services/db';

export const LoginScreen: React.FC = () => {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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
      const employees = await getTable<DBEmployee>('employees');
      const usersList = await getTable<DBUser>('users');
      const cleanEmail = email.trim().toLowerCase();

      const emp = employees.find(
        (e) =>
          e.email?.trim().toLowerCase() === cleanEmail ||
          e.id?.trim().toLowerCase() === cleanEmail
      );

      if (!emp) {
        setIsLoading(false);
        Alert.alert('Login Failed', 'Invalid credentials. User not found.');
        return;
      }

      // Verify password against stored password in users table
      const userRecord = (usersList || []).find(
        (u) => u.id === emp.id || u.email?.trim().toLowerCase() === cleanEmail
      );
      const validPassword = userRecord?.password || 'demo';

      if (password.trim() !== validPassword) {
        setIsLoading(false);
        Alert.alert('Login Failed', 'Invalid password. Please enter your correct updated password.');
        return;
      }

      const mappedUser = {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        employeeId: emp.id,
        designation: emp.designation,
        role: emp.designation?.toLowerCase().includes('supervisor') ? ('supervisor' as const) : ('guard' as const),
        assignedSite: emp.site || 'Main Gate Site',
      };

      await login(mappedUser, 'mock-access-token', 'mock-refresh-token');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'An error occurred during sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleBiometricSignIn = () => {
    // Biometrics deferred to future phase
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        {/* Top Header / Branding */}
        <CompanyLogo />

        {/* Welcome Text */}
        <View style={[styles.welcomeSection, { marginBottom: spacing.xl }]}>
          <Heading level="h2" style={styles.title}>
            Welcome Back
          </Heading>
          <AppText size="md" color="secondary" style={styles.subtitle}>
            Sign in to continue to your workspace
          </AppText>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Employee ID / Email Input */}
          <Input
            label="Employee ID or Email"
            placeholder="e.g. EMP-10492 or user@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            value={email}
            onChangeText={setEmail}
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
            onChangeText={setPassword}
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
                <View
                  style={[
                    styles.eyeIconOuter,
                    { borderColor: colors.textSecondary },
                  ]}
                >
                  <View
                    style={[
                      styles.eyeIconInner,
                      { backgroundColor: colors.textSecondary },
                    ]}
                  />
                  {showPassword && (
                    <View
                      style={[
                        styles.eyeSlash,
                        { backgroundColor: colors.textSecondary },
                      ]}
                    />
                  )}
                </View>
              </TouchableOpacity>
            }
            {...a11yInput(
              'Password',
              'Enter your account password',
            )}
          />

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={handleForgotPassword}
              activeOpacity={0.7}
              {...a11yButton('Forgot Password', 'Navigates to password recovery screen')}
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
        <View style={[styles.dividerRow, { marginVertical: spacing.xl }]} {...a11yHidden()}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <AppText size="xs" color="tertiary" style={styles.dividerText}>
            OR
          </AppText>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Biometric Placeholder */}
        <View style={styles.biometricsSection}>
          <BiometricsButton onPress={handleBiometricSignIn} />
        </View>

        {/* Footer / App Version */}
        <View style={[styles.footer, { marginTop: spacing['2xl'] }]}>
          <AppText size="xs" color="tertiary" style={styles.versionText}>
            App Version v{CONFIG.APP_VERSION}
          </AppText>
        </View>
      </View>
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
  eyeIconOuter: {
    width: normalize(20),
    height: normalize(12),
    borderRadius: normalize(6),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  eyeIconInner: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
  },
  eyeSlash: {
    position: 'absolute',
    width: normalize(22),
    height: 1.5,
    transform: [{ rotate: '-45deg' }],
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
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
