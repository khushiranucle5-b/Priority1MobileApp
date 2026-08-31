import React, { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Alert } from 'react-native';
import { AppText } from './typography/Text';
import { Heading } from './typography/Heading';
import { Button } from './Button';
import { useTheme } from '../providers/ThemeProvider';
import { GeofenceService, DevMockMode } from '../services/geofence.service';
import { useGuardStore } from '../store/useGuardStore';

interface DevLocationSimulatorProps {
  visible: boolean;
  onClose: () => void;
}

export const DevLocationSimulator: React.FC<DevLocationSimulatorProps> = ({ visible, onClose }) => {
  const { colors, borderRadius } = useTheme();
  const { assignedSiteDetails } = useGuardStore();
  const [activeMode, setActiveMode] = useState<DevMockMode>('REAL_GPS');

  // Site center reference (Zundal site default: 23.1297621, 72.5836992)
  const siteLat = assignedSiteDetails?.geofence?.latitude ?? assignedSiteDetails?.coordinates?.latitude ?? 23.1297621;
  const siteLng = assignedSiteDetails?.geofence?.longitude ?? assignedSiteDetails?.coordinates?.longitude ?? 72.5836992;

  const handleSelectMode = (mode: DevMockMode) => {
    setActiveMode(mode);

    if (mode === 'REAL_GPS') {
      GeofenceService.setMockLocation(null);
      Alert.alert('Dev Simulator', 'Location reset to Real GPS hardware mode.');
    } else if (mode === 'INSIDE') {
      GeofenceService.setMockLocation({
        latitude: siteLat,
        longitude: siteLng,
        accuracy: 10,
        mode: 'INSIDE',
      });
      Alert.alert('Dev Simulator', `Mock location set to INSIDE site geofence (${siteLat.toFixed(5)}, ${siteLng.toFixed(5)}).`);
    } else if (mode === 'OUTSIDE') {
      // Offset by ~0.008 deg lat (~880 meters away)
      const outsideLat = siteLat + 0.008;
      const outsideLng = siteLng + 0.008;
      GeofenceService.setMockLocation({
        latitude: outsideLat,
        longitude: outsideLng,
        accuracy: 10,
        mode: 'OUTSIDE',
      });
      Alert.alert('Dev Simulator', `Mock location set to OUTSIDE site geofence (~880m away).`);
    } else if (mode === 'POOR_ACCURACY') {
      GeofenceService.setMockLocation({
        latitude: siteLat,
        longitude: siteLng,
        accuracy: 180,
        mode: 'POOR_ACCURACY',
      });
      Alert.alert('Dev Simulator', 'Mock GPS set to POOR ACCURACY (180m accuracy).');
    } else if (mode === 'PERMISSION_DENIED') {
      GeofenceService.setMockLocation({
        mode: 'PERMISSION_DENIED',
      });
      Alert.alert('Dev Simulator', 'Mock condition set to PERMISSION DENIED.');
    } else if (mode === 'LOCATION_UNAVAILABLE') {
      GeofenceService.setMockLocation({
        mode: 'LOCATION_UNAVAILABLE',
      });
      Alert.alert('Dev Simulator', 'Mock condition set to LOCATION UNAVAILABLE / GPS OFF.');
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderRadius: borderRadius.xl, borderColor: colors.border }]}>
          <View style={styles.header}>
            <Heading level="h4" color="primary">🛠 Developer Location Simulator</Heading>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <AppText size="lg" weight="bold" color="secondary">✕</AppText>
            </TouchableOpacity>
          </View>

          <AppText size="xs" color="secondary" style={styles.subtitle}>
            Test Clock In / Clock Out behavior across all geofence edge cases without physical movement.
          </AppText>

          <View style={styles.buttonList}>
            <Button
              title="📍 INSIDE Site Geofence"
              variant={activeMode === 'INSIDE' ? 'primary' : 'outline'}
              size="medium"
              fullWidth
              onPress={() => handleSelectMode('INSIDE')}
              style={styles.optionBtn}
            />

            <Button
              title="🚫 OUTSIDE Site Geofence (~880m away)"
              variant={activeMode === 'OUTSIDE' ? 'danger' : 'outline'}
              size="medium"
              fullWidth
              onPress={() => handleSelectMode('OUTSIDE')}
              style={styles.optionBtn}
            />

            <Button
              title="⚠️ POOR GPS Accuracy (180m)"
              variant={activeMode === 'POOR_ACCURACY' ? 'secondary' : 'outline'}
              size="medium"
              fullWidth
              onPress={() => handleSelectMode('POOR_ACCURACY')}
              style={styles.optionBtn}
            />

            <Button
              title="🔒 Permission Denied"
              variant={activeMode === 'PERMISSION_DENIED' ? 'secondary' : 'outline'}
              size="medium"
              fullWidth
              onPress={() => handleSelectMode('PERMISSION_DENIED')}
              style={styles.optionBtn}
            />

            <Button
              title="📡 Location Unavailable / GPS Off"
              variant={activeMode === 'LOCATION_UNAVAILABLE' ? 'secondary' : 'outline'}
              size="medium"
              fullWidth
              onPress={() => handleSelectMode('LOCATION_UNAVAILABLE')}
              style={styles.optionBtn}
            />

            <Button
              title="🔄 Reset to Real GPS Hardware"
              variant={activeMode === 'REAL_GPS' ? 'primary' : 'secondary'}
              size="medium"
              fullWidth
              onPress={() => handleSelectMode('REAL_GPS')}
              style={styles.optionBtn}
            />
          </View>

          <Button title="CLOSE SIMULATOR" variant="primary" size="large" fullWidth onPress={onClose} style={{ marginTop: 16 }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 6,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
  },
  buttonList: {
    gap: 10,
  },
  optionBtn: {
    marginVertical: 0,
  },
});
