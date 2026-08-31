import { useEffect, useRef } from 'react';
import { useGuardStore } from '../store/useGuardStore';
import { GeofenceService, calculateDistanceMeters } from '../services/geofence.service';
import { LoggerService } from '../services/logger.service';
import { getTable, DBSite } from '../services/db';

export const useGeofenceMonitor = (intervalMs: number = 10000) => {
  const {
    isClockedIn,
    assignedSiteDetails,
    assignedSiteId,
    assignedSite,
    updateGeofenceMonitoringStatus,
  } = useGuardStore();

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!isClockedIn) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        LoggerService.log('[useGeofenceMonitor] Shift inactive / Clocked out. Continuous geofence monitoring stopped.');
      }
      return;
    }

    LoggerService.log('[useGeofenceMonitor] Shift active / Clocked in. Continuous geofence monitoring started.');

    const checkGeofence = async () => {
      try {
        let site = assignedSiteDetails;
        if (!site) {
          const allSites = await getTable<DBSite>('sites');
          site = allSites.find(s => s.id === assignedSiteId || s.name === assignedSite) || allSites.find(s => s.id === 's-04') || allSites[0] || null;
        }

        const siteLat = site?.geofence?.latitude ?? site?.coordinates?.latitude ?? 23.1297621;
        const siteLng = site?.geofence?.longitude ?? site?.coordinates?.longitude ?? 72.5836992;
        const radiusMeters = site?.geofence?.radiusMeters ?? site?.coordinates?.radiusMeters ?? 150;

        const loc = await GeofenceService.getCurrentGPSLocation();

        if (loc.success && loc.latitude !== undefined && loc.longitude !== undefined) {
          const distance = calculateDistanceMeters(loc.latitude, loc.longitude, siteLat, siteLng);
          const isOutside = distance > radiusMeters;
          await updateGeofenceMonitoringStatus(isOutside, distance, radiusMeters);
        }
      } catch (err: any) {
        LoggerService.log(`[useGeofenceMonitor] Monitoring check error: ${err?.message || err}`, 'warn');
      }
    };

    // Run initial check immediately
    checkGeofence();

    // Set up continuous monitoring timer
    timerRef.current = setInterval(checkGeofence, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isClockedIn, assignedSiteDetails, assignedSiteId, assignedSite, intervalMs, updateGeofenceMonitoringStatus]);
};
