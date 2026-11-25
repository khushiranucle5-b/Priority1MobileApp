import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  X,
} from 'lucide-react-native';
import { AppText } from './typography/Text';
import { Heading } from './typography/Heading';
import { useTheme } from '../providers/ThemeProvider';
import { AlertPayload, AlertButton, AlertType } from '../services/alert.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CustomAlertModalProps {
  alert: AlertPayload | null;
  onDismiss: () => void;
}

export const CustomAlertModal: React.FC<CustomAlertModalProps> = ({ alert, onDismiss }) => {
  const { colors, borderRadius } = useTheme();

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (alert) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [alert, scaleAnim, opacityAnim]);

  if (!alert) return null;

  const handleButtonPress = (btn: AlertButton) => {
    onDismiss();
    if (btn.onPress) {
      setTimeout(() => {
        btn.onPress?.();
      }, 60);
    }
  };

  const alertType: AlertType = alert.type || 'info';

  const getTypeTheme = () => {
    switch (alertType) {
      case 'success':
        return {
          icon: <CheckCircle2 size={32} color="#15803D" strokeWidth={2.4} />,
          badgeBg: '#DCFCE7',
          badgeBorder: '#86EFAC',
          accentColor: '#16A34A',
          btnBg: '#16A34A',
          btnText: '#FFFFFF',
        };
      case 'error':
        return {
          icon: <AlertCircle size={32} color="#DC2626" strokeWidth={2.4} />,
          badgeBg: '#FEE2E2',
          badgeBorder: '#FCA5A5',
          accentColor: '#DC2626',
          btnBg: '#DC2626',
          btnText: '#FFFFFF',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={30} color="#D97706" strokeWidth={2.4} />,
          badgeBg: '#FEF3C7',
          badgeBorder: '#FCD34D',
          accentColor: '#D97706',
          btnBg: '#D97706',
          btnText: '#FFFFFF',
        };
      case 'confirm':
        return {
          icon: <HelpCircle size={32} color="#4F46E5" strokeWidth={2.4} />,
          badgeBg: '#EEF2FF',
          badgeBorder: '#C7D2FE',
          accentColor: '#4F46E5',
          btnBg: '#4F46E5',
          btnText: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          icon: <Info size={32} color="#4F46E5" strokeWidth={2.4} />,
          badgeBg: '#EEF2FF',
          badgeBorder: '#C7D2FE',
          accentColor: '#4F46E5',
          btnBg: '#4F46E5',
          btnText: '#FFFFFF',
        };
    }
  };

  const themeConfig = getTypeTheme();
  const buttons = alert.buttons && alert.buttons.length > 0 ? alert.buttons : [{ text: 'OK', style: 'default' as const }];
  const isTwoButtons = buttons.length === 2;

  return (
    <Modal visible={Boolean(alert)} transparent animationType="none" onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {
            if (alert.cancelable !== false) {
              onDismiss();
            }
          }}
        />

        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderRadius: borderRadius.xl || 20,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Top Decorative Pill Bar */}
          <View style={[styles.topAccentBar, { backgroundColor: themeConfig.accentColor }]} />

          {/* Close Icon (Top Right) */}
          {alert.cancelable !== false && (
            <TouchableOpacity
              style={[styles.closeIconBtn, { backgroundColor: colors.surfaceSecondary }]}
              onPress={onDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {/* Icon Badge */}
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: themeConfig.badgeBg,
                  borderColor: themeConfig.badgeBorder,
                },
              ]}
            >
              {themeConfig.icon}
            </View>
          </View>

          {/* Title */}
          <Heading level="h4" style={[styles.title, { color: colors.text }]}>
            {alert.title}
          </Heading>

          {/* Message */}
          {Boolean(alert.message) && (
            <AppText size="sm" style={[styles.message, { color: colors.textSecondary }]}>
              {alert.message}
            </AppText>
          )}

          {/* Buttons Layout */}
          <View style={[styles.buttonsWrapper, isTwoButtons && styles.twoButtonsRow]}>
            {buttons.map((btn, index) => {
              const isCancel = btn.style === 'cancel' || btn.text?.toLowerCase() === 'cancel';
              const isDestructive = btn.style === 'destructive';

              let btnBgColor = themeConfig.btnBg;
              let btnTextColor = themeConfig.btnText;
              let btnBorderColor = 'transparent';

              if (isCancel) {
                btnBgColor = colors.surfaceSecondary;
                btnTextColor = colors.text;
                btnBorderColor = colors.border;
              } else if (isDestructive) {
                btnBgColor = '#DC2626';
                btnTextColor = '#FFFFFF';
              }

              return (
                <TouchableOpacity
                  key={`btn-${index}-${btn.text}`}
                  style={[
                    styles.button,
                    isTwoButtons && styles.twoButtonFlex,
                    {
                      backgroundColor: btnBgColor,
                      borderColor: btnBorderColor,
                      borderWidth: isCancel ? 1 : 0,
                    },
                  ]}
                  onPress={() => handleButtonPress(btn)}
                  activeOpacity={0.8}
                >
                  <AppText
                    size="sm"
                    weight="bold"
                    style={{
                      color: btnTextColor,
                      textAlign: 'center',
                    }}
                  >
                    {btn.text || 'OK'}
                  </AppText>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: Math.min(SCREEN_WIDTH - 40, 380),
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  topAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  closeIconBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 14,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  message: {
    textAlign: 'center',
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  buttonsWrapper: {
    width: '100%',
    gap: 10,
  },
  twoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  twoButtonFlex: {
    flex: 1,
  },
  button: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
});
