import { calculateDistanceMeters, GeofenceService } from '../src/services/geofence.service';
import { PermissionsService } from '../src/services/permissions.service';
import { DBSite } from '../src/services/db';

describe('Geofence Service & Distance Calculations', () => {
  const mockSite: DBSite = {
    id: 's-04',
    companyId: 'c-1',
    name: 'Ranucle zundal',
    code: 's-04',
    clientName: 'Ranucle Group',
    branch: 'West Zone',
    facilityType: 'Commercial Port',
    supervisorName: 'Daniel Brooks',
    guardsCount: 15,
    riskLevel: 'Medium',
    contractEnd: '2027-12-31',
    status: 'active',
    addressLine1: 'Zundal Circle',
    city: 'Gandhinagar',
    state: 'Gujarat',
    postalCode: '382424',
    country: 'India',
    coordinates: {
      latitude: 23.1437,
      longitude: 72.5902,
      radiusMeters: 150,
    },
    geofence: {
      boundaryType: 'Circle',
      latitude: 23.1437,
      longitude: 72.5902,
      radiusMeters: 150,
      status: 'Active Boundary',
    },
  };

  afterEach(() => {
    GeofenceService.setMockLocation(null);
    jest.restoreAllMocks();
  });

  test('Test 1: Haversine distance calculation for identical coordinates returns 0m', () => {
    const dist = calculateDistanceMeters(23.1437, 72.5902, 23.1437, 72.5902);
    expect(dist).toBe(0);
  });

  test('Test 2: Haversine distance calculation for nearby location inside 150m radius', () => {
    // Offset by ~0.0004 deg lat (~44 meters)
    const dist = calculateDistanceMeters(23.1437, 72.5902, 23.1441, 72.5902);
    expect(dist).toBeGreaterThan(30);
    expect(dist).toBeLessThan(100);
  });

  test('Test 3: Haversine distance calculation for location outside 150m radius', () => {
    // Offset by ~0.003 deg lat (~330 meters)
    const dist = calculateDistanceMeters(23.1437, 72.5902, 23.1467, 72.5902);
    expect(dist).toBeGreaterThan(300);
  });

  test('Test 4: Clock In validation succeeds when guard is inside site geofence', async () => {
    jest.spyOn(PermissionsService, 'checkLocation').mockResolvedValue('granted');
    GeofenceService.setMockLocation({
      latitude: 23.1438, // ~11 meters away
      longitude: 72.5902,
      accuracy: 10,
    });

    const result = await GeofenceService.validateClockInGeofence(mockSite);
    expect(result.allowed).toBe(true);
    expect(result.isOutside).toBe(false);
    expect(result.distanceMeters).toBeLessThan(150);
  });

  test('Test 5: Clock In validation fails and blocks when guard is outside site geofence', async () => {
    jest.spyOn(PermissionsService, 'checkLocation').mockResolvedValue('granted');
    GeofenceService.setMockLocation({
      latitude: 23.1480, // ~475 meters away
      longitude: 72.5902,
      accuracy: 10,
    });

    const result = await GeofenceService.validateClockInGeofence(mockSite);
    expect(result.allowed).toBe(false);
    expect(result.isOutside).toBe(true);
    expect(result.message).toBe('You are outside the site geofence. You cannot clock in from this location.');
  });

  test('Test 6: Clock In validation handles location permission denied safely', async () => {
    jest.spyOn(PermissionsService, 'checkLocation').mockResolvedValue('denied');

    const result = await GeofenceService.validateClockInGeofence(mockSite);
    expect(result.allowed).toBe(false);
    expect(result.errorType).toBe('PERMISSION_DENIED');
    expect(result.message).toContain('Location permission required');
  });

  test('Test 7: Clock In validation handles inaccurate GPS location safely', async () => {
    jest.spyOn(PermissionsService, 'checkLocation').mockResolvedValue('granted');
    GeofenceService.setMockLocation({
      latitude: 23.1437,
      longitude: 72.5902,
      accuracy: 150, // Accuray > 100m limit
    });

    const result = await GeofenceService.validateClockInGeofence(mockSite);
    expect(result.allowed).toBe(false);
    expect(result.errorType).toBe('INACCURATE_LOCATION');
    expect(result.message).toContain('inaccurate');
  });
});
