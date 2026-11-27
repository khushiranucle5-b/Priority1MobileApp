import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ArrowRight,
  Clock,
  MapPin,
  TriangleAlert,
  VolumeX,
  X,
} from 'lucide-react-native';
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

export const EmergencyDispatchAlertModal: React.FC<
  EmergencyDispatchAlertModalProps
> = ({ dispatch, visible, onClose }) => {
  const { colors, borderRadius } = useTheme();
  const navigation = useNavigation<any>();
  const { dismissEmergencyDispatchAlert, updateDispatchStatus } =
    useGuardStore();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (visible) {
      const pulseLoop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.12,
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
              toValue: 0.9,
              duration: 650,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.35,
              duration: 650,
              useNativeDriver: true,
            }),
          ]),
        ]),
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
  const badgeBg = isCritical
    ? 'rgba(239, 68, 68, 0.15)'
    : 'rgba(249, 115, 22, 0.15)';

  const navigateToDetails = () => {
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

  const handleViewDetails = async () => {
    soundAlertService.stopSafetyAlert();
    await dismissEmergencyDispatchAlert(dispatch.id);
    onClose();
    navigateToDetails();
  };

  const handleAcknowledgeAndView = async () => {
    soundAlertService.stopSafetyAlert();
    if (dispatch.status === 'Assigned') {
      await updateDispatchStatus(dispatch.id, 'Acknowledged');
    }
    await dismissEmergencyDispatchAlert(dispatch.id);
    onClose();
    navigateToDetails();
  };

  const handleSilenceAlert = async () => {
    soundAlertService.stopSafetyAlert();
    await dismissEmergencyDispatchAlert(dispatch.id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleSilenceAlert}
    >
      <View style={styles.overlay}>
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
              borderRadius: borderRadius.xl || 20,
            },
          ]}
        >
          {/* Header with PriorityOne Logo */}
          <View style={[styles.alertHeader, { backgroundColor: badgeColor }]}>
            <View style={styles.headerTitleBox}>
              <View style={styles.logoWrapper}>
                <Animated.View
                  style={[
                    styles.sirenPulseRing,
                    {
                      transform: [{ scale: pulseAnim }],
                      opacity: glowAnim,
                    },
                  ]}
                />
                <View style={styles.logoBadge}>
                  <Image
                    source={require('../../../assets/images/app_logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View style={styles.headerTextWrap}>
                <AppText size="xs" weight="bold" style={styles.alertHeaderSub}>
                  PRIORITY ONE
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
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Compact non-scrolling body with essential dispatch info */}
          <View style={styles.bodyContent}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: badgeBg, borderColor: badgeColor },
              ]}
            >
              <TriangleAlert
                size={13}
                color={badgeColor}
                style={styles.badgeIcon}
              />
              <AppText
                size="xs"
                weight="bold"
                style={[styles.priorityText, { color: badgeColor }]}
              >
                {dispatch.priority.toUpperCase()} PRIORITY
              </AppText>
            </View>

            <Heading
              level="h3"
              color="primary"
              numberOfLines={2}
              style={styles.reasonTitle}
            >
              {dispatch.reason}
            </Heading>

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
                <MapPin
                  size={16}
                  color="#DC2626"
                  style={styles.infoIcon}
                />
                <AppText
                  size="sm"
                  weight="bold"
                  color="primary"
                  numberOfLines={1}
                  style={styles.infoValue}
                >
                  {dispatch.site}
                </AppText>
              </View>

              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />

              <View style={styles.infoRow}>
                <Clock
                  size={16}
                  color={colors.primary[600]}
                  style={styles.infoIcon}
                />
                <AppText
                  size="sm"
                  weight="semibold"
                  color="primary"
                  numberOfLines={1}
                  style={styles.infoValue}
                >
                  {dispatch.reportingTime} •{' '}
                  {dispatch.expectedDuration || '30 mins'}
                </AppText>
              </View>
            </View>

            {Boolean(dispatch.instructions) && (
              <AppText
                size="xs"
                color="secondary"
                numberOfLines={2}
                style={styles.instructionsText}
              >
                {dispatch.instructions}
              </AppText>
            )}

            <View style={styles.actionContainer}>
              <TouchableOpacity
                onPress={handleViewDetails}
                style={[
                  styles.primaryActionBtn,
                  { backgroundColor: badgeColor },
                ]}
                activeOpacity={0.85}
              >
                <AppText
                  size="base"
                  weight="bold"
                  style={styles.primaryActionBtnText}
                >
                  VIEW DISPATCH DETAILS
                </AppText>
                <ArrowRight size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <Button
                title="ACKNOWLEDGE & RESPOND"
                variant="outline"
                size="medium"
                fullWidth
                onPress={handleAcknowledgeAndView}
                style={[styles.secondaryBtn, { borderColor: badgeColor }]}
              />

              <TouchableOpacity
                onPress={handleSilenceAlert}
                style={styles.silenceBtn}
                activeOpacity={0.7}
              >
                <VolumeX
                  size={15}
                  color={colors.textSecondary}
                  style={styles.silenceIcon}
                />
                <AppText size="sm" color="secondary" weight="semibold">
                  Silence Alarm & Dismiss
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
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
    maxWidth: 420,
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
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoWrapper: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sirenPulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  headerTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  alertHeaderSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.8,
  },
  alertHeaderTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    marginTop: 1,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  bodyContent: {
    padding: 16,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  badgeIcon: {
    marginRight: 5,
  },
  priorityText: {
    letterSpacing: 0.5,
  },
  reasonTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
    marginBottom: 12,
  },
  infoCard: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 8,
  },
  infoValue: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  instructionsText: {
    lineHeight: 18,
    marginBottom: 14,
  },
  actionContainer: {
    gap: 8,
  },
  primaryActionBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    letterSpacing: 0.4,
    marginRight: 8,
    fontSize: 14,
  },
  secondaryBtn: {
    minHeight: 46,
    marginVertical: 0,
  },
  silenceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  silenceIcon: {
    marginRight: 6,
  },
});
