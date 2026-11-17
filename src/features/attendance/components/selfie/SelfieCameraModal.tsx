import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';
import { X } from 'lucide-react-native';
import { AppText } from '../../../../components/typography/Text';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SelfieCameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}

export const SelfieCameraModal: React.FC<SelfieCameraModalProps> = ({
  visible,
  onClose,
  onCapture,
}) => {
  const cameraRef = useRef<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const photo = await cameraRef.current.capture();
      
      const rawUri = photo?.uri || photo?.path || '';
      const finalUri = rawUri.startsWith('file://') || rawUri.startsWith('content://') 
        ? rawUri 
        : `file://${rawUri}`;

      if (finalUri) {
        onCapture(finalUri);
        onClose();
      }
    } catch (err) {
      console.error('[SelfieCameraModal] Capture error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Strictly Front Camera Only (No Flip/Change Camera & No Portrait/Mode Options) */}
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          cameraType={CameraType.Front}
          flashMode="auto"
          focusMode="on"
          zoomMode="off"
          showFrame={false}
          scanBarcode={false}
        />

        {/* Top Overlay Bar */}
        <View style={styles.topBar}>
          <View style={styles.titleContainer}>
            <AppText size="base" weight="bold" style={styles.titleText}>
              Selfie Verification
            </AppText>
            <AppText size="xs" style={styles.subtitleText}>
              Front Camera • Auto-Mode
            </AppText>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Center Face Alignment Guide Oval */}
        <View style={styles.centerContainer} pointerEvents="none">
          <View style={styles.faceOvalGuide}>
            <View style={styles.faceOvalInner} />
          </View>
          <View style={styles.guideBadge}>
            <AppText size="xs" weight="bold" style={styles.guideText}>
              Fit your face inside the oval
            </AppText>
          </View>
        </View>

        {/* Bottom Shutter Capture Bar (No change camera / No portrait) */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.shutterOuterRing, isCapturing && { opacity: 0.6 }]}
            onPress={handleCapture}
            disabled={isCapturing}
            activeOpacity={0.7}
          >
            <View style={styles.shutterInnerCircle}>
              {isCapturing ? (
                <ActivityIndicator size="small" color="#4F46E5" />
              ) : (
                <View style={styles.shutterCenterDot} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleText: {
    color: '#E2E8F0',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  centerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  faceOvalGuide: {
    width: SCREEN_WIDTH * 0.72,
    height: SCREEN_WIDTH * 0.95,
    borderRadius: SCREEN_WIDTH * 0.36,
    borderWidth: 2.5,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  faceOvalInner: {
    width: '92%',
    height: '92%',
    borderRadius: SCREEN_WIDTH * 0.33,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  guideBadge: {
    marginTop: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.4)',
  },
  guideText: {
    color: '#EEF2FF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  bottomBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 32,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  shutterOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  shutterInnerCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterCenterDot: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4F46E5',
  },
});
