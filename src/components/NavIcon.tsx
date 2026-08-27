import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './typography/Text';
import {
  LayoutDashboard,
  MapPin,
  ClipboardCheck,
  CalendarDays,
  Route,
  TriangleAlert,
  ShieldCheck,
  Package,
  WalletCards,
  CalendarHeart,
  BookOpen,
  MessageSquare,
  LogOut
} from 'lucide-react-native';

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
  | 'close'
  | 'plus'
  | 'calendar'
  | 'profile'
  | 'settings'
  | 'camera'
  | 'delete'
  | 'download'
  | 'document'
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
  const lucideStrokeWidth = 2;
  const customStrokeWidth = Math.max(2, Math.round(size * 0.085));

  switch (name) {
    // Lucide Icons
    case 'dashboard':
      return <LayoutDashboard size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'sites':
      return <MapPin size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'attendance':
      return <ClipboardCheck size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'leaves':
      return <CalendarDays size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'patrol':
      return <Route size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'incidents':
      return <TriangleAlert size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'loneworker':
      return <ShieldCheck size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'assets':
      return <Package size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'payslips':
      return <WalletCards size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'holidays':
      return <CalendarHeart size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'policies':
      return <BookOpen size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'messages':
      return <MessageSquare size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;
    case 'logout':
      return <LogOut size={size} color={iconColor} strokeWidth={lucideStrokeWidth} />;

    // Custom geometric icons preserved for non-sidebar actions
    case 'menu':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.75, height: customStrokeWidth, backgroundColor: iconColor, borderRadius: 2 }} />
          <View style={{ width: size * 0.75, height: customStrokeWidth, backgroundColor: iconColor, borderRadius: 2, marginVertical: 4 }} />
          <View style={{ width: size * 0.75, height: customStrokeWidth, backgroundColor: iconColor, borderRadius: 2 }} />
        </View>
      );

    case 'employees':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.35, height: size * 0.35, borderRadius: (size * 0.35) / 2, borderWidth: customStrokeWidth, borderColor: iconColor, marginBottom: 2 }} />
          <View style={{ width: size * 0.7, height: size * 0.3, borderTopLeftRadius: size * 0.2, borderTopRightRadius: size * 0.2, borderWidth: customStrokeWidth, borderColor: iconColor }} />
        </View>
      );

    case 'shifts':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.75, height: size * 0.75, borderRadius: size * 0.375, borderWidth: customStrokeWidth, borderColor: iconColor, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: customStrokeWidth, height: size * 0.25, backgroundColor: iconColor, position: 'absolute', top: size * 0.12 }} />
            <View style={{ width: size * 0.2, height: customStrokeWidth, backgroundColor: iconColor, position: 'absolute', right: size * 0.15 }} />
          </View>
        </View>
      );

    case 'search':
      const glassR = Math.round(size * 0.5);
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: glassR, height: glassR, borderColor: iconColor, borderWidth: customStrokeWidth, borderRadius: glassR / 2, position: 'absolute', top: 2, left: 2 }} />
          <View style={{ width: customStrokeWidth * 1.2, height: size * 0.35, backgroundColor: iconColor, position: 'absolute', bottom: 2, right: 3, transform: [{ rotate: '-45deg' }] }} />
        </View>
      );

    case 'eye':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.85, height: size * 0.55, borderRadius: size * 0.3, borderColor: iconColor, borderWidth: customStrokeWidth, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.25, height: size * 0.25, borderRadius: size * 0.125, backgroundColor: iconColor }} />
          </View>
        </View>
      );

    case 'edit':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.35, height: size * 0.7, borderColor: iconColor, borderWidth: customStrokeWidth, transform: [{ rotate: '45deg' }] }} />
        </View>
      );

    case 'close':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.7, height: customStrokeWidth, backgroundColor: iconColor, position: 'absolute', transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: size * 0.7, height: customStrokeWidth, backgroundColor: iconColor, position: 'absolute', transform: [{ rotate: '-45deg' }] }} />
        </View>
      );

    case 'plus':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.65, height: customStrokeWidth, backgroundColor: iconColor, position: 'absolute' }} />
          <View style={{ width: customStrokeWidth, height: size * 0.65, backgroundColor: iconColor, position: 'absolute' }} />
        </View>
      );

    case 'calendar':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.75, height: size * 0.75, borderRadius: 4, borderWidth: customStrokeWidth, borderColor: iconColor, alignItems: 'center' }}>
            <View style={{ width: '100%', height: size * 0.22, backgroundColor: iconColor }} />
            <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>
              <View style={{ width: 3, height: 3, backgroundColor: iconColor, borderRadius: 1 }} />
              <View style={{ width: 3, height: 3, backgroundColor: iconColor, borderRadius: 1 }} />
              <View style={{ width: 3, height: 3, backgroundColor: iconColor, borderRadius: 1 }} />
            </View>
          </View>
        </View>
      );

    case 'profile':
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.42, height: size * 0.42, borderRadius: (size * 0.42) / 2, borderColor: iconColor, borderWidth: customStrokeWidth, marginBottom: 2 }} />
          <View style={{ width: size * 0.75, height: size * 0.32, borderTopLeftRadius: size * 0.2, borderTopRightRadius: size * 0.2, borderColor: iconColor, borderWidth: customStrokeWidth }} />
        </View>
      );

    case 'settings':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.8, height: size * 0.8, borderRadius: size * 0.4, borderWidth: customStrokeWidth, borderColor: iconColor, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, backgroundColor: iconColor }} />
          </View>
        </View>
      );

    case 'camera':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.8, height: size * 0.6, borderWidth: customStrokeWidth, borderColor: iconColor, borderRadius: 4, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15, borderWidth: customStrokeWidth, borderColor: iconColor }} />
          </View>
        </View>
      );

    case 'delete':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.6, height: Math.max(2, customStrokeWidth - 0.5), backgroundColor: iconColor, marginBottom: 2 }} />
          <View style={{ width: size * 0.5, height: size * 0.55, borderWidth: customStrokeWidth, borderColor: iconColor, borderTopWidth: 0, borderRadius: 2, justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 2 }}>
            <View style={{ width: customStrokeWidth, height: '60%', backgroundColor: iconColor }} />
            <View style={{ width: customStrokeWidth, height: '60%', backgroundColor: iconColor }} />
          </View>
        </View>
      );

    case 'download':
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: customStrokeWidth, height: size * 0.5, backgroundColor: iconColor }} />
          <View style={{ width: size * 0.35, height: size * 0.35, borderBottomWidth: customStrokeWidth, borderRightWidth: customStrokeWidth, borderColor: iconColor, transform: [{ rotate: '45deg' }], marginTop: -size * 0.25 }} />
          <View style={{ width: size * 0.65, height: customStrokeWidth, backgroundColor: iconColor, marginTop: 4 }} />
        </View>
      );

    default:
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={{ width: size * 0.8, height: size * 0.65, borderRadius: 5, borderColor: iconColor, borderWidth: customStrokeWidth, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: '40%', height: customStrokeWidth, backgroundColor: iconColor }} />
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
