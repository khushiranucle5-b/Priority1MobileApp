import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Keychain from 'react-native-keychain';
import { ScreenLayout } from '../../../layouts/ScreenLayout';
import { PageHeader } from '../../../components/PageHeader';
import { AppText } from '../../../components/typography/Text';
import { useTheme } from '../../../providers/ThemeProvider';
import { Button } from '../../../components/Button';

export const BiometricAppLockScreen = () => {
  const { colors, spacing, borderRadius } = useTheme();
  const navigation = useNavigation();
  
  const [biometryType, setBiometryType] = useState<Keychain.BIOMETRY_TYPE | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    try {
      const type = await Keychain.getSupportedBiometryType();
      setBiometryType(type);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getBiometricName = () => {
    if (biometryType === Keychain.BIOMETRY_TYPE.FACE_ID) return 'Face ID';
    if (biometryType === Keychain.BIOMETRY_TYPE.TOUCH_ID) return 'Touch ID';
    if (biometryType === Keychain.BIOMETRY_TYPE.FINGERPRINT) return 'Fingerprint';
    if (biometryType === Keychain.BIOMETRY_TYPE.FACE) return 'Face Unlock';
    if (biometryType === Keychain.BIOMETRY_TYPE.IRIS) return 'Iris Scanner';
    return 'Biometrics';
  };

  return (
    <ScreenLayout>
      <PageHeader title="Biometric / App Lock" showBack onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={[styles.container, { padding: spacing.md }]}>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginTop: 40 }} />
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
            <AppText style={styles.icon}>
              {biometryType ? '🛡️' : '⚠️'}
            </AppText>
            
            <AppText size="lg" weight="bold" style={styles.title}>
              {biometryType ? `${getBiometricName()} Supported` : 'Biometrics Not Available'}
            </AppText>
            
            <AppText size="base" color="secondary" style={styles.description}>
              {biometryType 
                ? `Your device supports ${getBiometricName()}. The application currently delegates biometric authentication to the login screen and session manager.`
                : 'No biometric hardware was detected or permissions were not granted at the device level.'}
            </AppText>

            {biometryType && (
              <View style={{ marginTop: 20 }}>
                <Button 
                  title="Verify Biometric Now" 
                  onPress={async () => {
                    // Demonstrate actual capability without creating fake persistence for an unbuilt guard
                    await Keychain.setGenericPassword('temp', 'temp', {
                      accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
                      authenticationPrompt: { title: 'Verify Identity' }
                    });
                    await Keychain.getGenericPassword({
                      authenticationPrompt: { title: 'Verify Identity' }
                    });
                  }} 
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  card: {
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  }
});
