export type IncidentSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type IncidentStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved';

export type IncidentType =
  | 'Flood / Waterlogging'
  | 'Structural Collapse'
  | 'Fire Emergency'
  | 'Road Accident'
  | 'Chemical / Industrial Hazard'
  | 'Medical Emergency'
  | 'Power Grid Failure';

export interface Incident {
  id: string;
  title: string;
  description: string;
  incidentType: IncidentType;
  locationName: string;
  area: string;
  latitude: number;
  longitude: number;
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedAt: string; // ISO string
  reporterName?: string;
  reporterContact?: string;
  isPublicReport?: boolean;
  assignedResourceIds: string[];
  resolvedAt?: string;
  notes?: string;
  photos?: string[];
  imageUrl?: string;
  timeline: {
    timestamp: string;
    action: string;
    user: string;
  }[];
}

export type ResourceCategory =
  | 'Ambulance'
  | 'Rescue Team'
  | 'Volunteer Group'
  | 'Medical Supplies'
  | 'Food & Ration'
  | 'Potable Water'
  | 'Rescue Equipment';

export interface ResourceItem {
  id: string;
  name: string;
  category: ResourceCategory;
  typeDetails: string;
  totalQuantity: number;
  availableQuantity: number;
  unit: string;
  baseLocation: string;
  latitude: number;
  longitude: number;
  status: 'Ready' | 'Deployed' | 'Maintenance' | 'Exhausted';
  contactPerson: string;
  contactPhone: string;
  assignedIncidentIds: string[];
  lastUpdated: string;
}

export interface ShelterFacility {
  bedding: boolean;
  foodKitchen: boolean;
  medicalPost: boolean;
  cleanWater: boolean;
  powerBackup: boolean;
  childFriendly: boolean;
}

export interface Shelter {
  id: string;
  name: string;
  address: string;
  area: string;
  latitude: number;
  longitude: number;
  totalCapacity: number;
  currentOccupancy: number;
  facilities: ShelterFacility;
  contactPerson: string;
  contactPhone: string;
  status: 'Active' | 'Near Capacity' | 'Full' | 'Inactive';
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  emergencyBeds: number;
  availableBeds: number;
  icuAvailable: number;
  hasTraumaCenter: boolean;
  contactPhone: string;
}

export interface AllocationRecommendation {
  resourceId: string;
  resourceName: string;
  category: ResourceCategory;
  distanceKm: number;
  recommendedQuantity: number;
  matchScore: number; // 0-100
  rationale: string;
  priorityLevel: 'Immediate' | 'Secondary' | 'Support';
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  affectedArea: string;
  simulatedSeverity: IncidentSeverity;
  estimatedCasualties: number;
  requiredAmbulances: number;
  requiredRescueTeams: number;
  requiredWaterTrucks: number;
  requiredFoodKits: number;
  requiredShelterBeds: number;
}

// 4 distinct roles per RBAC specification
export type UserRole = 'Civilian' | 'Responder' | 'Coordinator' | 'Administrator';

export interface UserSession {
  role: UserRole;
  name: string;
  badgeNumber: string;
  department: string;
  civilianId?: string;
  phone?: string;
  isDemoUser: boolean;
}

export interface AppSettings {
  mapCenterLat: number;
  mapCenterLng: number;
  defaultZoom: number;
  reserveThresholdPercent: number;
  allocationStrategy: 'Fastest Response' | 'Maximum Capacity' | 'Balanced';
  enableAudioAlerts: boolean;
  autoRefreshIntervalSeconds: number;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  useSupabaseBackend: boolean;
  noupeBotId?: string;
  noupeScriptUrl?: string;
  enableNoupeEmbed?: boolean;
}

// Civilian Assistance Request Workflow
export type RequestCategory =
  | 'Medical Assistance'
  | 'Emergency Food & Ration'
  | 'Potable Water'
  | 'Rescue Evacuation'
  | 'Emergency Shelter'
  | 'General Supplies';

export type RequestStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Rejected';

export interface CivilianRequest {
  id: string;
  civilianId: string;
  civilianName: string;
  contactPhone: string;
  category: RequestCategory;
  urgency: IncidentSeverity;
  description: string;
  locationName: string;
  area: string;
  peopleCount: number;
  specialNeeds?: string;
  attachmentUrl?: string;
  status: RequestStatus;
  coordinatorNotes?: string;
  assignedResourceId?: string;
  assignedResponderName?: string;
  submittedAt: string;
  updatedAt: string;
  timeline: {
    timestamp: string;
    action: string;
    actor: string;
  }[];
}

// Live Weather & Disaster Risk Monitoring in Ballari
export interface BallariWeather {
  temperature: number; // Celsius
  condition: string;
  humidity: number; // %
  windSpeed: number; // km/h
  windDirection: string;
  rainfallMm: number; // mm
  precipitationProb: number; // %
  uvIndex: number;
  heatIndex: number;
  disasterRiskLevel: 'Normal' | 'Elevated' | 'High Risk' | 'Extreme Alert';
  floodRisk: 'Low' | 'Moderate' | 'Severe';
  heatRisk: 'Low' | 'Moderate' | 'High';
  stormRisk: 'Low' | 'Moderate' | 'Severe';
  riskSummary: string;
  forecast: {
    time: string;
    temp: number;
    rainProb: number;
    condition: string;
  }[];
  lastUpdated: string;
}
