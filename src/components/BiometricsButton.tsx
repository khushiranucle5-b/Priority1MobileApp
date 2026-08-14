import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../providers/ThemeProvider';
import { AppText } from './typography/Text';
import { a11yButton } from '../utils/accessibility';
import { normalize } from '../utils/responsive';

interface BiometricsButtonProps {
  onPress?: () => void;
}

export const BiometricsButton: React.FC<BiometricsButtonProps> = ({ onPress }) => {
  const { colors, spacing, borderRadius } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const iconSize = normalize(36);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.container,
          {
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
          },
        ]}
        {...a11yButton('Sign in with Biometrics', 'Use fingerprint or face recognition to sign in')}
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
          {/* Fingerprint icon representation */}
          <View style={[styles.fingerprintArcOuter, { borderColor: colors.primary[600] }]} />
          <View style={[styles.fingerprintArcInner, { borderColor: colors.primary[600] }]} />
          <View style={[styles.fingerprintDot, { backgroundColor: colors.primary[600] }]} />
        </View>

        <View style={styles.textWrapper}>
          <AppText size="base" weight="semibold" color="primary">
            Quick Biometric Sign-In
          </AppText>
          <AppText size="xs" color="tertiary">
            Use Fingerprint or Face ID
          </AppText>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
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
