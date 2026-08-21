import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'emergency' | 'neutral';

interface GuardStatusProps {
  status: string;
  type?: StatusType;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const GuardStatus: React.FC<GuardStatusProps> = ({
  status,
  type,
  icon,
  size = 'md',
  style,
}) => {
  const { colors, borderRadius } = useTheme();
  const normalized = (status || '').toLowerCase().trim();

  let detectedType: StatusType = type || 'neutral';
  let defaultIcon = icon;

  if (!type) {
    if (
      normalized.includes('check') ||
      normalized.includes('in') ||
      normalized.includes('approve') ||
      normalized.includes('complete') ||
      normalized.includes('active') ||
      normalized.includes('pass') ||
      normalized.includes('verified') ||
      normalized.includes('safe')
    ) {
      detectedType = 'success';
      if (!defaultIcon) defaultIcon = '🟢';
    } else if (
      normalized.includes('pend') ||
      normalized.includes('wait') ||
      normalized.includes('warn') ||
      normalized.includes('medium') ||
      normalized.includes('progress')
    ) {
      detectedType = 'warning';
      if (!defaultIcon) defaultIcon = '🟠';
    } else if (
      normalized.includes('reject') ||
      normalized.includes('fail') ||
      normalized.includes('out') ||
      normalized.includes('expired') ||
      normalized.includes('high') ||
      normalized.includes('critical') ||
      normalized.includes('danger')
    ) {
      detectedType = 'error';
      if (!defaultIcon) defaultIcon = '🔴';
    } else if (normalized.includes('cancel')) {
      detectedType = 'neutral';
      if (!defaultIcon) defaultIcon = '⚪';
    } else if (normalized.includes('action') || normalized.includes('alert')) {
      detectedType = 'warning';
      if (!defaultIcon) defaultIcon = '●';
    } else if (normalized.includes('sos') || normalized.includes('emergency')) {
      detectedType = 'emergency';
      if (!defaultIcon) defaultIcon = '●';
    } else {
      detectedType = 'info';
      if (!defaultIcon) defaultIcon = '●';
    }
  } else if (!defaultIcon) {
    switch (type) {
      case 'success': defaultIcon = '●'; break;
      case 'warning': defaultIcon = '●'; break;
      case 'error': defaultIcon = '●'; break;
      case 'emergency': defaultIcon = '●'; break;
      case 'info': defaultIcon = '●'; break;
      default: defaultIcon = '●'; break;
    }
  }

  const getBadgeColors = () => {
    switch (detectedType) {
      case 'success':
        return {
          bg: '#DCFCE7',
          border: '#86EFAC',
          text: '#15803D',
        };
      case 'warning':
        return {
          bg: '#FEF3C7',
          border: '#FDE68A',
          text: '#B45309',
        };
      case 'error':
        return {
          bg: '#FEE2E2',
          border: '#FECACA',
          text: '#B91C1C',
        };
      case 'emergency':
        return {
          bg: colors.emergencyLight || '#FEE2E2',
          border: colors.emergencyBorder || '#FECACA',
          text: colors.emergency || '#DC2626',
        };
      case 'info':
        return {
          bg: '#DBEAFE',
          border: '#BFDBFE',
          text: '#1E40AF',
        };
      default:
        return {
          bg: '#F1F5F9',
          border: '#CBD5E1',
          text: '#475569',
        };
    }
  };

  const badgeColors = getBadgeColors();

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 4, paddingHorizontal: 10 };
      case 'lg': return { paddingVertical: 8, paddingHorizontal: 16 };
      default: return { paddingVertical: 6, paddingHorizontal: 12 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 13;
      case 'lg': return 16;
      default: return 14;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeColors.bg,
          borderColor: badgeColors.border,
          borderRadius: borderRadius.md,
          ...getPadding(),
        },
        style,
      ]}
    >
      {defaultIcon ? (
        <Text style={[styles.iconText, { fontSize: getFontSize() }]}>
          {defaultIcon}
        </Text>
      ) : null}
      <Text
        style={[
          styles.badgeText,
          {
            color: badgeColors.text,
            fontSize: getFontSize(),
          },
        ]}
      >
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    gap: 6,
  },
  iconText: {
    lineHeight: 18,
  },
  badgeText: {
    fontWeight: '800',
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
});
