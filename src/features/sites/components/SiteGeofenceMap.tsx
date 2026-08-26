import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
  PanResponder,
} from 'react-native';
import { AppText } from '../../../components/typography/Text';
import { NavIcon } from '../../../components/NavIcon';
import { GOOGLE_MAPS_API_KEY } from '../../../config/env';

interface SiteGeofenceMapProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialRadius?: number;
  onCoordinatesChange?: (lat: number, lng: number, radius: number) => void;
}

export const SiteGeofenceMap: React.FC<SiteGeofenceMapProps> = ({
  initialLatitude = 23.143705,
  initialLongitude = 72.590203,
  initialRadius = 150,
  onCoordinatesChange,
}) => {
  const [mapType, setMapType] = useState<'map' | 'satellite'>('map');
  const [zoomLevel, setZoomLevel] = useState(17);

  const [latStr, setLatStr] = useState(String(initialLatitude));
  const [lngStr, setLngStr] = useState(String(initialLongitude));
  const [radiusStr, setRadiusStr] = useState(String(initialRadius));

  // Pinch-to-zoom Gesture Handler (Normal finger multi-touch gesture)
  const initialDistanceRef = useRef<number | null>(null);

  const getDistance = (touches: any[]) => {
    if (!touches || touches.length < 2) return 0;
    const [t1, t2] = touches;
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2,
      onPanResponderGrant: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          initialDistanceRef.current = getDistance(evt.nativeEvent.touches);
        }
      },
      onPanResponderMove: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          const currentDist = getDistance(evt.nativeEvent.touches);
          const initDist = initialDistanceRef.current;
          if (initDist && Math.abs(currentDist - initDist) > 25) {
            if (currentDist > initDist) {
              setZoomLevel((prev) => Math.min(21, prev + 1));
            } else {
              setZoomLevel((prev) => Math.max(1, prev - 1));
            }
            initialDistanceRef.current = currentDist;
          }
        }
      },
      onPanResponderRelease: () => {
        initialDistanceRef.current = null;
      },
    })
  ).current;

  const handleLatChange = (val: string) => {
    setLatStr(val);
    const numLat = parseFloat(val);
    const numLng = parseFloat(lngStr);
    const numRad = parseFloat(radiusStr);
    if (!isNaN(numLat) && !isNaN(numLng) && !isNaN(numRad) && onCoordinatesChange) {
      onCoordinatesChange(numLat, numLng, numRad);
    }
  };

  const handleLngChange = (val: string) => {
    setLngStr(val);
    const numLat = parseFloat(latStr);
    const numLng = parseFloat(val);
    const numRad = parseFloat(radiusStr);
    if (!isNaN(numLat) && !isNaN(numLng) && !isNaN(numRad) && onCoordinatesChange) {
      onCoordinatesChange(numLat, numLng, numRad);
    }
  };

  const handleRadiusChange = (val: string) => {
    setRadiusStr(val);
    const numLat = parseFloat(latStr);
    const numLng = parseFloat(lngStr);
    const numRad = parseFloat(val);
    if (!isNaN(numLat) && !isNaN(numLng) && !isNaN(numRad) && onCoordinatesChange) {
      onCoordinatesChange(numLat, numLng, numRad);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(21, prev + 1));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(1, prev - 1));
  };

  const currentLat = parseFloat(latStr) || 23.143705;
  const currentLng = parseFloat(lngStr) || 72.590203;

  return (
    <View style={styles.container}>
      {/* MAP CANVAS CONTAINER WITH FINGER PINCH GESTURES */}
      <View style={styles.mapContainer} {...panResponder.panHandlers}>
        {/* Real Live Google Map powered by API Key */}
        {Platform.OS === 'web' ? (
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0, width: '100%', height: '100%', borderRadius: 8, pointerEvents: 'auto' }}
            src={`https://www.google.com/maps/embed/v1/view?key=${GOOGLE_MAPS_API_KEY}&center=${currentLat},${currentLng}&zoom=${zoomLevel}&maptype=${
              mapType === 'satellite' ? 'satellite' : 'roadmap'
            }`}
            title="Google Map Geofence"
          />
        ) : (
          <Image
            source={{
              uri: `https://maps.googleapis.com/maps/api/staticmap?center=${currentLat},${currentLng}&zoom=${zoomLevel}&size=600x400&maptype=${
                mapType === 'satellite' ? 'satellite' : 'roadmap'
              }&markers=color:red%7C${currentLat},${currentLng}&key=${GOOGLE_MAPS_API_KEY}`,
            }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}

        {/* OVERLAY: GEOFENCE RED TRANSLUCENT BOUNDARY BOX */}
        <View style={styles.geofenceOverlayBox} pointerEvents="none">
          {/* Corner Resize Handles */}
          <View style={[styles.cornerHandle, styles.handleTL]} />
          <View style={[styles.cornerHandle, styles.handleTR]} />
          <View style={[styles.cornerHandle, styles.handleBL]} />
          <View style={[styles.cornerHandle, styles.handleBR]} />
          <View style={[styles.edgeHandle, styles.handleTop]} />
          <View style={[styles.edgeHandle, styles.handleBottom]} />
          <View style={[styles.edgeHandle, styles.handleLeft]} />
          <View style={[styles.edgeHandle, styles.handleRight]} />

          {/* Center Red Map Pin Marker */}
          <View style={styles.pinContainer}>
            <View style={styles.pinHead}>
              <View style={styles.pinDot} />
            </View>
            <View style={styles.pinNeedle} />
            <View style={styles.pinShadow} />
          </View>
        </View>

        {/* TOP LEFT CONTROLS: Map / Satellite Buttons */}
        <View style={styles.topLeftControls}>
          <View style={styles.mapTypeToggleGroup}>
            <TouchableOpacity
              style={[styles.mapTypeBtn, mapType === 'map' && styles.mapTypeBtnActive]}
              onPress={() => setMapType('map')}
              activeOpacity={0.8}
            >
              <AppText
                size="sm"
                weight={mapType === 'map' ? 'bold' : 'medium'}
                style={{ color: mapType === 'map' ? '#0F172A' : '#475569' }}
              >
                Map
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mapTypeBtn, mapType === 'satellite' && styles.mapTypeBtnActive]}
              onPress={() => setMapType('satellite')}
              activeOpacity={0.8}
            >
              <AppText
                size="sm"
                weight={mapType === 'satellite' ? 'bold' : 'medium'}
                style={{ color: mapType === 'satellite' ? '#0F172A' : '#475569' }}
              >
                Satellite
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* TOP RIGHT CONTROLS: Zoom Badge */}
        <View style={styles.topRightControls}>
          <View style={styles.zoomBadge}>
            <AppText size="xs" weight="semibold" style={{ color: '#334155', marginRight: 4 }}>
              Zoom: {zoomLevel}x
            </AppText>
            <AppText size="xs" style={{ color: '#4F46E5' }}>↖</AppText>
          </View>
        </View>

        {/* BOTTOM RIGHT CONTROLS: Zoom Buttons & Fullscreen */}
        <View style={styles.bottomRightControls}>
          <View style={styles.zoomBtnBox}>
            <TouchableOpacity style={styles.zoomControlBtn} onPress={handleZoomIn} activeOpacity={0.7}>
              <AppText size="lg" weight="bold" style={{ color: '#334155' }}>+</AppText>
            </TouchableOpacity>
            <View style={styles.zoomDivider} />
            <TouchableOpacity style={styles.zoomControlBtn} onPress={handleZoomOut} activeOpacity={0.7}>
              <AppText size="lg" weight="bold" style={{ color: '#334155' }}>−</AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* BOTTOM LEFT: Google Branding Logo */}
        <View style={styles.bottomLeftGoogleLogo} pointerEvents="none">
          <AppText size="sm" weight="bold" style={{ color: '#4285F4', letterSpacing: -0.5 }}>
            G<AppText style={{ color: '#EA4335' }}>o</AppText>
            <AppText style={{ color: '#FBBC05' }}>o</AppText>
            <AppText style={{ color: '#4285F4' }}>g</AppText>
            <AppText style={{ color: '#34A853' }}>l</AppText>
            <AppText style={{ color: '#EA4335' }}>e</AppText>
          </AppText>
        </View>
      </View>

      {/* BOTTOM INPUT FIELDS ROW: Latitude, Longitude, Radius */}
      
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  mapContainer: {
    height: 340,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  nativeMapBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#F3F4F6',
  },
  nativeSatelliteBg: {
    backgroundColor: '#1E293B',
  },
  streetGridHorizontal: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: '#E2E8F0',
  },
  streetGridVertical: {
    position: 'absolute',
    left: 140,
    top: 0,
    bottom: 0,
    width: 32,
    backgroundColor: '#E2E8F0',
  },
  mainHighwayLine: {
    position: 'absolute',
    top: 140,
    left: -40,
    right: -40,
    height: 18,
    backgroundColor: '#CBD5E1',
    transform: [{ rotate: '-8deg' }],
  },
  secondaryRoadLine: {
    position: 'absolute',
    left: 200,
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: '#CBD5E1',
  },
  labelServiceRd: {
    position: 'absolute',
    top: 60,
    left: 160,
    color: '#64748B',
  },
  labelZundalCircle: {
    position: 'absolute',
    top: 115,
    left: 120,
    color: '#475569',
  },
  labelSPRing: {
    position: 'absolute',
    top: 155,
    right: 30,
    color: '#64748B',
  },
  labelChandkheda: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    color: '#64748B',
  },
  geofenceOverlayBox: {
    position: 'absolute',
    top: '18%',
    left: '18%',
    right: '18%',
    bottom: '18%',
    backgroundColor: 'rgba(239, 68, 68, 0.22)',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cornerHandle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  handleTL: { top: -4, left: -4 },
  handleTR: { top: -4, right: -4 },
  handleBL: { bottom: -4, left: -4 },
  handleBR: { bottom: -4, right: -4 },
  edgeHandle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  handleTop: { top: -4, left: '50%', marginLeft: -4 },
  handleBottom: { bottom: -4, left: '50%', marginLeft: -4 },
  handleLeft: { left: -4, top: '50%', marginTop: -4 },
  handleRight: { right: -4, top: '50%', marginTop: -4 },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinHead: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  pinNeedle: {
    width: 3,
    height: 10,
    backgroundColor: '#DC2626',
    marginTop: -2,
  },
  pinShadow: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginTop: 1,
  },
  topLeftControls: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 20,
    gap: 6,
  },
  mapTypeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  mapTypeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  mapTypeBtnActive: {
    backgroundColor: '#F1F5F9',
  },
  topRightControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 20,
  },
  zoomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  bottomRightControls: {
    position: 'absolute',
    bottom: 12,
    right: 10,
    zIndex: 20,
  },
  zoomBtnBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    alignItems: 'center',
  },
  zoomControlBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomDivider: {
    width: 24,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  bottomLeftGoogleLogo: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    zIndex: 20,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  inputFieldCol: {
    flex: 1,
  },
  inputLabel: {
    marginBottom: 4,
    fontWeight: '600',
    color: '#475569',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#0F172A',
  },
});
