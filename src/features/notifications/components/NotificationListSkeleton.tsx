import React, { useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { useTheme } from '../../../providers/ThemeProvider';

export const NotificationListSkeleton: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [opacity]);

  const renderSkeletonCard = (key: string) => (
    <View key={key} style={[styles.card, { borderColor: colors.border, borderRadius: borderRadius.md }]}>
      <Animated.View style={[styles.iconSkeleton, { backgroundColor: colors.border, borderRadius: borderRadius.full, opacity }]} />
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Animated.View style={[styles.titleSkeleton, { backgroundColor: colors.border, borderRadius: borderRadius.sm, opacity }]} />
          <Animated.View style={[styles.badgeSkeleton, { backgroundColor: colors.border, borderRadius: borderRadius.full, opacity }]} />
        </View>
        <Animated.View style={[styles.lineSkeleton, { backgroundColor: colors.border, borderRadius: borderRadius.sm, opacity, width: '100%' }]} />
        <Animated.View style={[styles.lineSkeleton, { backgroundColor: colors.border, borderRadius: borderRadius.sm, opacity, width: '70%' }]} />
        <View style={styles.footerRow}>
          <Animated.View style={[styles.smallTextSkeleton, { backgroundColor: colors.border, borderRadius: borderRadius.sm, opacity }]} />
          <Animated.View style={[styles.smallTextSkeleton, { backgroundColor: colors.border, borderRadius: borderRadius.sm, opacity, width: 80 }]} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {['1', '2', '3', '4', '5'].map(renderSkeletonCard)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconSkeleton: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleSkeleton: {
    height: 16,
    width: '50%',
  },
  badgeSkeleton: {
    height: 20,
    width: 50,
  },
  lineSkeleton: {
    height: 12,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  smallTextSkeleton: {
    height: 12,
    width: 60,
  }
});
