import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './typography/Text';

export type NavIconName =
  | 'dashboard'
  | 'menu'
  | 'sites'
  | 'employees'
  | 'shifts'
  | 'attendance'
  | 'leaves'
  | 'patrol'
  | 'incidents'
  | 'loneworker'
  | 'assets'
  | 'payslips'
  | 'holidays'
  | 'policies'
  | 'messages'
  | 'search'
  | 'eye'
  | 'edit'
  | 'profile'
  | 'settings'
  | 'camera'
  | 'delete'
  | 'download'
  | 'logout';

interface NavIconProps {
  name: NavIconName;
  color?: string;
  size?: number;
  active?: boolean;
}

export const NavIcon: React.FC<NavIconProps> = ({
  name,
  color,
  size = 28,
  active = false,
}) => {
  const iconColor = color || (active ? '#0F172A' : '#94A3B8');
  const strokeWidth = Math.max(2, Math.round(size * 0.085));

  switch (name) {
    case 'dashboard':
      const cellSize = Math.round(size * 0.38);
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ flexDirection: 'row', gap: 3 }}>
            <View style={{ width: cellSize, height: cellSize, borderRadius: 3, borderWidth: strokeWidth, borderColor: iconColor }} />
            <View style={{ width: cellSize, height: cellSize, borderRadius: 3, borderWidth: strokeWidth, borderColor: iconColor }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 3, marginTop: 3 }}>
            <View style={{ width: cellSize, height: cellSize, borderRadius: 3, borderWidth: strokeWidth, borderColor: iconColor }} />
            <View style={{ width: cellSize, height: cellSize, borderRadius: 3, borderWidth: strokeWidth, borderColor: iconColor }} />
          </View>
        </View>
      );

    case 'menu':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.75, height: strokeWidth, backgroundColor: iconColor, borderRadius: 2 }} />
          <View style={{ width: size * 0.75, height: strokeWidth, backgroundColor: iconColor, borderRadius: 2, marginVertical: 4 }} />
          <View style={{ width: size * 0.75, height: strokeWidth, backgroundColor: iconColor, borderRadius: 2 }} />
        </View>
      );

    case 'sites':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.6, height: size * 0.75, borderWidth: strokeWidth, borderColor: iconColor, borderRadius: 3, justifyContent: 'space-around', paddingVertical: 4, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              <View style={{ width: 4, height: 4, backgroundColor: iconColor }} />
              <View style={{ width: 4, height: 4, backgroundColor: iconColor }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              <View style={{ width: 4, height: 4, backgroundColor: iconColor }} />
              <View style={{ width: 4, height: 4, backgroundColor: iconColor }} />
            </View>
          </View>
        </View>
      );

    case 'employees':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.35, height: size * 0.35, borderRadius: (size * 0.35) / 2, borderWidth: strokeWidth, borderColor: iconColor, marginBottom: 2 }} />
          <View style={{ width: size * 0.7, height: size * 0.3, borderTopLeftRadius: size * 0.2, borderTopRightRadius: size * 0.2, borderWidth: strokeWidth, borderColor: iconColor }} />
        </View>
      );

    case 'shifts':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.75, height: size * 0.75, borderRadius: size * 0.375, borderWidth: strokeWidth, borderColor: iconColor, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: strokeWidth, height: size * 0.25, backgroundColor: iconColor, position: 'absolute', top: size * 0.12 }} />
            <View style={{ width: size * 0.2, height: strokeWidth, backgroundColor: iconColor, position: 'absolute', right: size * 0.15 }} />
          </View>
        </View>
      );

    case 'attendance':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.7, height: size * 0.75, borderRadius: 4, borderWidth: strokeWidth, borderColor: iconColor, padding: 3, justifyContent: 'space-between' }}>
            <View style={{ width: '60%', height: strokeWidth, backgroundColor: iconColor }} />
            <View style={{ width: '80%', height: strokeWidth, backgroundColor: iconColor }} />
            <View style={{ width: '40%', height: strokeWidth, backgroundColor: iconColor }} />
          </View>
        </View>
      );

    case 'leaves':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.7, height: size * 0.7, borderRadius: 4, borderWidth: strokeWidth, borderColor: iconColor, alignItems: 'center' }}>
            <View style={{ width: '100%', height: size * 0.2, borderBottomWidth: strokeWidth, borderColor: iconColor, backgroundColor: active ? iconColor : 'transparent' }} />
          </View>
        </View>
      );

    case 'patrol':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.7, height: size * 0.75, borderWidth: strokeWidth, borderColor: iconColor, borderTopLeftRadius: size * 0.35, borderTopRightRadius: size * 0.35, borderBottomLeftRadius: 4, borderBottomRightRadius: 4, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.25, height: size * 0.25, borderRadius: size * 0.125, borderWidth: strokeWidth, borderColor: iconColor }} />
          </View>
        </View>
      );

    case 'incidents':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: 0, height: 0, borderLeftWidth: size * 0.4, borderRightWidth: size * 0.4, borderBottomWidth: size * 0.7, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: iconColor, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 2 }}>
            <View style={{ width: 2, height: 6, backgroundColor: '#FFFFFF', marginBottom: 2 }} />
            <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: '#FFFFFF' }} />
          </View>
        </View>
      );

    case 'loneworker':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.75, height: size * 0.75, borderRadius: size * 0.375, borderWidth: strokeWidth, borderColor: iconColor, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2, borderWidth: strokeWidth, borderColor: iconColor }} />
          </View>
        </View>
      );

    case 'assets':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.7, height: size * 0.55, borderRadius: 4, borderWidth: strokeWidth, borderColor: iconColor, marginTop: 4 }}>
            <View style={{ width: size * 0.3, height: size * 0.2, borderTopLeftRadius: 2, borderTopRightRadius: 2, borderWidth: strokeWidth, borderColor: iconColor, position: 'absolute', top: -size * 0.2, left: size * 0.18 }} />
          </View>
        </View>
      );

    case 'payslips':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.75, height: size * 0.5, borderRadius: 4, borderWidth: strokeWidth, borderColor: iconColor, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.3, height: size * 0.2, borderRadius: size * 0.1, borderWidth: strokeWidth, borderColor: iconColor }} />
          </View>
        </View>
      );

    case 'holidays':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.75, height: size * 0.75, borderRadius: size * 0.375, borderWidth: strokeWidth, borderColor: iconColor, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, backgroundColor: iconColor }} />
          </View>
        </View>
      );

    case 'policies':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.65, height: size * 0.75, borderRadius: 4, borderWidth: strokeWidth, borderColor: iconColor, padding: 4 }}>
            <View style={{ width: '80%', height: strokeWidth, backgroundColor: iconColor, marginBottom: 4 }} />
            <View style={{ width: '100%', height: strokeWidth, backgroundColor: iconColor, marginBottom: 4 }} />
            <View style={{ width: '60%', height: strokeWidth, backgroundColor: iconColor }} />
          </View>
        </View>
      );

    case 'search':
      const glassR = Math.round(size * 0.5);
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: glassR, height: glassR, borderColor: iconColor, borderWidth: strokeWidth, borderRadius: glassR / 2, position: 'absolute', top: 2, left: 2 }} />
          <View style={{ width: strokeWidth * 1.2, height: size * 0.35, backgroundColor: iconColor, position: 'absolute', bottom: 2, right: 3, transform: [{ rotate: '-45deg' }] }} />
        </View>
      );

    case 'eye':
      // Outline Eye Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.85, height: size * 0.55, borderRadius: size * 0.3, borderColor: iconColor, borderWidth: strokeWidth, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.25, height: size * 0.25, borderRadius: size * 0.125, backgroundColor: iconColor }} />
          </View>
        </View>
      );

    case 'edit':
      // Outline Pencil Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.35, height: size * 0.7, borderColor: iconColor, borderWidth: strokeWidth, transform: [{ rotate: '45deg' }] }} />
        </View>
      );

    case 'profile':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.42, height: size * 0.42, borderRadius: (size * 0.42) / 2, borderColor: iconColor, borderWidth: strokeWidth, marginBottom: 2 }} />
          <View style={{ width: size * 0.75, height: size * 0.32, borderTopLeftRadius: size * 0.2, borderTopRightRadius: size * 0.2, borderColor: iconColor, borderWidth: strokeWidth }} />
        </View>
      );

    case 'settings':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4, borderWidth: strokeWidth, borderColor: iconColor, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, backgroundColor: iconColor }} />
          </View>
        </View>
      );

    case 'camera':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.8, height: size * 0.6, borderWidth: strokeWidth, borderColor: iconColor, borderRadius: 4, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, borderWidth: strokeWidth, borderColor: iconColor }} />
          </View>
        </View>
      );

    case 'delete':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.6, height: Math.max(2, strokeWidth - 0.5), backgroundColor: iconColor, marginBottom: 2 }} />
          <View style={{ width: size * 0.5, height: size * 0.55, borderWidth: strokeWidth, borderColor: iconColor, borderTopWidth: 0, borderRadius: 2, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 2 }}>
            <View style={{ width: strokeWidth, height: '60%', backgroundColor: iconColor }} />
            <View style={{ width: strokeWidth, height: '60%', backgroundColor: iconColor }} />
          </View>
        </View>
      );

    case 'download':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: strokeWidth, height: size * 0.5, backgroundColor: iconColor }} />
          <View style={{ width: size * 0.35, height: size * 0.35, borderBottomWidth: strokeWidth, borderRightWidth: strokeWidth, borderColor: iconColor, transform: [{ rotate: '45deg' }], marginTop: -size * 0.25 }} />
          <View style={{ width: size * 0.65, height: strokeWidth, backgroundColor: iconColor, marginTop: 4 }} />
        </View>
      );

    case 'logout':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.75, height: size * 0.8, borderWidth: strokeWidth, borderColor: iconColor, borderRightWidth: 0, borderRadius: 3 }}>
            <View style={{ position: 'absolute', right: -6, top: size * 0.3, width: size * 0.45, height: strokeWidth, backgroundColor: iconColor }} />
          </View>
        </View>
      );

    case 'messages':
    default:
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.8, height: size * 0.65, borderRadius: 5, borderColor: iconColor, borderWidth: strokeWidth, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '40%', height: strokeWidth, backgroundColor: iconColor }} />
          </View>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
