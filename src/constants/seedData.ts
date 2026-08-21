export const SEED_DATA = {
  "companies": [
    {
      "id": "c-1",
      "name": "Acme Security Services",
      "email": "admin@acme.io",
      "adminName": "Jordan Blake",
      "adminEmail": "admin@acme.io",
      "phone": "+1 (415) 555-0102",
      "website": "https://acme-security.io",
      "gst": "GST-ACME9082",
      "taxId": "TX-1234567",
      "regNumber": "REG-99120",
      "licenseNumber": "LIC-88219-SEC",
      "addressLine1": "1 Market St",
      "addressLine2": "Suite 500",
      "city": "San Francisco",
      "state": "California",
      "country": "United States",
      "zip": "94105",
      "postalCode": "94105",
      "address": "1 Market St, Suite 500, San Francisco, California, United States - 94105",
      "status": "active",
      "onboardStep": 9,
      "createdDate": "2026-04-10T12:00:00Z",
      "plan": "starter",
      "planId": "p-starter",
      "billingCycle": "monthly",
      "branchesCount": 1,
      "sitesCount": 3,
      "guardsCount": 10,
      "employeesCount": 4
    },
    {
      "id": "c-3buhqgl-1785937951554",
      "name": "Guardian Shield Security Services Ltd.",
      "email": "contact@guardianshield.com",
      "adminName": "Michael Anderson",
      "adminEmail": "michael.anderson@guardianshield.com",
      "phone": "+1 (713) 555-2847",
      "website": "https://guardianshield.com",
      "gst": "GST99210-SEC",
      "taxId": "TAX-88912",
      "regNumber": "REG-77123",
      "licenseNumber": "LIC-99812",
      "addressLine1": "742 Security Plaza, Suite 300",
      "addressLine2": "Tower B",
      "city": "Houston",
      "state": "Texas",
      "country": "United States",
      "zip": "77002",
      "postalCode": "77002",
      "address": "742 Security Plaza, Suite 300, Tower B, Houston, Texas, United States - 77002",
      "status": "active",
      "onboardStep": 9,
      "createdDate": "2026-08-05T10:00:00Z",
      "plan": "enterprise",
      "planId": "p-enterprise",
      "billingCycle": "monthly",
      "branchesCount": 3,
      "sitesCount": 18,
      "guardsCount": 85,
      "employeesCount": 92
    },
    {
      "id": "c-101",
      "name": "Apex Armor Guard Operations",
      "email": "info@apexarmor.io",
      "adminName": "Sarah Jenkins",
      "adminEmail": "sarah.j@apexarmor.io",
      "phone": "+1 (415) 555-0199",
      "website": "https://apexarmor.io",
      "gst": "GST-APX8812",
      "taxId": "TAX-44120",
      "regNumber": "REG-33100",
      "licenseNumber": "LIC-55190",
      "addressLine1": "100 Embarcadero Center",
      "addressLine2": "Floor 12",
      "city": "San Francisco",
      "state": "California",
      "country": "United States",
      "zip": "94111",
      "postalCode": "94111",
      "address": "100 Embarcadero Center, Floor 12, San Francisco, California, United States - 94111",
      "status": "active",
      "onboardStep": 9,
      "createdDate": "2026-06-15T08:30:00Z",
      "plan": "professional",
      "planId": "p-professional",
      "billingCycle": "monthly",
      "branchesCount": 2,
      "sitesCount": 10,
      "guardsCount": 45,
      "employeesCount": 50
    }
  ],
  "employees": [],
  "attendance": [
    {
      "id": "log-001",
      "employeeId": "emp-101",
      "employeeName": "David Chen",
      "employeeEmail": "david.c@priority-one.io",
      "badge": "DC-101",
      "date": "2026-08-03",
      "shift": "Day Shift Guard - ranucle HQ",
      "clockIn": "07:55 AM",
      "clockOut": "Ongoing",
      "hours": "7h 35m",
      "clockInGps": "ranucle site - Gate A (Inside Geofence)",
      "clockOutGps": "—",
      "status": "Present",
      "verified": true
    },
    {
      "id": "log-002",
      "employeeId": "emp-104",
      "employeeName": "Marcus Bell",
      "employeeEmail": "marcus.b@priority-one.io",
      "badge": "MB-104",
      "date": "2026-08-03",
      "shift": "Night Maritime Patrol - Harbor Terminal",
      "clockIn": "09:50 PM",
      "clockOut": "06:05 AM",
      "hours": "8h 15m",
      "clockInGps": "Harbor Terminal 44 - Pier Gate",
      "clockOutGps": "Harbor Terminal 44 - Pier Gate",
      "status": "Present",
      "verified": true
    },
    {
      "id": "log-003",
      "employeeId": "emp-102",
      "employeeName": "Elena Ruiz",
      "employeeEmail": "elena.r@priority-one.io",
      "badge": "ER-102",
      "date": "2026-08-03",
      "shift": "Supervisor Audit Duty - ranucle HQ",
      "clockIn": "08:50 AM",
      "clockOut": "Ongoing",
      "hours": "6h 40m",
      "clockInGps": "Financial Plaza Tower - Main Lobby",
      "clockOutGps": "—",
      "status": "Present",
      "verified": true
    },
    {
      "id": "log-004",
      "employeeId": "emp-105",
      "employeeName": "Michael Roberts",
      "employeeEmail": "michael.r@priority-one.io",
      "badge": "MR-105",
      "date": "2026-08-03",
      "shift": "Evening Retail Patrol - Riverside",
      "clockIn": "01:55 PM",
      "clockOut": "Ongoing",
      "hours": "1h 35m",
      "clockInGps": "Riverside Mall - North Gate",
      "clockOutGps": "—",
      "status": "Present",
      "verified": true
    },
    {
      "id": "log-005",
      "employeeId": "emp-106",
      "employeeName": "Alex Mendes",
      "employeeEmail": "alex.m@ranucle.com",
      "badge": "AM-106",
      "date": "2026-08-03",
      "shift": "Port Main Gate Duty - Setubal",
      "clockIn": "06:55 AM",
      "clockOut": "03:05 PM",
      "hours": "8h 10m",
      "clockInGps": "Setubal Terminal - Gate 1",
      "clockOutGps": "Setubal Terminal - Gate 1",
      "status": "Present",
      "verified": true
    }
  ],
  "leaves": [],
  "patrols": [
    {
      "id": "patrol-aug21-morning",
      "patrolCode": "PT-2026-0821-01",
      "title": "Morning Perimeter Patrol",
      "companyId": "c-1",
      "site": "Ahmedabad Plant",
      "guard": "Khushi Rani",
      "guardId": "guard-1",
      "date": "2026-08-21",
      "startTime": "08:00 AM",
      "endTime": "08:45 AM",
      "scheduledStartTime": "08:00 AM",
      "scheduledEndTime": "09:00 AM",
      "startBufferMinutes": 15,
      "status": "Completed",
      "checkpoints": 5,
      "scanned": 5,
      "missed": 0,
      "incidents": 0,
      "lastCheckpoint": "Emergency Exit B"
    },
    {
      "id": "patrol-aug21-evening",
      "patrolCode": "PT-2026-0821-02",
      "title": "Evening Perimeter Patrol",
      "companyId": "c-1",
      "site": "Ahmedabad Plant",
      "guard": "Khushi Rani",
      "guardId": "guard-1",
      "date": "2026-08-21",
      "startTime": "08:00 PM",
      "scheduledStartTime": "08:00 PM",
      "scheduledEndTime": "09:00 PM",
      "startBufferMinutes": 15,
      "status": "Scheduled",
      "checkpoints": 5,
      "scanned": 0,
      "missed": 0,
      "incidents": 0,
      "lastCheckpoint": "Pending Start"
    }
  ],
  "incidents": [
    {
      "id": "i-inc-001",
      "title": "Unauthorized Entry — Restricted Server Room",
      "site": "HQ Corporate Tower",
      "siteId": "s-02",
      "reportedBy": "Marcus Bell",
      "severity": "critical",
      "status": "open",
      "date": "2026-08-10",
      "createdAt": "2026-08-10T08:22:00Z",
      "details": "An unidentified individual attempted to gain access to the server room on Floor 3 by tailgating an authorized employee. Guard intervened and detained the person. Corporate Security and IT team have been notified.",
      "gps": "37.77490, -122.41940 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [],
      "assignedTo": "u-7"
    },
    {
      "id": "i-inc-002",
      "title": "Vehicle Theft Attempt at Parking Lot B",
      "site": "Harbor Terminal 3",
      "siteId": "s-01",
      "reportedBy": "Elena Ruiz",
      "severity": "high",
      "status": "resolved",
      "date": "2026-08-09",
      "createdAt": "2026-08-09T14:05:00Z",
      "details": "CCTV footage captured two individuals attempting to break into a parked vehicle in Lot B at 14:05. Guards responded within 3 minutes. Suspects fled on foot. Police report filed (Case #SFP-2026-3812). Vehicle owner notified.",
      "gps": "37.77510, -122.41920 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [
        {
          "id": "cmt-001",
          "author": "Elena Ruiz",
          "text": "Police have collected CCTV footage for investigation.",
          "timestamp": "2026-08-09T15:30:00Z"
        }
      ],
      "assignedTo": ""
    },
    {
      "id": "i-inc-003",
      "title": "Medical Emergency — Guard Collapsed on Duty",
      "site": "Westfield Mall Perimeter",
      "siteId": "s-03",
      "reportedBy": "Sam Patel",
      "severity": "critical",
      "status": "resolved",
      "date": "2026-08-08",
      "createdAt": "2026-08-08T22:45:00Z",
      "details": "Guard officer Kevin Ray collapsed at checkpoint C during the night shift. Emergency services were called immediately. Officer was taken to SF General Hospital. Diagnosed with heat exhaustion. Relief guard deployed within 20 minutes. HR notified.",
      "gps": "37.77430, -122.41960 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [
        {
          "id": "cmt-002",
          "author": "Sam Patel",
          "text": "Kevin is stable and recovering. HR to follow up on medical leave.",
          "timestamp": "2026-08-09T09:00:00Z"
        }
      ],
      "assignedTo": ""
    },
    {
      "id": "i-inc-004",
      "title": "Suspicious Package Found at Main Gate",
      "site": "Harbor Terminal 3",
      "siteId": "s-01",
      "reportedBy": "Marcus Bell",
      "severity": "high",
      "status": "resolved",
      "date": "2026-08-07",
      "createdAt": "2026-08-07T10:10:00Z",
      "details": "An unattended package was found near the main entry gate. Area was cordoned off and bomb disposal unit contacted. Package was later confirmed to be harmless personal belongings left by a maintenance contractor.",
      "gps": "37.77480, -122.41935 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [],
      "assignedTo": ""
    },
    {
      "id": "i-inc-005",
      "title": "Trespassing — Construction Zone After Hours",
      "site": "Ranucle zundal",
      "siteId": "s-04",
      "reportedBy": "Elena Ruiz",
      "severity": "medium",
      "status": "open",
      "date": "2026-08-10",
      "createdAt": "2026-08-10T02:15:00Z",
      "details": "Three individuals were observed entering the restricted construction zone via a gap in the perimeter fence at approximately 02:15 AM. Guards on patrol intercepted and escorted them off premises. Site manager informed. Fence gap has been temporarily secured.",
      "gps": "37.77500, -122.41950 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [],
      "assignedTo": "u-7"
    },
    {
      "id": "i-inc-006",
      "title": "Fire Alarm Activation — Kitchen Block",
      "site": "HQ Corporate Tower",
      "siteId": "s-02",
      "reportedBy": "Ivy Nakamura",
      "severity": "high",
      "status": "resolved",
      "date": "2026-08-06",
      "createdAt": "2026-08-06T12:38:00Z",
      "details": "Fire alarm triggered at 12:38 in the 4th floor kitchen. Building evacuated per protocol. Fire department arrived and confirmed it was a false alarm caused by excessive steam from the coffee machine near a detector. All clear issued at 13:05. Detector recalibrated.",
      "gps": "37.77490, -122.41940 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [],
      "assignedTo": ""
    },
    {
      "id": "i-inc-007",
      "title": "Property Damage — CCTV Camera Vandalized",
      "site": "Westfield Mall Perimeter",
      "siteId": "s-03",
      "reportedBy": "Marcus Bell",
      "severity": "medium",
      "status": "open",
      "date": "2026-08-09",
      "createdAt": "2026-08-09T19:55:00Z",
      "details": "Camera unit #7 on the east perimeter was found smashed during the evening patrol. Adjacent camera footage reviewed — three unidentified individuals in dark clothing were seen approaching the camera at 19:40. Maintenance request filed. IT replacing unit tomorrow.",
      "gps": "37.77460, -122.41970 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [],
      "assignedTo": ""
    },
    {
      "id": "i-inc-008",
      "title": "Access Violation — Badge Sharing Detected",
      "site": "HQ Corporate Tower",
      "siteId": "s-02",
      "reportedBy": "Sam Patel",
      "severity": "medium",
      "status": "open",
      "date": "2026-08-05",
      "createdAt": "2026-08-05T09:20:00Z",
      "details": "Access control logs flagged that employee badge EMP-1042 was scanned simultaneously at Gate A and the 5th floor elevator at 09:18 AM. Badge holder interviewed — confirmed badge was shared with a contractor. Badge suspended pending review. HR and IT security notified.",
      "gps": "37.77490, -122.41940 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [],
      "assignedTo": ""
    },
    {
      "id": "i-inc-009",
      "title": "Shoplifting Incident — Electronics Section",
      "site": "Westfield Mall Perimeter",
      "siteId": "s-03",
      "reportedBy": "Ivy Nakamura",
      "severity": "low",
      "status": "resolved",
      "date": "2026-08-08",
      "createdAt": "2026-08-08T16:30:00Z",
      "details": "Loss prevention team detained a male individual attempting to conceal earbuds valued at $89 inside a jacket at 16:30. Police called. Individual was issued a trespass notice. Incident documented per retail partner contract requirements.",
      "gps": "37.77440, -122.41950 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [],
      "assignedTo": ""
    },
    {
      "id": "i-inc-010",
      "title": "Suspicious Activity — Unknown Drone Spotted",
      "site": "Harbor Terminal 3",
      "siteId": "s-01",
      "reportedBy": "Elena Ruiz",
      "severity": "high",
      "status": "open",
      "date": "2026-08-10",
      "createdAt": "2026-08-10T21:10:00Z",
      "details": "A small UAV/drone was observed flying low over the cargo storage area at approximately 21:10. Flight pattern was erratic and appeared to be surveilling active loading zones. Harbor authority and port security alerted. Drone disappeared after 4 minutes. Incident logged per port security protocol.",
      "gps": "37.77520, -122.41910 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [],
      "assignedTo": "u-7"
    },
    {
      "id": "i-inc-011",
      "title": "Physical Altercation Between Contractors",
      "site": "Ranucle zundal",
      "siteId": "s-04",
      "reportedBy": "Marcus Bell",
      "severity": "high",
      "status": "resolved",
      "date": "2026-08-04",
      "createdAt": "2026-08-04T11:45:00Z",
      "details": "Two contractors from different subcontracting firms engaged in a verbal argument that escalated to a physical confrontation near Building 2 at 11:45 AM. Security intervened and separated the individuals. Site manager and HR contacted. Both contractors removed from site pending investigation.",
      "gps": "37.77505, -122.41945 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [],
      "assignedTo": ""
    },
    {
      "id": "i-inc-012",
      "title": "Guard Equipment Lost — Patrol Radio Missing",
      "site": "Ranucle zundal",
      "siteId": "s-04",
      "reportedBy": "Sam Patel",
      "severity": "low",
      "status": "open",
      "date": "2026-08-03",
      "createdAt": "2026-08-03T07:00:00Z",
      "details": "Shift handover audit revealed patrol radio unit R-014 was not returned by outgoing guard at end of night shift. Guard contacted — radio was left at patrol checkpoint B. Equipment retrieved at 07:45 and returned to inventory. Asset management updated.",
      "gps": "37.77500, -122.41950 (Geo-tagged)",
      "companyId": "c-1",
      "attachments": [],
      "comments": [],
      "assignedTo": ""
    }
  ],
  "shifts": [
    {
      "id": "shift-101",
      "companyId": "c-1",
      "title": "Day Shift Guard - ranucle HQ",
      "site": "ranucle site (San Francisco HQ)",
      "guard": "David Chen",
      "guardId": "emp-101",
      "date": "2026-08-03",
      "startTime": "08:00",
      "endTime": "16:00",
      "status": "in_progress"
    },
    {
      "id": "shift-102",
      "companyId": "c-1",
      "title": "Night Maritime Patrol - Harbor Terminal",
      "site": "Harbor Terminal 44 (Port)",
      "guard": "Marcus Bell",
      "guardId": "emp-104",
      "date": "2026-08-03",
      "startTime": "22:00",
      "endTime": "06:00",
      "status": "confirmed"
    },
    {
      "id": "shift-103",
      "companyId": "c-1",
      "title": "Supervisor Audit Duty - ranucle HQ",
      "site": "ranucle site (San Francisco HQ)",
      "guard": "Elena Ruiz",
      "guardId": "emp-102",
      "date": "2026-08-03",
      "startTime": "09:00",
      "endTime": "17:00",
      "status": "in_progress"
    },
    {
      "id": "shift-104",
      "companyId": "c-1",
      "title": "Evening Retail Patrol - Riverside",
      "site": "Riverside Mall (Retail Complex)",
      "guard": "Michael Roberts",
      "guardId": "emp-105",
      "date": "2026-08-03",
      "startTime": "14:00",
      "endTime": "22:00",
      "status": "confirmed"
    },
    {
      "id": "shift-105",
      "companyId": "c-2",
      "title": "Port Main Gate Duty - Setubal",
      "site": "Setubal Terminal (Main Gate)",
      "guard": "Alex Mendes",
      "guardId": "emp-106",
      "date": "2026-08-03",
      "startTime": "07:00",
      "endTime": "15:00",
      "status": "completed"
    },
    {
      "id": "shift-106",
      "companyId": "c-3",
      "title": "Cargo Inspection Patrol - Oakland Harbor",
      "site": "Oakland Commercial Harbor",
      "guard": "Pedro Silva",
      "guardId": "emp-107",
      "date": "2026-08-03",
      "startTime": "08:00",
      "endTime": "16:00",
      "status": "in_progress"
    },
    {
      "id": "shift-107",
      "companyId": "c-2",
      "title": "Tech Hub Day Shift - Bhavik Site",
      "site": "Bhavik_Site (San Jose Hub)",
      "guard": "James Wilson",
      "guardId": "emp-108",
      "date": "2026-08-03",
      "startTime": "08:30",
      "endTime": "16:30",
      "status": "in_progress"
    }
  ],
  "sites": [
    {
      "id": "s-12lnsg7-1786085509818",
      "companyId": "c-1",
      "name": "Ranucle zundal",
      "code": "s-12lnsg7-1786085509818",
      "clientName": "Ranucle",
      "branch": "West Zone Branch",
      "facilityType": "Commercial Port / Terminal",
      "supervisorName": "Daniel Brooks",
      "guardsCount": 6,
      "riskLevel": "High",
      "contractEnd": "2027-12-31",
      "status": "active",
      "addressLine1": "S.P.Ring Road (Zundal), Ahmedabad, Gujarat 382424, India",
      "addressLine2": "Plot 42, Zundal Industrial Estate",
      "city": "Ahmedabad",
      "state": "Gujarat",
      "postalCode": "382424",
      "country": "India",
      "coordinates": {
        "latitude": 23.129695,
        "longitude": 72.58482,
        "radiusMeters": 150
      },
      "contact": {
        "primaryContactName": "Daniel Brooks",
        "contactEmail": "daniel.b@ranucle.com",
        "primaryPhone": "+91 98765 43210",
        "alternatePhone": "+91 98765 43211"
      },
      "operationalSettings": {
        "requireGpsEnabled": true,
        "enableLocationTracking": true,
        "enableShiftScheduling": true,
        "allowGuardMobileAccess": true
      },
      "internalNotes": "High priority commercial port & container terminal site. Strict geofence validation and PPE safety compliance required at all perimeter gates.",
      "geofence": {
        "boundaryType": "Circle",
        "latitude": 23.129695,
        "longitude": 72.58482,
        "radiusMeters": 150,
        "status": "ACTIVE GEOFENCE",
        "enableGeofenceValidation": true,
        "requireGeofenceClockIn": true,
        "requireGeofenceClockOut": true,
        "requireLocationPermission": true,
        "outsideBoundaryAction": "Allow But Flag Exception",
        "accuracyThresholdMeters": 50
      },
      "postOrders": [
        {
          "id": "po-1",
          "priority": "High",
          "title": "aaaa",
          "category": "Access Control",
          "version": "v1.0",
          "effectiveDate": "2026-08-11",
          "expiryDate": "Indefinite",
          "lastUpdated": "2026-08-11",
          "status": "Active"
        },
        {
          "id": "po-2",
          "priority": "Medium",
          "title": "Perimeter Access Control Protocol",
          "category": "Security Protocol",
          "version": "v2.4",
          "effectiveDate": "2026-08-01",
          "expiryDate": "2027-12-31",
          "lastUpdated": "2026-08-01",
          "status": "Active"
        }
      ],
      "checklists": [
        {
          "id": "cl-1",
          "priority": "High",
          "title": "Medical Emergency Checklist",
          "category": "Emergency Response",
          "description": "Standard response procedure for on-site medical emergencies",
          "steps": [
            "1. Call 911 immediately",
            "2. Render First Aid / CPR if certified",
            "3. Guide paramedic unit to gate",
            "4. Notify site supervisor"
          ],
          "itemsCount": 4,
          "frequency": "Emergency",
          "status": "Active"
        },
        {
          "id": "cl-2",
          "priority": "Medium",
          "title": "Morning Shift Opening Inspection",
          "category": "Safety & Operational",
          "description": "Daily verification of perimeter gates, barrier locks, and guard room logbooks.",
          "steps": [
            "1. Verify main entry gate locks",
            "2. Inspect CCTV monitor feeds",
            "3. Check radio battery charge levels",
            "4. Log shift handover report"
          ],
          "itemsCount": 12,
          "frequency": "Daily",
          "status": "Active"
        }
      ],
      "safetyConfig": {
        "shiftRules": {
          "minMinsBeforeShift": 15,
          "maxMinsAfterShift": 30,
          "minMinsBeforeEnd": 10,
          "maxMinsAfterEnd": 15
        },
        "officerShiftChecks": {
          "enabled": true,
          "intervalMins": 60,
          "graceMins": 10
        },
        "loneWorkerChecks": {
          "enabled": true,
          "intervalMins": 30,
          "graceMins": 5
        },
        "customRules": [
          {
            "id": "sr-1",
            "ruleName": "Mandatory Hardhat & Hi-Vis Safety Vest Area",
            "description": "Guards and visitors must wear certified PPE inside Zundal loading dock zones.",
            "status": "Enforced",
            "effectiveDate": "2026-01-01"
          }
        ]
      },
      "tourCheckpoints": [
        {
          "id": "cp-1",
          "name": "Main Entry Gate A",
          "code": "CP-RN-01",
          "location": "North Entrance",
          "status": "Active",
          "sequence": 1
        },
        {
          "id": "cp-2",
          "name": "Chemical Storage Bay",
          "code": "CP-RN-02",
          "location": "East Sector",
          "status": "Active",
          "sequence": 2
        },
        {
          "id": "cp-3",
          "name": "Loading Dock 4",
          "code": "CP-RN-03",
          "location": "South Dock",
          "status": "Active",
          "sequence": 3
        }
      ],
      "assignedUsers": [
        {
          "id": "u-user-1",
          "name": "Michael Carter",
          "username": "michael.carter",
          "email": "michael.carter@acme.io",
          "role": "Command Supervisor",
          "shiftTiming": "08:00 AM - 08:00 PM",
          "shiftPeriod": "2026-08-01 to 2026-12-31"
        },
        {
          "id": "u-user-2",
          "name": "richerl Rohde",
          "username": "richerl_rohde",
          "email": "richerl@acme.io",
          "role": "Security Guard",
          "shiftTiming": "06:00 - 13:00",
          "shiftPeriod": "August 13, 2026"
        },
        {
          "id": "u-user-3",
          "name": "abc xyz",
          "username": "abc_xyz",
          "email": "abc@acme.io",
          "role": "Security Guard",
          "shiftTiming": "08:00 AM - 04:00 PM",
          "shiftPeriod": "2026-08-01 to 2026-12-31"
        }
      ],
      "documents": [
        {
          "id": "doc-1",
          "title": "Ranucle Zundal Site Security Directive",
          "category": "Operations",
          "fileName": "Ranucle_Zundal_Security_Plan.pdf",
          "fileSize": "2.4 MB",
          "uploadedBy": "Daniel Brooks",
          "uploadDate": "2026-07-10"
        },
        {
          "id": "doc-2",
          "title": "Emergency Evacuation & Fire Map",
          "category": "Compliance",
          "fileName": "Zundal_Evac_Map_2026.pdf",
          "fileSize": "1.1 MB",
          "uploadedBy": "Daniel Brooks",
          "uploadDate": "2026-07-12"
        }
      ]
    },
    {
      "id": "s-01",
      "companyId": "c-1",
      "name": "Harbor Terminal 3",
      "code": "SIT-HT-001",
      "clientName": "Port Authority",
      "branch": "Maritime District",
      "facilityType": "Port & Container Terminal",
      "supervisorName": "Elena Ruiz",
      "guardsCount": 8,
      "riskLevel": "Medium",
      "contractEnd": "2027-06-30",
      "status": "active",
      "addressLine1": "Pier 44, Maritime Terminal Way",
      "addressLine2": "Gate 3 Cargo Docks",
      "city": "San Francisco",
      "state": "California",
      "postalCode": "94105",
      "country": "United States",
      "coordinates": {
        "latitude": 37.7751,
        "longitude": -122.4192,
        "radiusMeters": 150
      },
      "postOrders": [
        { "id": "po-101", "title": "Port Maritime Customs Escort Protocol", "version": "v3.1", "lastUpdated": "2026-07-20", "status": "Active" }
      ],
      "checklists": [
        { "id": "cl-101", "title": "Cargo Pier Night Patrol Checklist", "category": "Patrol & Safety", "itemsCount": 10, "frequency": "Nightly", "status": "Active" }
      ],
      "safetyRules": [
        { "id": "sr-101", "ruleName": "TWIC Card Verification Required", "description": "All personnel entering Pier 44 must display valid TWIC credentials.", "status": "Enforced", "effectiveDate": "2026-02-15" }
      ],
      "tourCheckpoints": [
        { "id": "cp-101", "name": "Pier 44 Gate House", "code": "CP-HT-01", "location": "Main Entrance", "status": "Active", "sequence": 1 },
        { "id": "cp-102", "name": "Container Bay B", "code": "CP-HT-02", "location": "Pier Storage", "status": "Active", "sequence": 2 }
      ],
      "assignedUsers": [
        { "id": "u-sup-2", "name": "Elena Ruiz", "role": "Supervisor", "email": "elena.r@priority-one.io" },
        { "id": "u-grd-3", "name": "Marcus Bell", "role": "Guard", "email": "marcus.b@priority-one.io" }
      ],
      "documents": [
        { "id": "doc-101", "title": "Port Terminal Maritime Security Manual", "category": "Regulatory", "fileName": "Port_Maritime_Security_Manual.pdf", "fileSize": "3.8 MB", "uploadedBy": "Elena Ruiz", "uploadDate": "2026-06-01" }
      ]
    },
    {
      "id": "s-02",
      "companyId": "c-1",
      "name": "HQ Corporate Tower",
      "code": "SIT-HQ-002",
      "clientName": "Priority One Corp",
      "branch": "Central HQ Branch",
      "facilityType": "Commercial High-rise",
      "supervisorName": "Jane Smith",
      "guardsCount": 5,
      "riskLevel": "Low",
      "contractEnd": "2028-01-15",
      "status": "active",
      "addressLine1": "100 Financial Plaza",
      "addressLine2": "Floors 1 - 15",
      "city": "San Francisco",
      "state": "California",
      "postalCode": "94111",
      "country": "United States",
      "coordinates": {
        "latitude": 37.7749,
        "longitude": -122.4194,
        "radiusMeters": 50
      },
      "postOrders": [
        { "id": "po-201", "title": "Lobby Visitor Badge Screening", "version": "v1.2", "lastUpdated": "2026-05-10", "status": "Active" }
      ],
      "checklists": [
        { "id": "cl-201", "title": "Executive Floor Evening Lockdown", "category": "Building Access", "itemsCount": 6, "frequency": "Daily", "status": "Active" }
      ],
      "safetyRules": [
        { "id": "sr-201", "ruleName": "Badge Tap Access Control", "description": "Tailgating strictly prohibited at all elevator turnstiles.", "status": "Enforced", "effectiveDate": "2026-01-10" }
      ],
      "tourCheckpoints": [
        { "id": "cp-201", "name": "Main Lobby Turnstiles", "code": "CP-HQ-01", "location": "Floor 1 Lobby", "status": "Active", "sequence": 1 }
      ],
      "assignedUsers": [
        { "id": "u-sup-3", "name": "Jane Smith", "role": "Supervisor", "email": "jane.s@priority-one.io" }
      ],
      "documents": [
        { "id": "doc-201", "title": "Corporate Tower Evacuation Plan", "category": "Safety", "fileName": "Tower_Evac_Plan_2026.pdf", "fileSize": "1.8 MB", "uploadedBy": "Jane Smith", "uploadDate": "2026-05-02" }
      ]
    }
  ],
  "users": [],
  "notifications": [
    {
      "id": "notif-1",
      "userId": "u-1",
      "title": "New Company Registered",
      "message": "Sentinel West Co. has signed up and is pending verification.",
      "read": false,
      "createdAt": "2026-07-14T08:15:00Z"
    },
    {
      "id": "notif-2",
      "userId": "u-1",
      "title": "Invoice Overdue",
      "message": "Invoice INV-2026-002 for Harbor Logistics Guard is overdue.",
      "read": false,
      "createdAt": "2026-07-13T10:00:00Z"
    }
  ]
};