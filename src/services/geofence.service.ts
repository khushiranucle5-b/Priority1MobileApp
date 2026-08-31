import { PermissionsService } from './permissions.service';
import { LoggerService } from './logger.service';
import { DBSite } from './db';

declare var navigator: any;

export interface LocationResult {
  success: boolean;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  errorType?: 'PERMISSION_DENIED' | 'GPS_DISABLED' | 'LOCATION_UNAVAILABLE' | 'INACCURATE_LOCATION' | 'SITE_NOT_CONFIGURED';
  message?: string;
}

export interface GeofenceValidationResult {
  allowed: boolean;
  distanceMeters?: number;
  radiusMeters?: number;
  message: string;
  isOutside?: boolean;
  errorType?: string;
  currentLat?: number;
  currentLng?: number;
}

export type DevMockMode = 'REAL_GPS' | 'INSIDE' | 'OUTSIDE' | 'POOR_ACCURACY' | 'PERMISSION_DENIED' | 'LOCATION_UNAVAILABLE';

// In-memory mock location for dev / simulator testing if set (Defaulted to INSIDE mode)
let mockLocationOverride: { latitude?: number; longitude?: number; accuracy?: number; mode?: DevMockMode } | null = {
  latitude: 23.1297621,
  longitude: 72.5836992,
  accuracy: 10,
  mode: 'INSIDE',
};

/**
 * Calculate distance between two GPS coordinates using the Haversine formula
 * Returns distance in meters
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export const GeofenceService = {
  /**
   * Set mock location or simulation mode for dev / simulator testing
   */
  setMockLocation: (loc: { latitude?: number; longitude?: number; accuracy?: number; mode?: DevMockMode } | null) => {
    mockLocationOverride = loc;
    LoggerService.log(`[GeofenceService] Dev Mock location state updated: ${JSON.stringify(loc)}`);
  },

  /**
   * Get fresh GPS location with permission checks, status checks, and accuracy validation.
   * NO hardcoded inside-site fallbacks on error.
   */
  getCurrentGPSLocation: async (): Promise<LocationResult> => {
    // Check developer simulator override state
    if (mockLocationOverride) {
      const mode = mockLocationOverride.mode || 'INSIDE';
      if (mode === 'PERMISSION_DENIED') {
        return {
          success: false,
          errorType: 'PERMISSION_DENIED',
          message: 'Location permission required. Please enable Location permissions in device settings.',
        };
      }
      if (mode === 'LOCATION_UNAVAILABLE') {
        return {
          success: false,
          errorType: 'LOCATION_UNAVAILABLE',
          message: 'GPS location services are disabled or unavailable. Please enable GPS on your device.',
        };
      }
      if (mode === 'POOR_ACCURACY') {
        const acc = mockLocationOverride.accuracy ?? 150;
        return {
          success: false,
          errorType: 'INACCURATE_LOCATION',
          message: `Your location accuracy is too low (${Math.round(acc)}m). Please enable precise location and try again.`,
        };
      }
      if (mode === 'OUTSIDE' && mockLocationOverride.latitude !== undefined && mockLocationOverride.longitude !== undefined) {
        return {
          success: true,
          latitude: mockLocationOverride.latitude,
          longitude: mockLocationOverride.longitude,
          accuracy: mockLocationOverride.accuracy ?? 15,
        };
      }
      if (mode === 'INSIDE' && mockLocationOverride.latitude !== undefined && mockLocationOverride.longitude !== undefined) {
        return {
          success: true,
          latitude: mockLocationOverride.latitude,
          longitude: mockLocationOverride.longitude,
          accuracy: mockLocationOverride.accuracy ?? 10,
        };
      }
    }

    // 1. Check runtime location permission
    const permStatus = await PermissionsService.checkLocation();
    if (permStatus !== 'granted') {
      LoggerService.log(`[GeofenceService] Location permission not granted: ${permStatus}`, 'warn');
      return {
        success: false,
        errorType: 'PERMISSION_DENIED',
        message: 'Location permission required. Please enable Location permissions in device settings.',
      };
    }

    // 2. Acquire fresh position using navigator.geolocation with high accuracy
    return new Promise<LocationResult>((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        LoggerService.log('[GeofenceService] navigator.geolocation is unavailable', 'warn');
        resolve({
          success: false,
          errorType: 'LOCATION_UNAVAILABLE',
          message: 'Location hardware/service is unavailable on this device.',
        });
        return;
      }

      let isResolved = false;
      const timeoutId = setTimeout(() => {
        if (isResolved) return;
        isResolved = true;
        LoggerService.log('[GeofenceService] GPS location fetch timed out after 6000ms', 'warn');
        resolve({
          success: false,
          errorType: 'LOCATION_UNAVAILABLE',
          message: 'Unable to acquire fresh GPS location. Please check GPS signal and try again.',
        });
      }, 6000);

      navigator.geolocation.getCurrentPosition(
        (pos: any) => {
          if (isResolved) return;
          isResolved = true;
          clearTimeout(timeoutId);

          const { latitude, longitude, accuracy } = pos.coords || {};

          if (latitude === undefined || longitude === undefined) {
            resolve({
              success: false,
              errorType: 'LOCATION_UNAVAILABLE',
              message: 'Invalid GPS coordinates received from device location service.',
            });
            return;
          }

          // Enforce Sensible Accuracy Threshold (<= 100 meters)
          if (accuracy && accuracy > 100) {
            LoggerService.log(`[GeofenceService] Location accuracy too poor: ${accuracy}m`, 'warn');
            resolve({
              success: false,
              errorType: 'INACCURATE_LOCATION',
              message: `Your location accuracy is too low (${Math.round(accuracy)}m). Please enable precise location and try again.`,
            });
            return;
          }

          resolve({
            success: true,
            latitude,
            longitude,
            accuracy: accuracy || 15,
          });
        },
        (err: any) => {
          if (isResolved) return;
          isResolved = true;
          clearTimeout(timeoutId);

          LoggerService.log(`[GeofenceService] getCurrentPosition error code ${err.code}: ${err.message}`, 'warn');

          if (err.code === 1) { // PERMISSION_DENIED
            resolve({
              success: false,
              errorType: 'PERMISSION_DENIED',
              message: 'Location permission required. Please enable Location permissions in device settings.',
            });
          } else if (err.code === 2) { // POSITION_UNAVAILABLE / GPS disabled
            resolve({
              success: false,
              errorType: 'GPS_DISABLED',
              message: 'GPS location services are disabled or unavailable. Please enable GPS on your device.',
            });
          } else {
            resolve({
              success: false,
              errorType: 'LOCATION_UNAVAILABLE',
              message: 'Unable to acquire fresh GPS location. Please check your location settings and try again.',
            });
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  },

  /**
   * Authoritative Geofence Validation for Attendance (Clock In & Clock Out)
   */
  validateAttendanceGeofence: async (
    site: DBSite | null,
    actionType: 'Clock In' | 'Clock Out'
  ): Promise<GeofenceValidationResult> => {
    // 1. Verify that site location and geofence are properly configured (Case 9)
    const siteLat = site?.geofence?.latitude ?? site?.coordinates?.latitude;
    const siteLng = site?.geofence?.longitude ?? site?.coordinates?.longitude;
    const radiusMeters = site?.geofence?.radiusMeters ?? site?.coordinates?.radiusMeters;

    if (!site || siteLat === undefined || siteLng === undefined || siteLat === null || siteLng === null || !radiusMeters) {
      LoggerService.log(`[GeofenceService] Site location not configured for site: ${site?.name || 'Unassigned'}`, 'warn');
      return {
        allowed: false,
        message: 'Site location is not configured. Please contact your administrator.',
        errorType: 'SITE_NOT_CONFIGURED',
      };
    }

    LoggerService.log(`[GeofenceService] Validating ${actionType} against site geofence: Lat=${siteLat}, Lng=${siteLng}, Radius=${radiusMeters}m`);

    // 2. Fetch fresh GPS coordinates
    const locResult = await GeofenceService.getCurrentGPSLocation();

    if (!locResult.success || locResult.latitude === undefined || locResult.longitude === undefined) {
      return {
        allowed: false,
        message: locResult.message || `Unable to verify GPS location. ${actionType} blocked for security.`,
        errorType: locResult.errorType || 'LOCATION_UNAVAILABLE',
      };
    }

    // 3. Calculate distance between user GPS and site geofence center using Haversine formula
    const distance = calculateDistanceMeters(
      locResult.latitude,
      locResult.longitude,
      siteLat,
      siteLng
    );

    LoggerService.log(`[GeofenceService] Current Location: (${locResult.latitude}, ${locResult.longitude}), Distance: ${distance}m, Radius: ${radiusMeters}m`);

    // 4. Compare distance with allowed geofence radius
    if (distance > radiusMeters) {
      const defaultOutsideMsg = actionType === 'Clock In'
        ? 'You are outside the permitted site area. Move inside the geofence to clock in.'
        : 'You are outside the permitted site area. Move inside the geofence to clock out.';

      return {
        allowed: false,
        distanceMeters: distance,
        radiusMeters,
        message: defaultOutsideMsg,
        isOutside: true,
        currentLat: locResult.latitude,
        currentLng: locResult.longitude,
      };
    }

    return {
      allowed: true,
      distanceMeters: distance,
      radiusMeters,
      message: 'Inside site geofence',
      isOutside: false,
      currentLat: locResult.latitude,
      currentLng: locResult.longitude,
    };
  },

  /**
   * Validate if guard is inside the site geofence for Clock In
   */
  validateClockInGeofence: async (site: DBSite | null): Promise<GeofenceValidationResult> => {
    return GeofenceService.validateAttendanceGeofence(site, 'Clock In');
  },

  /**
   * Validate if guard is inside the site geofence for Clock Out
   */
  validateClockOutGeofence: async (site: DBSite | null): Promise<GeofenceValidationResult> => {
    return GeofenceService.validateAttendanceGeofence(site, 'Clock Out');
  },
};

