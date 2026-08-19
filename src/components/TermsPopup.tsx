import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppText } from './typography/Text';
import { Button } from './Button';
import { useTheme } from '../providers/ThemeProvider';
import { useAuthStore } from '../store/useAuthStore';

const TERMS_VERSION = '1.0';

export const TermsPopup = () => {
  const { colors, borderRadius, spacing } = useTheme();
  const user = useAuthStore(state => state.user);
  
  const [isVisible, setIsVisible] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAcceptance = async () => {
      if (!user?.id) {
        setIsVisible(false);
        setIsChecking(false);
        return;
      }
      
      try {
        const key = `@terms_v${TERMS_VERSION}_${user.id}`;
        const accepted = await AsyncStorage.getItem(key);
        if (accepted !== 'true') {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      } catch (err) {
        console.error('Failed to check terms acceptance:', err);
        setIsVisible(true); // Default to showing if we can't verify
      } finally {
        setIsChecking(false);
      }
    };

    checkAcceptance();
  }, [user?.id]);

  const handleAgree = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const key = `@terms_v${TERMS_VERSION}_${user.id}`;
      await AsyncStorage.setItem(key, 'true');
      setIsVisible(false);
    } catch (err) {
      console.error('Failed to save terms acceptance:', err);
      setError('Failed to save your acceptance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Do not render anything while checking or if the user doesn't need to see it
  if (isChecking || !isVisible) {
    return null;
  }

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={() => {
        // Prevent dismissal via Android hardware back button
      }}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card, borderRadius: borderRadius.lg }]}>
          
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <AppText size="xl" weight="bold" color="text">Terms & Conditions</AppText>
          </View>
          
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            <AppText size="sm" color="text" style={{ marginBottom: spacing.md }}>
              Please read and accept the latest Terms & Conditions for Priority One Security.
            </AppText>
            
            <View style={[styles.termsBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius.md }]}>
              <AppText size="sm" color="secondary" style={{ marginBottom: spacing.sm }}>
                1. Acceptance of Terms
              </AppText>
              <AppText size="xs" color="secondary" style={{ marginBottom: spacing.md }}>
                By accessing or using the Guard Application, you agree to be bound by these terms. This application tracks location data while on duty for lone worker safety and geofence verification.
              </AppText>

              <AppText size="sm" color="secondary" style={{ marginBottom: spacing.sm }}>
                2. Privacy & Location Tracking
              </AppText>
              <AppText size="xs" color="secondary" style={{ marginBottom: spacing.md }}>
                Location tracking is active strictly during your clocked-in hours to ensure safety checks and accurate attendance.
              </AppText>

              <AppText size="sm" color="secondary" style={{ marginBottom: spacing.sm }}>
                3. Responsibilities
              </AppText>
              <AppText size="xs" color="secondary">
                You must accurately log incidents, execute assigned patrols, and maintain confidentiality of site data. Misuse of the application may result in disciplinary action.
              </AppText>
            </View>

            {error && (
              <AppText size="sm" color="error" style={{ marginTop: spacing.md, textAlign: 'center' }}>
                {error}
              </AppText>
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Button
              title={isSaving ? "Saving..." : "I Agree"}
              onPress={handleAgree}
              variant="primary"
              disabled={isSaving}
              style={{ width: '100%' }}
            />
          </View>
          
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 10,
  },
  termsBox: {
    padding: 16,
    borderWidth: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
});
