import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { AppText } from './typography/Text';
import { a11yButton } from '../utils/accessibility';
import { normalize } from '../utils/responsive';

interface BiometricsButtonProps {
  onPress?: () => void;
  title?: string;
  subtitle?: string;
  isRegistered?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
}

export const BiometricsButton: React.FC<BiometricsButtonProps> = ({
  onPress,
  title = 'Quick Biometric Sign-In',
  subtitle = 'Use Fingerprint or Face ID',
  isRegistered = false,
  isLoading = false,
  disabled = false,
}) => {
  const { colors, spacing, borderRadius } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || isLoading;

  const handlePressIn = () => {
    if (isDisabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (isDisabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const iconSize = normalize(36);

  return (
    <Animated.View style={[styles.animatedWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={isDisabled}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.container,
          disabled && styles.disabledContainer,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: isRegistered ? colors.primary[400] || colors.primary[600] : colors.border,
            borderRadius: borderRadius.lg,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
          },
        ]}
        {...a11yButton(title, subtitle, isDisabled)}
      >
        <View
          style={[
            styles.iconWrapper,
            {
              width: iconSize,
              height: iconSize,
              borderRadius: iconSize / 2,
              backgroundColor: colors.primary[50],
              borderColor: colors.primary[200],
            },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary[600]} />
          ) : (
            <>
              <View
                style={[
                  styles.fingerprintArcOuter,
                  { borderColor: colors.primary[600] },
                ]}
              />
              <View
                style={[
                  styles.fingerprintArcInner,
                  { borderColor: colors.primary[600] },
                ]}
              />
              <View
                style={[
                  styles.fingerprintDot,
                  { backgroundColor: colors.primary[600] },
                ]}
              />
            </>
          )}
        </View>

        <View style={styles.textWrapper}>
          <AppText size="base" weight="semibold" color="primary">
            {title}
          </AppText>
          <AppText size="xs" color="tertiary">
            {subtitle}
          </AppText>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedWrapper: {
    width: '100%',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
  },
  iconWrapper: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fingerprintArcOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    position: 'absolute',
    borderBottomColor: 'transparent',
  },
  fingerprintArcInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    position: 'absolute',
    borderBottomColor: 'transparent',
  },
  fingerprintDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  textWrapper: {
    flex: 1,
  },
});
