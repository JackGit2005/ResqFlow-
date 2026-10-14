import { Incident, ResourceItem, Shelter, Hospital, SimulationScenario, AppSettings, UserSession, UserRole } from '../types';

export const BALLARI_CENTER = {
  lat: 15.1394,
  lng: 76.9214,
  name: 'Ballari City Center, Karnataka',
};

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-2026-081',
    title: 'Tungabhadra Canal Overflow & Residential Inundation',
    description: 'Sudden flash surge from Tungabhadra right high-level canal has flooded 45+ homes in low-lying Millerpet. Water levels 3.5 ft and rising. 12 elderly residents stranded on rooftops.',
    incidentType: 'Flood / Waterlogging',
    locationName: 'Millerpet Canal Road, Ward 18',
    area: 'Millerpet',
    latitude: 15.1482,
    longitude: 76.9288,
    severity: 'Critical',
    status: 'In Progress',
    reportedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    reporterName: 'Suresh Gowda (Ward Councilor)',
    reporterContact: '+91 98450 12345',
    isPublicReport: false,
    assignedResourceIds: ['RES-002', 'RES-007', 'RES-008'],
    photos: [
      'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'
    ],
    timeline: [
      { timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(), action: 'Incident reported via Emergency Control Room 112', user: 'DDMA Dispatcher 04' },
      { timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), action: 'Severity escalated to Critical due to rising flood waters', user: 'Duty Magistrate Ballari' },
      { timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(), action: 'Dispatched SDRF Water Rescue Team and 2 Inflatable Boats', user: 'Coord. Ramesh' },
      { timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), action: 'First 8 residents rescued, relocated to Town Hall shelter', user: 'SDRF Lead Captain' }
    ]
  },
  {
    id: 'INC-2026-082',
    title: 'Multi-Vehicle Collision with Fuel Spillage on Siruguppa Highway',
    description: 'Collision involving heavy iron-ore transport truck, private passenger bus, and an auto-rickshaw on NH-150A. Multiple trapped casualties with active diesel fuel leakage on highway.',
    incidentType: 'Road Accident',
    locationName: 'Siruguppa Road Junction, Near Allipur Cross',
    area: 'Siruguppa Highway',
    latitude: 15.1725,
    longitude: 76.9421,
    severity: 'Critical',
    status: 'Assigned',
    reportedAt: new Date(Date.now() - 19 * 60 * 1000).toISOString(),
    reporterName: 'Highway Patrol Unit 4',
    reporterContact: '+91 94481 67890',
    isPublicReport: false,
    assignedResourceIds: ['RES-001', 'RES-003'],
    photos: [
      'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=800&q=80'
    ],
    timeline: [
      { timestamp: new Date(Date.now() - 19 * 60 * 1000).toISOString(), action: 'Highway patrol reported severe collision with trapped passengers', user: 'Police Control' },
      { timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), action: 'Assigned 2 ALS Ambulances and Fire Rescue Extrication Squad', user: 'Dispatcher Ananya' }
    ]
  },
  {
    id: 'INC-2026-083',
    title: 'LPG Commercial Cylinder Blast & Fire in APMC Yard',
    description: 'Major fire broke out in spice warehouse complex following double LPG cylinder explosion. Smoke spreading toward neighboring grain storage godowns. 4 workers with burn injuries.',
    incidentType: 'Fire Emergency',
    locationName: 'Gate 2, APMC Market Yard, Anantapur Road',
    area: 'APMC Yard',
    latitude: 15.1278,
    longitude: 76.9385,
    severity: 'High',
    status: 'In Progress',
    reportedAt: new Date(Date.now() - 54 * 60 * 1000).toISOString(),
    reporterName: 'APMC Market Security',
    reporterContact: '+91 98860 33412',
    isPublicReport: false,
    assignedResourceIds: ['RES-003', 'RES-005'],
    photos: [
      'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80'
    ],
    timeline: [
      { timestamp: new Date(Date.now() - 54 * 60 * 1000).toISOString(), action: 'Commercial fire reported at APMC storage block', user: 'System 112 Ingest' },
      { timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), action: 'Fire tender from Brucepet Station arrived on scene', user: 'Fire Cmd. Patil' },
      { timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), action: 'Burn trauma kits delivered to triage point at Gate 2', user: 'Medic Dr. Rao' }
    ]
  },
  {
    id: 'INC-2026-084',
    title: 'Old Masonry Wall Collapse near Cowl Bazaar Railway Underpass',
    description: 'Historic railway-adjacent perimeter wall collapsed onto two roadside vending kiosks following heavy rain. Pedestrians reported two people possibly trapped under debris.',
    incidentType: 'Structural Collapse',
    locationName: 'Railway Underpass, Cowl Bazaar Main Rd',
    area: 'Cowl Bazaar',
    latitude: 15.1322,
    longitude: 76.9095,
    severity: 'High',
    status: 'Open',
    reportedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    reporterName: 'Mohammed Ismail (Resident)',
    reporterContact: '+91 99002 54321',
    isPublicReport: true,
    assignedResourceIds: [],
    photos: [
      'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80'
    ],
    timeline: [
      { timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(), action: 'Citizen public report submitted via portal, verified by DDMA', user: 'Public Ingest' }
    ]
  },
  {
    id: 'INC-2026-085',
    title: 'Industrial Chlorine Gas Leak Sensor Alarm at Toranagallu Corridor',
    description: 'Automated perimeter gas sensor detected elevated chlorine trace (0.8 ppm) near water treatment storage tank. Preventive perimeter evacuation initiated for 200m radius.',
    incidentType: 'Chemical / Industrial Hazard',
    locationName: 'Industrial Ancillary Park, Toranagallu Outer Belt',
    area: 'Toranagallu',
    latitude: 15.1889,
    longitude: 76.8122,
    severity: 'Medium',
    status: 'Assigned',
    reportedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    reporterName: 'Plant Safety Officer K. Reddy',
    reporterContact: '+91 94480 88990',
    isPublicReport: false,
    assignedResourceIds: ['RES-004'],
    timeline: [
      { timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(), action: 'Alarm detected by telemetry sensor #T-09', user: 'Industrial Monitor' },
      { timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), action: 'HAZMAT inspection squad deployed to verify containment valves', user: 'Safety Officer' }
    ]
  },
  {
    id: 'INC-2026-086',
    title: 'Drinking Water Contamination & Acute Gastroenteritis Outbreak',
    description: 'Multiple families reporting acute dehydration and vomiting symptoms following broken municipal pipe mixing with storm drainage in Ward 11.',
    incidentType: 'Medical Emergency',
    locationName: 'Gandhi Nagar 4th Cross, Near Community Borewell',
    area: 'Gandhi Nagar',
    latitude: 15.1438,
    longitude: 76.9189,
    severity: 'Medium',
    status: 'Open',
    reportedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    reporterName: 'Dr. Savitha (Primary Health Center)',
    reporterContact: '+91 98441 55667',
    isPublicReport: false,
    assignedResourceIds: [],
    timeline: [
      { timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(), action: 'PHC Medical Officer escalated cluster of 18 cases', user: 'Health Dept Ballari' }
    ]
  },
  {
    id: 'INC-2026-087',
    title: '33kV Feeder Tripping Causing Hospital Substation Blackout',
    description: 'Overhead high-tension line snapped due to storm gust near Guggarahatti. Substation tripped, affecting oxygen supply backup circuits in peripheral clinic.',
    incidentType: 'Power Grid Failure',
    locationName: 'Guggarahatti Power Grid Substation',
    area: 'Guggarahatti',
    latitude: 15.1185,
    longitude: 76.9152,
    severity: 'Low',
    status: 'Resolved',
    reportedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    reporterName: 'GESCOM Line Supervisor',
    reporterContact: '+91 94498 77112',
    isPublicReport: false,
    assignedResourceIds: ['RES-008'],
    timeline: [
      { timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(), action: 'GESCOM feeder line damaged by fallen eucalyptus branch', user: 'GESCOM Control' },
      { timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(), action: 'Mobile 125kVA diesel generator dispatched', user: 'DDMA Resource Desk' },
      { timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), action: 'Main grid power restored and validated stable', user: 'GESCOM Engineer' }
    ]
  }
];

export const INITIAL_RESOURCES: ResourceItem[] = [
  {
    id: 'RES-001',
    name: '108 Advanced Life Support (ALS) Ambulance Unit 01',
    category: 'Ambulance',
    typeDetails: 'ICU-equipped with ventilator, defibrillator, multipara monitor & EMT crew',
    totalQuantity: 4,
    availableQuantity: 2,
    unit: 'Vehicles',
    baseLocation: 'VIMS Trauma Center Base, Cantonment',
    latitude: 15.1412,
    longitude: 76.9064,
    status: 'Ready',
    contactPerson: 'Supervisor Mallikarjun (108 EMRI)',
    contactPhone: '+91 94480 10801',
    assignedIncidentIds: ['INC-2026-082'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'RES-002',
    name: 'SDRF 3rd Battalion Water Rescue & Evacuation Platoon',
    category: 'Rescue Team',
    typeDetails: 'Specialized swift-water swimmers, motorized zodiacs, sonar & life jackets',
    totalQuantity: 3,
    availableQuantity: 1,
    unit: 'Platoons (12 pers each)',
    baseLocation: 'Home Guards Ground, Ballari Fort Road',
    latitude: 15.1455,
    longitude: 76.9242,
    status: 'Deployed',
    contactPerson: 'Dy. Commandant Raghavendra',
    contactPhone: '+91 94808 03003',
    assignedIncidentIds: ['INC-2026-081'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'RES-003',
    name: 'Karnataka Fire & Emergency Quick Response Tender & Cutters',
    category: 'Rescue Team',
    typeDetails: 'Water mist tender, heavy hydraulic extrication cutters & spreader tools',
    totalQuantity: 3,
    availableQuantity: 1,
    unit: 'Tenders',
    baseLocation: 'Brucepet Fire Station, Ballari',
    latitude: 15.1381,
    longitude: 76.9255,
    status: 'Ready',
    contactPerson: 'Station Fire Officer Basavaraj',
    contactPhone: '+91 94482 10101',
    assignedIncidentIds: ['INC-2026-082', 'INC-2026-083'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'RES-004',
    name: 'Red Cross & Civil Defense Volunteer Emergency Corps',
    category: 'Volunteer Group',
    typeDetails: 'Trained in first aid, crowd triage, shelter management and ration sorting',
    totalQuantity: 60,
    availableQuantity: 42,
    unit: 'Personnel',
    baseLocation: 'District Youth Hostel, Gandhi Nagar',
    latitude: 15.1449,
    longitude: 76.9178,
    status: 'Ready',
    contactPerson: 'Coordinator Priya Deshmukh',
    contactPhone: '+91 98455 67231',
    assignedIncidentIds: ['INC-2026-085'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'RES-005',
    name: 'Emergency Trauma & Burn Surgical Medical Packs',
    category: 'Medical Supplies',
    typeDetails: 'Burn sterile dressings, saline IV fluids, tetanus toxoid, blood coagulants',
    totalQuantity: 200,
    availableQuantity: 145,
    unit: 'Kits',
    baseLocation: 'District Central Drug Store, Anantapur Road',
    latitude: 15.1311,
    longitude: 76.9324,
    status: 'Ready',
    contactPerson: 'Pharmacist Shivanand',
    contactPhone: '+91 99001 22334',
    assignedIncidentIds: ['INC-2026-083'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'RES-006',
    name: 'Ready-to-Eat Emergency Relief Food & Nutrition Kits',
    category: 'Food & Ration',
    typeDetails: 'Packaged dry rations, energetic biscuits, baby formula, water purification tabs (3-day ration)',
    totalQuantity: 1500,
    availableQuantity: 1220,
    unit: 'Meal Kits',
    baseLocation: 'Civil Supplies Godown, Millerpet',
    latitude: 15.1502,
    longitude: 76.9315,
    status: 'Ready',
    contactPerson: 'Officer Vijay Kumar',
    contactPhone: '+91 98862 44556',
    assignedIncidentIds: [],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'RES-007',
    name: 'KUWS&DB Potable Water Tanker Fleet (12,000L)',
    category: 'Potable Water',
    typeDetails: 'Food-grade stainless steel tankers with pressurized dispensing manifold',
    totalQuantity: 8,
    availableQuantity: 5,
    unit: 'Tankers',
    baseLocation: 'Water Works Pumping Station, Cowl Bazaar',
    latitude: 15.1305,
    longitude: 76.9023,
    status: 'Ready',
    contactPerson: 'Executive Eng. Prakash',
    contactPhone: '+91 94481 99001',
    assignedIncidentIds: ['INC-2026-081'],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'RES-008',
    name: 'Heavy Flood De-watering Diesel Pumps & Inflatable Zodiacs',
    category: 'Rescue Equipment',
    typeDetails: 'High-head 150 HP trash pumps (5000 LPM capacity) & 6-person motorized boats',
    totalQuantity: 10,
    availableQuantity: 6,
    unit: 'Sets',
    baseLocation: 'Irrigation Dept Depot, Station Road',
    latitude: 15.1432,
    longitude: 76.9348,
    status: 'Ready',
    contactPerson: 'Asst. Eng. Manjunath',
    contactPhone: '+91 94801 33221',
    assignedIncidentIds: ['INC-2026-081', 'INC-2026-087'],
    lastUpdated: new Date().toISOString(),
  }
];

export const INITIAL_SHELTERS: Shelter[] = [
  {
    id: 'SHL-01',
    name: 'District Indoor Stadium Sports Complex',
    address: 'Near Infant Jesus Church, Gandhi Nagar, Ballari',
    area: 'Gandhi Nagar',
    latitude: 15.1462,
    longitude: 76.9168,
    totalCapacity: 600,
    currentOccupancy: 280,
    facilities: {
      bedding: true,
      foodKitchen: true,
      medicalPost: true,
      cleanWater: true,
      powerBackup: true,
      childFriendly: true
    },
    contactPerson: 'Sri Anand (District Youth Services Officer)',
    contactPhone: '+91 94481 44550',
    status: 'Active'
  },
  {
    id: 'SHL-02',
    name: 'Town Hall Community Relief Center',
    address: 'Fort Road, Brucepet, Ballari',
    area: 'Brucepet',
    latitude: 15.1398,
    longitude: 76.9231,
    totalCapacity: 350,
    currentOccupancy: 310,
    facilities: {
      bedding: true,
      foodKitchen: true,
      medicalPost: true,
      cleanWater: true,
      powerBackup: true,
      childFriendly: false
    },
    contactPerson: 'Smt. Geetha (Municipal Revenue Inspector)',
    contactPhone: '+91 98802 11223',
    status: 'Near Capacity'
  },
  {
    id: 'SHL-03',
    name: 'Government Polytechnic Hostel Campus',
    address: 'Contonment Main Road, Cowl Bazaar, Ballari',
    area: 'Cowl Bazaar',
    latitude: 15.1338,
    longitude: 76.9056,
    totalCapacity: 450,
    currentOccupancy: 120,
    facilities: {
      bedding: true,
      foodKitchen: true,
      medicalPost: false,
      cleanWater: true,
      powerBackup: true,
      childFriendly: true
    },
    contactPerson: 'Prof. Somasekhar (Warden)',
    contactPhone: '+91 94490 88776',
    status: 'Active'
  },
  {
    id: 'SHL-04',
    name: 'APMC Farmers Rest Shed & Logistics Camp',
    address: 'APMC Yard Yard Gate 4, Anantapur Road, Ballari',
    area: 'APMC Yard',
    latitude: 15.1265,
    longitude: 76.9412,
    totalCapacity: 300,
    currentOccupancy: 45,
    facilities: {
      bedding: false,
      foodKitchen: true,
      medicalPost: false,
      cleanWater: true,
      powerBackup: false,
      childFriendly: false
    },
    contactPerson: 'Sri Venkatesh (APMC Secretary)',
    contactPhone: '+91 98451 90812',
    status: 'Active'
  },
  {
    id: 'SHL-05',
    name: 'Kolagal Gram Panchayat Cyclone & Flood Shelter',
    address: 'Kolagal Road Outskirts, South Ballari',
    area: 'Kolagal',
    latitude: 15.1092,
    longitude: 76.9205,
    totalCapacity: 250,
    currentOccupancy: 0,
    facilities: {
      bedding: true,
      foodKitchen: true,
      medicalPost: true,
      cleanWater: true,
      powerBackup: true,
      childFriendly: true
    },
    contactPerson: 'Sri Chandrappa (PDO Kolagal)',
    contactPhone: '+91 99011 34567',
    status: 'Active'
  }
];

export const BALLARI_HOSPITALS: Hospital[] = [
  {
    id: 'HOSP-01',
    name: 'Vijayanagar Institute of Medical Sciences (VIMS) Hospital',
    address: 'Cantonment, Ballari - 583104',
    latitude: 15.1408,
    longitude: 76.9069,
    emergencyBeds: 180,
    availableBeds: 42,
    icuAvailable: 11,
    hasTraumaCenter: true,
    contactPhone: '+91 83922 35201'
  },
  {
    id: 'HOSP-02',
    name: 'District Civil Hospital Ballari',
    address: 'Anantapur Road, Beside Collectorate, Ballari',
    latitude: 15.1328,
    longitude: 76.9318,
    emergencyBeds: 120,
    availableBeds: 28,
    icuAvailable: 6,
    hasTraumaCenter: true,
    contactPhone: '+91 83922 72100'
  },
  {
    id: 'HOSP-03',
    name: 'St. Mary’s Multi-Specialty Hospital',
    address: 'Station Road, Cowl Bazaar, Ballari',
    latitude: 15.1362,
    longitude: 76.9142,
    emergencyBeds: 50,
    availableBeds: 15,
    icuAvailable: 4,
    hasTraumaCenter: false,
    contactPhone: '+91 83922 41920'
  },
  {
    id: 'HOSP-04',
    name: 'Jindal Sanjeevani Multi-Specialty Hospital',
    address: 'Vidyanagar, Toranagallu, Ballari District',
    latitude: 15.1915,
    longitude: 76.8155,
    emergencyBeds: 100,
    availableBeds: 34,
    icuAvailable: 9,
    hasTraumaCenter: true,
    contactPhone: '+91 83952 50123'
  }
];

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'SIM-01',
    name: 'Monsoon Tungabhadra Flash Flood (Category IV Inundation)',
    description: 'Intense 24-hr cloudburst (185mm) upstream causing sudden 150,000 cusecs discharge into Tungabhadra river and low-lying canals. Millerpet, Kolagal, and Siruguppa road margins inundated with up to 5 ft water.',
    affectedArea: 'Millerpet & Tungabhadra Canal Belt',
    simulatedSeverity: 'Critical',
    estimatedCasualties: 120,
    requiredAmbulances: 6,
    requiredRescueTeams: 5,
    requiredWaterTrucks: 8,
    requiredFoodKits: 1400,
    requiredShelterBeds: 850
  },
  {
    id: 'SIM-02',
    name: 'Major Industrial Chemical Vapor Dispersion at Toranagallu',
    description: 'Rupture in pressurized liquid ammonia transfer pipe at industrial logistics terminal. Plume model predicts 1.5 km dispersion downwind towards residential satellite colonies.',
    affectedArea: 'Toranagallu Industrial Corridor',
    simulatedSeverity: 'Critical',
    estimatedCasualties: 85,
    requiredAmbulances: 8,
    requiredRescueTeams: 4,
    requiredWaterTrucks: 4,
    requiredFoodKits: 400,
    requiredShelterBeds: 450
  },
  {
    id: 'SIM-03',
    name: 'High-Density Market Fire in Cowl Bazaar Narrow Lanes',
    description: 'Electrical transformer spark spreading across textile and fireworks shops in congested Cowl Bazaar bazaar alleys with restricted vehicle access.',
    affectedArea: 'Cowl Bazaar Commercial Core',
    simulatedSeverity: 'High',
    estimatedCasualties: 45,
    requiredAmbulances: 5,
    requiredRescueTeams: 3,
    requiredWaterTrucks: 6,
    requiredFoodKits: 300,
    requiredShelterBeds: 250
  }
];

export const DEFAULT_APP_SETTINGS: AppSettings = {
  mapCenterLat: 15.1394,
  mapCenterLng: 76.9214,
  defaultZoom: 13,
  reserveThresholdPercent: 15,
  allocationStrategy: 'Balanced',
  enableAudioAlerts: false,
  autoRefreshIntervalSeconds: 30,
  useSupabaseBackend: false,
  enableNoupeEmbed: false,
  noupeBotId: 'noupe-resqflow-ballari',
  noupeScriptUrl: 'https://cdn.noupe.com/widget.js'
};

export const INITIAL_CIVILIAN_REQUESTS = [
  {
    id: 'REQ-2026-001',
    civilianId: 'civ-demo-01',
    civilianName: 'Ananya Sharma',
    contactPhone: '+91 98450 77123',
    category: 'Potable Water' as const,
    urgency: 'High' as const,
    description: 'Tungabhadra canal backwater contaminated ground sump. 4 family members including an infant with no potable drinking water.',
    locationName: 'Millerpet Canal Road, House #42',
    area: 'Millerpet',
    peopleCount: 4,
    specialNeeds: 'Infant requiring clean boiled water for formula',
    status: 'In Progress' as const,
    coordinatorNotes: 'Dispatched 10,000L KUWS&DB Water Tanker Fleet (RES-007). Assigned Responder Basavaraj.',
    assignedResourceId: 'RES-007',
    assignedResponderName: 'SDRF Unit Lead Mallikarjun',
    submittedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    timeline: [
      { timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), action: 'Assistance request filed by citizen via Civilian Portal', actor: 'Ananya Sharma' },
      { timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), action: 'Reviewed and Approved by District Coordinator', actor: 'Coordinator Patil' },
      { timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), action: 'Tanker dispatched from Cowl Bazaar pumping base', actor: 'Responder Basavaraj' }
    ]
  },
  {
    id: 'REQ-2026-002',
    civilianId: 'civ-demo-01',
    civilianName: 'Ananya Sharma',
    contactPhone: '+91 98450 77123',
    category: 'Medical Assistance' as const,
    urgency: 'Critical' as const,
    description: 'Elderly diabetic grandmother experiencing hypoglycemia symptoms; local pharmacy inundated.',
    locationName: 'Opposite Government Primary School, Millerpet',
    area: 'Millerpet',
    peopleCount: 1,
    specialNeeds: 'Insulin and glucose drip required',
    status: 'Approved' as const,
    coordinatorNotes: 'Priority ALS ambulance dispatch requisitioned from VIMS Base.',
    assignedResourceId: 'RES-001',
    assignedResponderName: 'EMT Officer Kumar (108)',
    submittedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    timeline: [
      { timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), action: 'Critical medical request submitted', actor: 'Ananya Sharma' },
      { timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), action: 'Approved by Emergency Medical Officer; 108 Ambulance en route', actor: 'Coordinator Patil' }
    ]
  },
  {
    id: 'REQ-2026-003',
    civilianId: 'civ-demo-02',
    civilianName: 'Mohammed Farooq',
    contactPhone: '+91 99002 44112',
    category: 'Rescue Evacuation' as const,
    urgency: 'High' as const,
    description: 'Rain runoff entering ground floor shop and living quarters. 6 people need transport to dry high ground.',
    locationName: 'Near Cowl Bazaar Railway Gate',
    area: 'Cowl Bazaar',
    peopleCount: 6,
    status: 'Pending Review' as const,
    submittedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    timeline: [
      { timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), action: 'Evacuation request registered in queue (Pending Coordinator Verification)', actor: 'Mohammed Farooq' }
    ]
  },
  {
    id: 'REQ-2026-004',
    civilianId: 'civ-demo-03',
    civilianName: 'Lakshmi Bai',
    contactPhone: '+91 94481 99220',
    category: 'Emergency Shelter' as const,
    urgency: 'Medium' as const,
    description: 'Temporary tin roof blown off by storm gusts. Seeking shelter for family of 5.',
    locationName: 'APMC Market Road, Shed 12',
    area: 'APMC Yard',
    peopleCount: 5,
    status: 'Completed' as const,
    coordinatorNotes: 'Safely accommodated at Town Hall Community Relief Center (SHL-02).',
    assignedResourceId: 'SHL-02',
    assignedResponderName: 'Shelter Warden Geetha',
    submittedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    timeline: [
      { timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), action: 'Shelter request submitted', actor: 'Lakshmi Bai' },
      { timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(), action: 'Approved and assigned to Town Hall Shelter', actor: 'Coordinator Patil' },
      { timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), action: 'Intake confirmed; shelter beds allotted and request closed', actor: 'Warden Geetha' }
    ]
  }
];

export const DEFAULT_USER_SESSION: UserSession = {
  role: 'Civilian',
  name: 'Ananya Sharma',
  badgeNumber: 'CIV-BLR-892',
  department: 'Ballari Resident Citizen',
  civilianId: 'civ-demo-01',
  phone: '+91 98450 77123',
  isDemoUser: true
};

export const ROLE_PRESETS: Record<UserRole, UserSession> = {
  Civilian: {
    role: 'Civilian',
    name: 'Ananya Sharma',
    badgeNumber: 'CIV-BLR-892',
    department: 'Ballari Resident Citizen',
    civilianId: 'civ-demo-01',
    phone: '+91 98450 77123',
    isDemoUser: true
  },
  Responder: {
    role: 'Responder',
    name: 'Captain Mallikarjun (SDRF)',
    badgeNumber: 'SDRF-BLR-12',
    department: 'SDRF 3rd Battalion Rescue Platoon',
    isDemoUser: true
  },
  Coordinator: {
    role: 'Coordinator',
    name: 'Officer Rajeshwari Patil',
    badgeNumber: 'DDMA-BLR-402',
    department: 'Ballari District Disaster Management Authority (DDMA)',
    isDemoUser: true
  },
  Administrator: {
    role: 'Administrator',
    name: 'Dr. K. Srinivas (IAS)',
    badgeNumber: 'ADMIN-DC-01',
    department: 'Ballari District Administration & Collectorate',
    isDemoUser: true
  }
};

