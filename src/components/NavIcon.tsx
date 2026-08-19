import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from './typography/Text';

export type NavIconName =
  | 'dashboard'
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
  | 'edit';

interface NavIconProps {
  name: NavIconName;
  color?: string;
  size?: number;
  active?: boolean;
}

export const NavIcon: React.FC<NavIconProps> = ({
  name,
  color = '#94A3B8',
  size = 18,
  active = false,
}) => {
  const iconColor = active ? '#FFFFFF' : color;
  const strokeWidth = 1.5;

  switch (name) {
    case 'dashboard':
      // 2x2 Outline Grid Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={styles.grid2x2}>
            <View style={[styles.gridCell, { borderColor: iconColor, borderWidth: strokeWidth }]} />
            <View style={[styles.gridCell, { borderColor: iconColor, borderWidth: strokeWidth }]} />
            <View style={[styles.gridCell, { borderColor: iconColor, borderWidth: strokeWidth }]} />
            <View style={[styles.gridCell, { borderColor: iconColor, borderWidth: strokeWidth }]} />
          </View>
        </View>
      );

    case 'sites':
      // Outline Pin/Location Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={[styles.pinHead, { borderColor: iconColor, borderWidth: strokeWidth, borderRadius: size / 2 }]}>
            <View style={[styles.pinDot, { backgroundColor: iconColor }]} />
          </View>
          <View style={[styles.pinPoint, { backgroundColor: iconColor }]} />
        </View>
      );

    case 'employees':
      // Outline Users Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={[styles.userHead, { borderColor: iconColor, borderWidth: strokeWidth }]} />
          <View style={[styles.userBody, { borderColor: iconColor, borderWidth: strokeWidth }]} />
        </View>
      );

    case 'shifts':
    case 'attendance':
      // Outline Clock / Shift Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={[styles.clockCircle, { borderColor: iconColor, borderWidth: strokeWidth, borderRadius: size / 2 }]}>
            <View style={[styles.clockHandH, { backgroundColor: iconColor }]} />
            <View style={[styles.clockHandV, { backgroundColor: iconColor }]} />
          </View>
        </View>
      );

    case 'leaves':
    case 'holidays':
      // Outline Calendar Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={[styles.calHeader, { backgroundColor: iconColor }]} />
          <View style={[styles.calBody, { borderColor: iconColor, borderWidth: strokeWidth }]}>
            <View style={[styles.calGridLine, { backgroundColor: iconColor }]} />
          </View>
        </View>
      );

    case 'patrol':
      // Outline Radar Target Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={[styles.targetOuter, { borderColor: iconColor, borderWidth: strokeWidth, borderRadius: size / 2 }]}>
            <View style={[styles.targetInner, { borderColor: iconColor, borderWidth: strokeWidth, borderRadius: size / 4 }]} />
          </View>
        </View>
      );

    case 'incidents':
      // Outline Shield-Alert / Warning Icon
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={[styles.triangleOutline, { borderColor: iconColor, borderWidth: strokeWidth }]}>
            <AppText size="xs" weight="bold" style={{ color: iconColor, fontSize: 10, lineHeight: 12 }}>!</AppText>
          </View>
        </View>
      );

    case 'loneworker':
      // Outline Shield Check Icon
      return (
        <View style={[styles.container, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={[styles.shieldBox, { borderColor: iconColor, borderWidth: strokeWidth }]}>
            <AppText size="xs" weight="bold" style={{ color: iconColor, fontSize: 9, lineHeight: 11 }}>✓</AppText>
          </View>
        </View>
      );

    case 'assets':
      // Outline Box / Package Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={[styles.boxOutline, { borderColor: iconColor, borderWidth: strokeWidth }]}>
            <View style={[styles.boxTopLine, { backgroundColor: iconColor }]} />
          </View>
        </View>
      );

    case 'payslips':
      // Outline Document / Card Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={[styles.docOutline, { borderColor: iconColor, borderWidth: strokeWidth }]}>
            <View style={[styles.docLine, { backgroundColor: iconColor }]} />
            <View style={[styles.docLineShort, { backgroundColor: iconColor }]} />
          </View>
        </View>
      );

    case 'policies':
      // Outline Book Icon
      return (
        <View style={[styles.container, { width: size, height: size, flexDirection: 'row' }]}>
          <View style={[styles.bookSpine, { backgroundColor: iconColor }]} />
          <View style={[styles.bookCover, { borderColor: iconColor, borderWidth: strokeWidth }]} />
        </View>
      );

    case 'search':
      // Outline Search Glass Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={[styles.searchGlassCircle, { borderColor: iconColor, borderWidth: strokeWidth, borderRadius: (size * 0.75) / 2 }]} />
          <View style={[styles.searchGlassHandle, { backgroundColor: iconColor }]} />
        </View>
      );

    case 'eye':
      // Outline Eye Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={[styles.eyeShape, { borderColor: iconColor, borderWidth: strokeWidth }]}>
            <View style={[styles.eyePupil, { backgroundColor: iconColor }]} />
          </View>
        </View>
      );

    case 'edit':
      // Outline Pencil Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={[styles.pencilBody, { borderColor: iconColor, borderWidth: strokeWidth }]} />
          <View style={[styles.pencilTip, { borderBottomColor: iconColor, borderBottomWidth: strokeWidth }]} />
        </View>
      );

    case 'messages':
    default:
      // Outline Message Envelope / Chat Bubble Icon
      return (
        <View style={[styles.container, { width: size, height: size }]}>
          <View style={[styles.chatBubble, { borderColor: iconColor, borderWidth: strokeWidth }]}>
            <View style={[styles.chatDot, { backgroundColor: iconColor }]} />
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
  // Grid
  grid2x2: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCell: {
    width: 7,
    height: 7,
    borderRadius: 1.5,
  },
  // Pin
  pinHead: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  pinPoint: {
    width: 2,
    height: 4,
    marginTop: -1,
  },
  // User
  userHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 1,
  },
  userBody: {
    width: 14,
    height: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  // Clock
  clockCircle: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockHandH: {
    position: 'absolute',
    width: 5,
    height: 1.5,
    right: 2,
    top: 7,
  },
  clockHandV: {
    position: 'absolute',
    width: 1.5,
    height: 6,
    top: 2,
  },
  // Calendar
  calHeader: {
    width: 14,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  calBody: {
    width: 14,
    height: 12,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    paddingTop: 2,
  },
  calGridLine: {
    width: '100%',
    height: 1,
  },
  // Target
  targetOuter: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetInner: {
    width: 8,
    height: 8,
  },
  // Triangle
  triangleOutline: {
    width: 15,
    height: 15,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Shield
  shieldBox: {
    width: 15,
    height: 16,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Box
  boxOutline: {
    width: 15,
    height: 14,
    borderRadius: 2,
  },
  boxTopLine: {
    width: '100%',
    height: 2,
    marginTop: 3,
  },
  // Document
  docOutline: {
    width: 14,
    height: 16,
    borderRadius: 2,
    padding: 2,
    gap: 3,
  },
  docLine: {
    width: 8,
    height: 1.5,
  },
  docLineShort: {
    width: 5,
    height: 1.5,
  },
  // Book
  bookSpine: {
    width: 2,
    height: 15,
    marginRight: 1,
  },
  bookCover: {
    width: 12,
    height: 15,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  // Chat Bubble
  chatBubble: {
    width: 15,
    height: 13,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatDot: {
    width: 4,
    height: 1.5,
  },
  // Search Glass
  searchGlassCircle: {
    width: 11,
    height: 11,
    position: 'absolute',
    top: 1,
    left: 1,
  },
  searchGlassHandle: {
    position: 'absolute',
    width: 2,
    height: 5,
    bottom: 1,
    right: 2,
    transform: [{ rotate: '-45deg' }],
  },
  // Eye Icon
  eyeShape: {
    width: 15,
    height: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyePupil: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  // Pencil Icon
  pencilBody: {
    width: 6,
    height: 12,
    transform: [{ rotate: '45deg' }],
    marginTop: -2,
    marginLeft: 2,
  },
  pencilTip: {
    width: 6,
    height: 4,
    transform: [{ rotate: '45deg' }],
    marginTop: 2,
    marginLeft: -4,
  },
});
