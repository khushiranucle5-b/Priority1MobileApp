import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Linking,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TriangleAlert, MapPin, Clock, Phone, ArrowRight, X, ShieldAlert, VolumeX } from 'lucide-react-native';
import { AppText } from '../../../components/typography/Text';
import { Heading } from '../../../components/typography/Heading';
import { Button } from '../../../components/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { useGuardStore } from '../../../store/useGuardStore';
import { soundAlertService } from '../../../services/soundAlert.service';
import { navigateToDispatchDetails } from '../../../navigation/navigationService';
import { DBDispatch } from '../../../services/db';

interface EmergencyDispatchAlertModalProps {
  dispatch: DBDispatch | null;
  visible: boolean;
  onClose: () => void;
}

export const EmergencyDispatchAlertModal: React.FC<EmergencyDispatchAlertModalProps> = ({
  dispatch,
  visible,
  onClose,
}) => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { dismissEmergencyDispatchAlert, updateDispatchStatus } = useGuardStore();

  // Animation values for glowing pulsing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (visible) {
      // Loop pulsating beacon animation
      const pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 650,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 650,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 650,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.35,
              duration: 650,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      pulseLoop.start();

      return () => {
        pulseLoop.stop();
      };
    }
  }, [visible, pulseAnim, glowAnim]);

  if (!visible || !dispatch) {
    return null;
  }

  const isCritical = dispatch.priority === 'Critical';
  const badgeColor = isCritical ? '#DC2626' : '#EA580C';
  const badgeBg = isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)';

  // Handle "VIEW DISPATCH DETAILS" -> Navigate straight to details page
  const handleViewDetails = async () => {
    soundAlertService.stopSafetyAlert();
    await dismissEmergencyDispatchAlert(dispatch.id);
    onClose();

    // Navigate to DispatchDetailsScreen
    try {
      if (navigation?.navigate) {
        navigation.navigate('Home', {
          screen: 'DispatchDetails',
          params: { dispatchId: dispatch.id },
        });
      } else {
        navigateToDispatchDetails(dispatch.id);
      }
    } catch {
      navigateToDispatchDetails(dispatch.id);
    }
  };

  // Handle "Acknowledge & View"
  const handleAcknowledgeAndView = async () => {
    soundAlertService.stopSafetyAlert();
    if (dispatch.status === 'Assigned') {
      await updateDispatchStatus(dispatch.id, 'Acknowledged');
    }
    await dismissEmergencyDispatchAlert(dispatch.id);
    onClose();

    try {
      if (navigation?.navigate) {
        navigation.navigate('Home', {
          screen: 'DispatchDetails',
          params: { dispatchId: dispatch.id },
        });
      } else {
        navigateToDispatchDetails(dispatch.id);
      }
    } catch {
      navigateToDispatchDetails(dispatch.id);
    }
  };

  // Handle Silence / Close
  const handleSilenceAlert = async () => {
    soundAlertService.stopSafetyAlert();
    await dismissEmergencyDispatchAlert(dispatch.id);
    onClose();
  };

  const handleCallContact = () => {
    if (dispatch.contact?.phone) {
      const telUrl = `tel:${dispatch.contact.phone.replace(/[^0-9+]/g, '')}`;
      Linking.openURL(telUrl).catch(() => {});
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleSilenceAlert}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => {}}
        />

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: badgeColor,
              borderRadius: borderRadius.xl || 24,
            },
          ]}
        >
          {/* Top Urgent Header Banner */}
          <View style={[styles.alertHeader, { backgroundColor: badgeColor }]}>
            <View style={styles.headerTitleBox}>
              <Animated.View
                style={[
                  styles.sirenPulseRing,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: glowAnim,
                  },
                ]}
              />
              <View style={styles.iconCircle}>
                <ShieldAlert size={28} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText size="xs" weight="bold" style={styles.alertHeaderSub}>
                  PRIORITY 1 DISPATCH SYSTEM
                </AppText>
                <Heading level="h4" style={styles.alertHeaderTitle}>
                  EMERGENCY DISPATCH ALERT
                </Heading>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSilenceAlert}
              style={styles.closeBtn}
              activeOpacity={0.8}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Priority & Reference Badges */}
            <View style={styles.badgeRow}>
              <View style={[styles.priorityBadge, { backgroundColor: badgeBg, borderColor: badgeColor }]}>
                <TriangleAlert size={14} color={badgeColor} style={{ marginRight: 6 }} />
                <AppText size="xs" weight="bold" style={{ color: badgeColor, letterSpacing: 0.5 }}>
                  {dispatch.priority.toUpperCase()} PRIORITY
                </AppText>
              </View>

              <View
                style={[
                  styles.refBadge,
                  { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                ]}
              >
                <AppText size="xs" weight="bold" style={{ color: colors.textSecondary }}>
                  REF: {dispatch.dispatchReference}
                </AppText>
              </View>
            </View>

            {/* Main Reason / Incident Title */}
            <Heading level="h3" color="primary" style={styles.reasonTitle}>
              {dispatch.reason}
            </Heading>

            {/* Site & Reporting Time info */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.surfaceSecondary,
                  borderColor: colors.border,
                  borderRadius: borderRadius.md || 12,
                },
              ]}
            >
              <View style={styles.infoRow}>
                <MapPin size={18} color="#DC2626" style={{ marginTop: 2, marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <AppText size="xs" color="secondary" weight="semibold">
                    DISPATCH LOCATION
                  </AppText>
                  <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                    {dispatch.site}
                  </AppText>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.infoRow}>
                <Clock size={18} color={colors.primary[600]} style={{ marginTop: 2, marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <AppText size="xs" color="secondary" weight="semibold">
                    REPORTING TIME & DURATION
                  </AppText>
                  <AppText size="sm" weight="bold" color="primary" style={{ marginTop: 2 }}>
                    {dispatch.reportingTime} • Expected {dispatch.expectedDuration || '30 mins'}
                  </AppText>
                </View>
              </View>
            </View>

            {/* Instructions box */}
            {Boolean(dispatch.instructions) && (
              <View
                style={[
                  styles.instructionsBox,
                  {
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    borderRadius: borderRadius.md || 12,
                  },
                ]}
              >
                <AppText size="xs" weight="bold" style={{ color: '#DC2626', marginBottom: 4 }}>
                  ORDERS & INSTRUCTIONS:
                </AppText>
                <AppText size="sm" color="primary" numberOfLines={3} style={{ lineHeight: 20 }}>
                  {dispatch.instructions}
                </AppText>
              </View>
            )}

            {/* Contact row if available */}
            {Boolean(dispatch.contact?.name) && (
              <View
                style={[
                  styles.contactCard,
                  {
                    backgroundColor: colors.surfaceSecondary,
                    borderColor: colors.border,
                    borderRadius: borderRadius.md || 12,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <AppText size="xs" color="secondary">
                    SITE SECURITY LEAD
                  </AppText>
                  <AppText size="sm" weight="bold" color="primary">
                    {dispatch.contact.name} ({dispatch.contact.role})
                  </AppText>
                </View>
                {Boolean(dispatch.contact.phone) && (
                  <TouchableOpacity
                    onPress={handleCallContact}
                    style={[styles.callBtn, { backgroundColor: '#16A34A' }]}
                    activeOpacity={0.8}
                  >
                    <Phone size={15} color="#FFFFFF" />
                    <AppText size="xs" weight="bold" style={styles.callBtnText}>
                      CALL
                    </AppText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Main Action Buttons */}
            <View style={styles.actionContainer}>
              {/* PRIMARY PROMINENT BUTTON: View Details */}
              <TouchableOpacity
                onPress={handleViewDetails}
                style={[styles.primaryActionBtn, { backgroundColor: badgeColor }]}
                activeOpacity={0.85}
              >
                <AppText size="base" weight="bold" style={styles.primaryActionBtnText}>
                  VIEW DISPATCH DETAILS
                </AppText>
                <ArrowRight size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {/* SECONDARY BUTTON: Acknowledge & Accept */}
              <Button
                title="ACKNOWLEDGE & RESPOND"
                variant="outline"
                size="large"
                fullWidth
                onPress={handleAcknowledgeAndView}
                style={[styles.secondaryBtn, { borderColor: badgeColor }]}
              />

              {/* Silence button */}
              <TouchableOpacity
                onPress={handleSilenceAlert}
                style={styles.silenceBtn}
                activeOpacity={0.7}
              >
                <VolumeX size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                <AppText size="sm" color="secondary" weight="semibold">
                  Silence Alarm & Dismiss
                </AppText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sirenPulseRing: {
    position: 'absolute',
    left: -4,
    top: -4,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertHeaderSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.8,
  },
  alertHeaderTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  refBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  reasonTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 14,
  },
  infoCard: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  instructionsBox: {
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  callBtnText: {
    color: '#FFFFFF',
    marginLeft: 4,
  },
  actionContainer: {
    gap: 10,
    marginTop: 4,
  },
  primaryActionBtn: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginRight: 10,
    fontSize: 15,
  },
  secondaryBtn: {
    height: 50,
    marginVertical: 0,
  },
  silenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
});
