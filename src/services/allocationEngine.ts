import { Incident, ResourceItem, AllocationRecommendation } from '../types';

/**
 * Calculates great-circle distance between two points in kilometers using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Calculates domain suitability match score (0 to 100) between incident type and resource
 */
function getDomainSuitabilityScore(
  incidentType: Incident['incidentType'],
  resource: ResourceItem
): { score: number; reason: string } {
  switch (incidentType) {
    case 'Flood / Waterlogging':
      if (resource.category === 'Rescue Equipment' || resource.name.toLowerCase().includes('boat') || resource.name.toLowerCase().includes('pump')) {
        return { score: 98, reason: 'Specialized water extraction / inflatable boat equipment essential for flood rescue' };
      }
      if (resource.category === 'Rescue Team' && resource.name.toLowerCase().includes('water')) {
        return { score: 95, reason: 'Trained swift-water rescue platoon with motorized zodiacs' };
      }
      if (resource.category === 'Potable Water') {
        return { score: 85, reason: 'Displaced flood victims require clean emergency potable water' };
      }
      if (resource.category === 'Food & Ration') {
        return { score: 80, reason: 'Relief ration packs for stranded or evacuated citizens' };
      }
      if (resource.category === 'Ambulance') {
        return { score: 75, reason: 'Medical triage for hypothermia and waterborne trauma' };
      }
      return { score: 40, reason: 'General auxiliary support' };

    case 'Fire Emergency':
      if (resource.category === 'Rescue Team' && resource.name.toLowerCase().includes('fire')) {
        return { score: 98, reason: 'Primary fire tender & high-pressure suppression gear' };
      }
      if (resource.category === 'Medical Supplies' && resource.name.toLowerCase().includes('burn')) {
        return { score: 92, reason: 'Sterile burn trauma dressings and fluid resuscitation' };
      }
      if (resource.category === 'Ambulance') {
        return { score: 88, reason: 'Immediate patient evacuation for smoke inhalation & burn injuries' };
      }
      if (resource.category === 'Potable Water') {
        return { score: 70, reason: 'Secondary water supply replenish for perimeter safety' };
      }
      return { score: 35, reason: 'Secondary perimeter assistance' };

    case 'Road Accident':
      if (resource.category === 'Ambulance') {
        return { score: 99, reason: 'ALS ICU ambulance critical for golden-hour trauma transport' };
      }
      if (resource.category === 'Rescue Team' && resource.name.toLowerCase().includes('cutters')) {
        return { score: 90, reason: 'Hydraulic heavy jaws & spreaders needed for vehicular extrication' };
      }
      if (resource.category === 'Medical Supplies') {
        return { score: 85, reason: 'Direct hemorrhage control & splints' };
      }
      return { score: 30, reason: 'Traffic & auxiliary crowd control' };

    case 'Structural Collapse':
      if (resource.category === 'Rescue Team') {
        return { score: 96, reason: 'Heavy rescue squad with search tools & debris extrication' };
      }
      if (resource.category === 'Ambulance') {
        return { score: 92, reason: 'Crush injury stabilization & rapid hospital transfer' };
      }
      if (resource.category === 'Volunteer Group') {
        return { score: 78, reason: 'Cordon maintenance & survivor registry management' };
      }
      return { score: 40, reason: 'Auxiliary logistics' };

    case 'Chemical / Industrial Hazard':
      if (resource.category === 'Ambulance') {
        return { score: 92, reason: 'Oxygen delivery & respiratory triage for toxic inhalation' };
      }
      if (resource.category === 'Volunteer Group') {
        return { score: 80, reason: 'Assisting in 500m radius perimeter evacuation' };
      }
      if (resource.category === 'Medical Supplies') {
        return { score: 85, reason: 'Antidotes, eye-wash saline and respiratory filters' };
      }
      return { score: 45, reason: 'Standby support' };

    default:
      if (resource.category === 'Ambulance') return { score: 80, reason: 'Standard medical emergency response' };
      if (resource.category === 'Medical Supplies') return { score: 75, reason: 'Primary healthcare supplies' };
      return { score: 50, reason: 'General emergency standby' };
  }
}

/**
 * Calculates allocation recommendations for a target incident
 */
export function getRecommendedResourcesForIncident(
  incident: Incident,
  allResources: ResourceItem[],
  strategy: 'Fastest Response' | 'Maximum Capacity' | 'Balanced' = 'Balanced',
  reservePercent: number = 15
): AllocationRecommendation[] {
  // Only evaluate resources that have at least some available capacity
  const eligible = allResources.filter(r => r.availableQuantity > 0 && r.status !== 'Maintenance' && r.status !== 'Exhausted');

  const recommendations: AllocationRecommendation[] = eligible.map(resource => {
    const distanceKm = calculateHaversineDistanceKm(
      incident.latitude,
      incident.longitude,
      resource.latitude,
      resource.longitude
    );

    const { score: suitabilityScore, reason: suitabilityReason } = getDomainSuitabilityScore(incident.incidentType, resource);

    // Distance proximity score (100 for <= 1 km, scaling down to 10 for >= 25 km)
    const distanceScore = Math.max(10, Math.min(100, Math.round(100 - distanceKm * 3.6)));

    // Availability score (percentage available vs total)
    const availabilityRatio = resource.availableQuantity / resource.totalQuantity;
    const availabilityScore = Math.round(availabilityRatio * 100);

    // Compute composite match score based on selected allocation strategy
    let matchScore = 0;
    if (strategy === 'Fastest Response') {
      matchScore = Math.round(distanceScore * 0.55 + suitabilityScore * 0.30 + availabilityScore * 0.15);
    } else if (strategy === 'Maximum Capacity') {
      matchScore = Math.round(availabilityScore * 0.50 + suitabilityScore * 0.30 + distanceScore * 0.20);
    } else {
      // Balanced
      matchScore = Math.round(suitabilityScore * 0.40 + distanceScore * 0.35 + availabilityScore * 0.25);
    }

    // Determine quantity to recommend based on incident severity
    const reservedQuantity = Math.ceil((resource.totalQuantity * reservePercent) / 100);
    const safeDeployable = Math.max(1, resource.availableQuantity - reservedQuantity);

    let recommendedQuantity = 1;
    if (resource.category === 'Food & Ration') {
      recommendedQuantity = incident.severity === 'Critical' ? Math.min(150, safeDeployable) : Math.min(50, safeDeployable);
    } else if (resource.category === 'Potable Water') {
      recommendedQuantity = incident.severity === 'Critical' ? Math.min(2, safeDeployable) : 1;
    } else if (resource.category === 'Medical Supplies') {
      recommendedQuantity = incident.severity === 'Critical' ? Math.min(25, safeDeployable) : Math.min(10, safeDeployable);
    } else if (resource.category === 'Volunteer Group') {
      recommendedQuantity = incident.severity === 'Critical' ? Math.min(15, safeDeployable) : Math.min(5, safeDeployable);
    } else {
      recommendedQuantity = incident.severity === 'Critical' ? Math.min(2, safeDeployable) : 1;
    }

    if (recommendedQuantity <= 0) recommendedQuantity = 1;
    if (recommendedQuantity > resource.availableQuantity) recommendedQuantity = resource.availableQuantity;

    // Classify priority
    let priorityLevel: 'Immediate' | 'Secondary' | 'Support' = 'Support';
    if (matchScore >= 75) {
      priorityLevel = 'Immediate';
    } else if (matchScore >= 50) {
      priorityLevel = 'Secondary';
    }

    // Build transparent rationale string
    const rationale = `${suitabilityReason}. Base is located ${distanceKm} km from ${incident.locationName} (${resource.availableQuantity} of ${resource.totalQuantity} ${resource.unit} currently free).`;

    return {
      resourceId: resource.id,
      resourceName: resource.name,
      category: resource.category,
      distanceKm,
      recommendedQuantity,
      matchScore,
      rationale,
      priorityLevel
    };
  });

  // Sort descending by match score
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}
