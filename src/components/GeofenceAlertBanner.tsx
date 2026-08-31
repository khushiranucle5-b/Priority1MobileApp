import React from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { AppText } from './typography/Text';
import { useGuardStore } from '../store/useGuardStore';
import { useTheme } from '../providers/ThemeProvider';

export const GeofenceAlertBanner: React.FC = () => {
  const { colors, borderRadius } = useTheme();
  const { isClockedIn, geofenceState, assignedSite } = useGuardStore();

  if (!isClockedIn || !geofenceState?.isOutside) {
    return null;
  }

  const distanceText = geofenceState.distanceMeters !== null
    ? `${geofenceState.distanceMeters}m from site`
    : 'outside boundary';

  const handleInfoPress = () => {
    Alert.alert(
      'Geofence Alert Details',
      `You are currently ${distanceText} (site radius limit: ${geofenceState.radiusMeters}m for ${assignedSite || 'Assigned Site'}).\n\nPlease return inside the designated site boundary immediately.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleInfoPress}
      style={[
        styles.banner,
        {
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          borderRadius: borderRadius.md,
        },
      ]}
    >
      <View style={styles.content}>
        <AppText style={styles.icon}>⚠️</AppText>
        <View style={styles.textContainer}>
          <AppText size="sm" weight="bold" style={{ color: '#991B1B' }}>
            You have left the site geofence.
          </AppText>
          <AppText size="xs" style={{ color: '#B91C1C', marginTop: 2 }}>
            Current Distance: {distanceText} (Allowed Radius: {geofenceState.radiusMeters}m)
          </AppText>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
});
